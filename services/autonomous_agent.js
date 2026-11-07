/**
 * services/autonomous_agent.js
 * Автономный фоновый ИИ-Агент поиска, верификации и обновления базы заведений Кавказа
 * Работает 24/7 без ручного вмешательства:
 * 1. Сканирует пул кандидатов и гео-точки Кавказа
 * 2. Проводит 6 уровней строгой валидации (координаты, гео-фенсинг, дубликаты, фото, скидки)
 * 3. Автоматически вносит верифицированные точки в базу данных
 * 4. Обновляет seed-файлы для автономного режима (GitHub Pages)
 * 5. Автоматически деплоит изменения в репозиторий GitHub
 * 6. Ведёт подробный журнал аудита для панели управления
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { db } from '../data/database.js';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const STATE_FILE = path.join(ROOT, 'data', 'agent_state.json');
const LOGS_FILE = path.join(ROOT, 'data', 'agent_logs.json');
const DB_FILE = path.join(ROOT, 'data', 'db.json');

// Гео-границы регионов Кавказа для верификации (Geo-fencing)
export const CAUCASUS_BOUNDS = {
  "Приэльбрусье": { minLat: 43.10, maxLat: 43.45, minLng: 42.30, maxLng: 42.90, name: "Приэльбрусье (КБР)" },
  "Архыз": { minLat: 43.35, maxLat: 43.70, minLng: 41.05, maxLng: 41.45, name: "Архыз (КЧР)" },
  "Домбай": { minLat: 43.15, maxLat: 43.55, minLng: 41.50, maxLng: 41.85, name: "Домбай & Теберда (КЧР)" },
  "Нальчик": { minLat: 43.20, maxLat: 43.80, minLng: 43.00, maxLng: 43.80, name: "Нальчик & КБР" },
  "Карачаево-Черкесия": { minLat: 43.80, maxLat: 44.50, minLng: 41.50, maxLng: 42.40, name: "КЧР & Черкесск" },
  "Пятигорск": { minLat: 43.98, maxLat: 44.15, minLng: 42.95, maxLng: 43.18, name: "Пятигорск (КМВ)" },
  "Кисловодск": { minLat: 43.85, maxLat: 43.98, minLng: 42.60, maxLng: 42.80, name: "Кисловодск (КМВ)" },
  "Ессентуки": { minLat: 44.00, maxLat: 44.10, minLng: 42.80, maxLng: 42.95, name: "Ессентуки (КМВ)" },
  "Железноводск": { minLat: 44.10, maxLat: 44.20, minLng: 42.98, maxLng: 43.10, name: "Железноводск (КМВ)" },
  "Владикавказ": { minLat: 42.70, maxLat: 43.20, minLng: 44.15, maxLng: 44.85, name: "Владикавказ & РСО-Алания" },
  "Махачкала": { minLat: 42.20, maxLat: 43.25, minLng: 46.50, maxLng: 47.70, name: "Махачкала & Дагестан" },
  "Дербент": { minLat: 41.95, maxLat: 42.15, minLng: 48.20, maxLng: 48.38, name: "Дербент (Дагестан)" }
};

export class AutonomousAgentService {
  constructor() {
    this.state = {
      enabled: true,
      intervalHours: 24, // Ежедневный запуск
      lastRun: null,
      nextRun: null,
      isRunning: false,
      metrics: {
        totalCycles: 0,
        totalScanned: 0,
        totalApproved: 0,
        totalRejected: 0,
        totalDeployed: 0
      }
    };
    this.logs = [];
    this.candidateQueue = [];
    this.timer = null;
    this.loadState();
    this.loadLogs();
  }

  loadState() {
    try {
      if (fs.existsSync(STATE_FILE)) {
        const data = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
        this.state = { ...this.state, ...data, isRunning: false };
      }
    } catch (e) {
      console.error('[Agent] Ошибка загрузки состояния:', e.message);
    }
  }

  saveState() {
    try {
      fs.writeFileSync(STATE_FILE, JSON.stringify(this.state, null, 2), 'utf8');
    } catch (e) {
      console.error('[Agent] Ошибка сохранения состояния:', e.message);
    }
  }

  loadLogs() {
    try {
      if (fs.existsSync(LOGS_FILE)) {
        this.logs = JSON.parse(fs.readFileSync(LOGS_FILE, 'utf8'));
      }
    } catch (e) {
      this.logs = [];
    }
  }

  saveLogs() {
    try {
      if (this.logs.length > 500) {
        this.logs = this.logs.slice(-500);
      }
      fs.writeFileSync(LOGS_FILE, JSON.stringify(this.logs, null, 2), 'utf8');
    } catch (e) {
      console.error('[Agent] Ошибка сохранения логов:', e.message);
    }
  }

  log(level, stage, message, meta = null) {
    const entry = {
      id: 'log-' + crypto.randomBytes(4).toString('hex'),
      timestamp: new Date().toISOString(),
      level, // 'info', 'success', 'warn', 'error'
      stage, // 'DISCOVERY', 'VERIFICATION', 'INGEST', 'DEPLOY', 'CYCLE'
      message,
      meta
    };
    this.logs.push(entry);
    this.saveLogs();
    const tag = `[${stage}]`.padEnd(16);
    console.log(`🤖 [Agent ${entry.timestamp.slice(11, 19)}] ${tag} ${message}`);
  }

  generateDiscoveryBatch(existingBusinesses) {
    const POOL_FILE = path.join(ROOT, 'data', 'candidate_pool.json');
    if (!fs.existsSync(POOL_FILE)) return 0;
    try {
      const pool = JSON.parse(fs.readFileSync(POOL_FILE, 'utf8'));
      const existingIds = new Set(existingBusinesses.map(b => b.id));
      const candidates = pool.filter(c => !existingIds.has(c.id));
      if (candidates.length > 0) {
        const batch = candidates.slice(0, 4);
        this.queueCandidates(batch);
        this.log('info', 'DISCOVERY', `🔎 Автоматический сканер отобрал ${batch.length} новых объектов Кавказа из пула`);
        return batch.length;
      }
    } catch (e) {
      this.log('warn', 'DISCOVERY', `Ошибка чтения пула кандидатов: ${e.message}`);
    }
    return 0;
  }

  /**
   * Добавление кандидатов в очередь
   */
  queueCandidates(items) {
    let added = 0;
    for (const item of items) {
      if (!this.candidateQueue.some(c => c.id === item.id)) {
        this.candidateQueue.push(item);
        added++;
      }
    }
    if (added > 0) {
      this.log('info', 'DISCOVERY', `В очередь обработки добавлено ${added} кандидатов`);
    }
    return added;
  }

  /**
   * 6 уровней строгой валидации заведения
   */
  verifyBusiness(biz, existingBusinesses) {
    // Уровень 1: Обязательные поля
    const requiredFields = ['id', 'name', 'category', 'city', 'address', 'lat', 'lng', 'phone', 'discountPercent'];
    for (const f of requiredFields) {
      if (biz[f] === undefined || biz[f] === null || biz[f] === '') {
        return { valid: false, reason: `Отсутствует обязательное поле: ${f}` };
      }
    }

    // Уровень 2: Проверка координат и геофенсинга
    const lat = parseFloat(biz.lat);
    const lng = parseFloat(biz.lng);
    if (isNaN(lat) || isNaN(lng) || lat < 40 || lat > 46 || lng < 40 || lng > 50) {
      return { valid: false, reason: `Некорректные координаты [${biz.lat}, ${biz.lng}] вне Кавказского региона` };
    }

    const bounds = CAUCASUS_BOUNDS[biz.city];
    if (bounds) {
      if (lat < bounds.minLat || lat > bounds.maxLat || lng < bounds.minLng || lng > bounds.maxLng) {
        return {
          valid: false,
          reason: `Гео-локация заведения [${lat}, ${lng}] выходит за пределы кластера "${biz.city}" (${bounds.name})`
        };
      }
    }

    // Уровень 3: Защита от дубликатов (ID, нормализованное имя, расстояние)
    const normalizedName = biz.name.toLowerCase().replace(/[^a-zа-я0-9]/gi, '');
    for (const existing of existingBusinesses) {
      if (existing.id === biz.id) {
        return { valid: false, reason: `Дубликат ID: "${biz.id}" уже существует в базе` };
      }
      const existingNormName = existing.name.toLowerCase().replace(/[^a-zа-я0-9]/gi, '');
      if (existingNormName === normalizedName && existing.city === biz.city) {
        return { valid: false, reason: `Дубликат названия: заведение "${existing.name}" уже есть в г. ${biz.city}` };
      }

      // Проверка сверхблизкого расположения (< 60 метров) с похожим именем
      const distKm = this.calculateDistanceKm(lat, lng, existing.lat, existing.lng);
      if (distKm < 0.06 && existing.city === biz.city) {
        const wordsA = new Set(biz.name.toLowerCase().split(/\s+/));
        const wordsB = existing.name.toLowerCase().split(/\s+/);
        const common = wordsB.filter(w => wordsA.has(w) && w.length > 3);
        if (common.length >= 2) {
          return { valid: false, reason: `Ближайший дубликат (расстояние ${Math.round(distKm * 1000)}м) с заведением "${existing.name}"` };
        }
      }
    }

    // Уровень 4: Валидация скидок и условий
    const discount = parseInt(biz.discountPercent, 10);
    if (isNaN(discount) || discount < 10 || discount > 50) {
      return { valid: false, reason: `Недопустимый процент скидки: ${biz.discountPercent}% (разрешено от 10% до 50%)` };
    }

    // Уровень 5: Валидация телефона
    const phoneClean = biz.phone.replace(/[^0-9]/g, '');
    if (phoneClean.length < 10) {
      return { valid: false, reason: `Некорректный номер телефона: ${biz.phone}` };
    }

    // Уровень 6: Валидация изображения
    if (biz.image && !biz.image.startsWith('http://') && !biz.image.startsWith('https://')) {
      return { valid: false, reason: `Некорректный URL фотографии: ${biz.image}` };
    }

    return { valid: true };
  }

  calculateDistanceKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Запуск полного автономного цикла
   */
  async runCycle(force = false) {
    if (this.state.isRunning) {
      this.log('warn', 'CYCLE', 'Цикл уже выполняется, пропускаем повторный запуск');
      return { success: false, message: 'Цикл уже выполняется' };
    }

    if (!this.state.enabled && !force) {
      this.log('info', 'CYCLE', 'Автономный режим выключен');
      return { success: false, message: 'Автономный режим выключен' };
    }

    this.state.isRunning = true;
    const cycleStart = new Date();
    this.log('info', 'CYCLE', `🚀 Старт автономного цикла верификации и обновления базы...`);

    try {
      // 1. Читаем текущую базу данных
      if (!fs.existsSync(DB_FILE)) {
        throw new Error(`Файл базы данных ${DB_FILE} не найден`);
      }
      const dbData = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      const existingBusinesses = dbData.businesses || [];
      const initialCount = existingBusinesses.length;

      this.log('info', 'DISCOVERY', `Текущая база: ${initialCount} заведений. Кандидатов в очереди: ${this.candidateQueue.length}`);

      if (this.candidateQueue.length === 0) {
        this.log('info', 'DISCOVERY', '🔍 Очередь пуста. Запуск сканирования пула кандидатов Кавказа...');
        this.generateDiscoveryBatch(existingBusinesses);
      }

      // 2. Обрабатываем очередь кандидатов
      const approved = [];
      const rejected = [];

      while (this.candidateQueue.length > 0) {
        const candidate = this.candidateQueue.shift();
        this.state.metrics.totalScanned++;

        const verification = this.verifyBusiness(candidate, [...existingBusinesses, ...approved]);
        if (verification.valid) {
          // Гарантируем чистоту структуры
          const cleaned = {
            id: candidate.id,
            name: candidate.name.trim(),
            category: candidate.category,
            categoryName: candidate.categoryName || "Заведения",
            city: candidate.city,
            address: candidate.address.trim(),
            lat: parseFloat(candidate.lat),
            lng: parseFloat(candidate.lng),
            phone: candidate.phone.trim(),
            website: candidate.website || "",
            workHours: candidate.workHours || "Ежедневно: 09:00 — 22:00",
            discountPercent: parseInt(candidate.discountPercent, 10),
            discountBadge: candidate.discountBadge || `-${candidate.discountPercent}% НА ВСЁ МЕНЮ`,
            discountText: candidate.discountText || `Скидка ${candidate.discountPercent}% за отзыв на Яндекс Картах`,
            conditions: candidate.conditions || "Покажите QR-купон официанту до оформления счёта.",
            rating: parseFloat(candidate.rating) || 4.9,
            reviewCount: parseInt(candidate.reviewCount, 10) || 120,
            image: candidate.image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=700&auto=format&fit=crop&q=80",
            qrScans: parseInt(candidate.qrScans, 10) || 1000,
            isActive: true,
            createdAt: candidate.createdAt || new Date().toISOString(),
            verifiedByAgentAt: new Date().toISOString()
          };
          approved.push(cleaned);
          this.state.metrics.totalApproved++;
          this.log('success', 'VERIFICATION', `✅ [ОДОБРЕНО] ${cleaned.name} (${cleaned.city}) — скидка ${cleaned.discountPercent}%`);
        } else {
          rejected.push({ candidate, reason: verification.reason });
          this.state.metrics.totalRejected++;
          this.log('warn', 'VERIFICATION', `❌ [ОТКЛОНЕНО] ${candidate.name || candidate.id}: ${verification.reason}`);
        }
      }

      // 3. Если есть одобренные точки — сохраняем и генерируем сид
      let deployed = false;
      if (approved.length > 0) {
        dbData.businesses = [...existingBusinesses, ...approved];
        dbData.stats.totalBusinesses = dbData.businesses.length;
        dbData.stats.activeBusinesses = dbData.businesses.filter(b => b.isActive).length;

        // Сохраняем в data/db.json
        fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2), 'utf8');
        try { db.init(); } catch (e) {}
        this.log('success', 'INGEST', `💾 База данных обновлена: было ${initialCount}, стало ${dbData.businesses.length} (+${approved.length})`);

        // Обновляем public/js/data-seed.js и js/data-seed.js
        const newVersion = `2.${dbData.businesses.length}.0`;
        const seedPayload = {
          cities: dbData.cities,
          categories: dbData.categories,
          businesses: dbData.businesses,
          admins: (dbData.users || []).map(({ passwordHash, ...safe }) => safe),
          reviews: dbData.reviews || [],
          coupons: dbData.coupons || [],
          version: newVersion
        };
        const seedJsContent = `// Автоматически сгенерированный сид данных для автономного режима (GitHub Pages)
// Создан Автономным ИИ-Агентом: ${new Date().toISOString()}
// Всего заведений: ${dbData.businesses.length}
window.RFSKIDKI_INITIAL_DATA = ${JSON.stringify(seedPayload, null, 2)};
`;
        fs.writeFileSync(path.join(ROOT, 'public', 'js', 'data-seed.js'), seedJsContent, 'utf8');
        fs.writeFileSync(path.join(ROOT, 'js', 'data-seed.js'), seedJsContent, 'utf8');
        this.log('success', 'INGEST', `✨ Seed-файлы обновлены (версия ${newVersion}, ${dbData.businesses.length} заведений)`);

        // 4. Автоматический деплой через Git (если есть изменения)
        try {
          this.log('info', 'DEPLOY', `🚀 Выполняем авто-коммит и деплой на GitHub Pages...`);
          await execAsync('git add -A', { cwd: ROOT });
          const commitMsg = `feat(agent): авто-верификация и добавление ${approved.length} заведений Кавказа (всего: ${dbData.businesses.length})`;
          await execAsync(`git commit -m "${commitMsg}"`, { cwd: ROOT });
          await execAsync('git push origin main', { cwd: ROOT });
          this.state.metrics.totalDeployed += approved.length;
          deployed = true;
          this.log('success', 'DEPLOY', `🎉 Успешный деплой на GitHub Pages! Новые заведения уже онлайн.`);
        } catch (gitErr) {
          this.log('warn', 'DEPLOY', `Предупреждение при git push: ${gitErr.message}`);
        }
      } else {
        this.log('info', 'CYCLE', `Новых заведений для добавления в этом цикле не найдено. База актуальна.`);
      }

      this.state.lastRun = cycleStart.toISOString();
      this.state.nextRun = new Date(Date.now() + this.state.intervalHours * 3600000).toISOString();
      this.state.metrics.totalCycles++;
      this.saveState();

      const summary = {
        success: true,
        scanned: approved.length + rejected.length,
        approved: approved.length,
        rejected: rejected.length,
        totalInDb: existingBusinesses.length + approved.length,
        deployed,
        nextRun: this.state.nextRun
      };
      this.log('success', 'CYCLE', `🏁 Цикл завершён успешно: +${approved.length} добавлено, отклонено ${rejected.length}. Следующий запуск: ${this.state.nextRun}`);
      return summary;
    } catch (err) {
      this.log('error', 'CYCLE', `Ошибка при выполнении автономного цикла: ${err.message}`);
      return { success: false, error: err.message };
    } finally {
      this.state.isRunning = false;
      this.saveState();
    }
  }

  /**
   * Запуск фонового демона
   */
  startDaemon() {
    if (this.timer) clearInterval(this.timer);
    
    // Проверяем каждые 15 минут, пора ли запускать цикл
    const checkIntervalMs = 15 * 60 * 1000;
    this.timer = setInterval(() => {
      if (!this.state.enabled || this.state.isRunning) return;
      if (!this.state.nextRun || new Date() >= new Date(this.state.nextRun)) {
        this.log('info', 'DAEMON', '⏰ Сработал таймер расписания. Запуск ежедневного цикла агента...');
        this.runCycle();
      }
    }, checkIntervalMs);

    this.log('info', 'DAEMON', `🟢 Автономный демон запущен (интервал: каждые ${this.state.intervalHours} ч). Статус: АКТИВЕН 24/7`);
  }

  stopDaemon() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.log('info', 'DAEMON', 'Демон остановлен');
  }

  getStatus() {
    return {
      ...this.state,
      queueLength: this.candidateQueue.length,
      logsCount: this.logs.length,
      recentLogs: this.logs.slice(-20).reverse()
    };
  }

  toggle(enabled) {
    this.state.enabled = Boolean(enabled);
    this.saveState();
    this.log('info', 'CONFIG', `Автономный режим ${this.state.enabled ? 'ВКЛЮЧЕН' : 'ВЫКЛЮЧЕН'}`);
    return this.state.enabled;
  }
}

export const autonomousAgent = new AutonomousAgentService();
