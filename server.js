import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
import { db, CATEGORIES, CITIES } from './data/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

// MIME типы для статики
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2'
};

// Простой механизм сессий/токенов в памяти (с авто-продлением)
const SESSIONS = new Map();

function createSession(user) {
  const token = crypto.randomBytes(32).toString('hex');
  const session = {
    token,
    user,
    expiresAt: Date.now() + 86400000 * 30 // 30 дней
  };
  SESSIONS.set(token, session);
  return token;
}

function getSessionUser(req) {
  const authHeader = req.headers['authorization'] || '';
  let token = '';
  if (authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else {
    // Также проверяем cookie
    const cookies = req.headers['cookie'] || '';
    const match = cookies.match(/skidki_token=([^;]+)/);
    if (match) token = match[1];
  }

  if (!token) return null;
  const session = SESSIONS.get(token);
  if (!session) return null;
  if (session.expiresAt < Date.now()) {
    SESSIONS.delete(token);
    return null;
  }
  return session.user;
}

// Утилита для отправки JSON-ответа
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

// Утилита для чтения тела запроса
function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 5 * 1024 * 1024) { // Лимит 5 МБ
        reject(new Error('Размер запроса превышает допустимый лимит (5 MB)'));
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error('Некорректный JSON в теле запроса'));
      }
    });
    req.on('error', reject);
  });
}

// Сервер HTTP
const server = http.createServer(async (req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    });
    return res.end();
  }

  const reqUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = reqUrl.pathname;
  const params = Object.fromEntries(reqUrl.searchParams.entries());

  // Лог запросов
  // console.log(`[REQ] ${req.method} ${pathname}`);

  try {
    // ==========================================
    // API ЭНДПОИНТЫ
    // ==========================================

    if (pathname.startsWith('/api/')) {
      // 1. Заведения / Бизнесы
      if (pathname === '/api/businesses' && req.method === 'GET') {
        const businesses = db.getBusinesses(params);
        return sendJson(res, 200, { success: true, count: businesses.length, data: businesses });
      }

      if (pathname.match(/^\/api\/businesses\/([a-zA-Z0-9_-]+)$/) && req.method === 'GET') {
        const id = pathname.split('/')[3];
        const biz = db.getBusinessById(id);
        if (!biz) return sendJson(res, 404, { success: false, message: 'Заведение не найдено' });
        return sendJson(res, 200, { success: true, data: biz });
      }

      if (pathname === '/api/businesses' && req.method === 'POST') {
        const user = getSessionUser(req);
        if (!user || !['super_admin', 'admin', 'manager'].includes(user.role)) {
          return sendJson(res, 403, { success: false, message: 'Недостаточно прав администратора' });
        }
        const body = await readRequestBody(req);
        if (!body.name || !body.address) {
          return sendJson(res, 400, { success: false, message: 'Название и адрес обязательны' });
        }
        const created = db.addBusiness(body);
        return sendJson(res, 201, { success: true, message: 'Бизнес успешно добавлен на карту', data: created });
      }

      if (pathname.match(/^\/api\/businesses\/([a-zA-Z0-9_-]+)$/) && req.method === 'PUT') {
        const user = getSessionUser(req);
        if (!user || !['super_admin', 'admin', 'manager'].includes(user.role)) {
          return sendJson(res, 403, { success: false, message: 'Недостаточно прав администратора' });
        }
        const id = pathname.split('/')[3];
        const body = await readRequestBody(req);
        const updated = db.updateBusiness(id, body);
        if (!updated) return sendJson(res, 404, { success: false, message: 'Заведение не найдено' });
        return sendJson(res, 200, { success: true, message: 'Данные заведения обновлены', data: updated });
      }

      if (pathname.match(/^\/api\/businesses\/([a-zA-Z0-9_-]+)$/) && req.method === 'DELETE') {
        const user = getSessionUser(req);
        if (!user || !['super_admin', 'admin'].includes(user.role)) {
          return sendJson(res, 403, { success: false, message: 'Недостаточно прав администратора' });
        }
        const id = pathname.split('/')[3];
        const deleted = db.deleteBusiness(id);
        if (!deleted) return sendJson(res, 404, { success: false, message: 'Заведение не найдено' });
        return sendJson(res, 200, { success: true, message: 'Заведение удалено' });
      }

      // 2. Категории и города
      if (pathname === '/api/categories' && req.method === 'GET') {
        return sendJson(res, 200, { success: true, data: CATEGORIES });
      }

      if (pathname === '/api/cities' && req.method === 'GET') {
        return sendJson(res, 200, { success: true, data: CITIES });
      }

      // 3. Отзывы и получение скидки (QR-воронка)
      if (pathname === '/api/reviews' && req.method === 'POST') {
        const body = await readRequestBody(req);
        if (!body.businessId) {
          return sendJson(res, 400, { success: false, message: 'Не указан ID заведения' });
        }
        if (!body.userName || !body.comment) {
          return sendJson(res, 400, { success: false, message: 'Имя и текст отзыва обязательны для получения скидки' });
        }
        const result = db.submitReviewAndIssueCoupon(body);
        return sendJson(res, 201, {
          success: true,
          message: 'Отзыв принят! Ваша скидка и купон успешно сгенерированы 🎉',
          data: result
        });
      }

      if (pathname === '/api/reviews' && req.method === 'GET') {
        const reviews = db.getReviews(params);
        return sendJson(res, 200, { success: true, count: reviews.length, data: reviews });
      }

      if (pathname.match(/^\/api\/reviews\/([a-zA-Z0-9_-]+)\/status$/) && req.method === 'PUT') {
        const user = getSessionUser(req);
        if (!user || !['super_admin', 'admin', 'moderator'].includes(user.role)) {
          return sendJson(res, 403, { success: false, message: 'Требуются права модератора' });
        }
        const id = pathname.split('/')[3];
        const body = await readRequestBody(req);
        const updated = db.updateReviewStatus(id, body.status);
        if (!updated) return sendJson(res, 404, { success: false, message: 'Отзыв не найден' });
        return sendJson(res, 200, { success: true, message: 'Статус отзыва обновлен', data: updated });
      }

      if (pathname.match(/^\/api\/reviews\/([a-zA-Z0-9_-]+)$/) && req.method === 'DELETE') {
        const user = getSessionUser(req);
        if (!user || !['super_admin', 'admin', 'moderator'].includes(user.role)) {
          return sendJson(res, 403, { success: false, message: 'Требуются права модератора' });
        }
        const id = pathname.split('/')[3];
        const deleted = db.deleteReview(id);
        if (!deleted) return sendJson(res, 404, { success: false, message: 'Отзыв не найден' });
        return sendJson(res, 200, { success: true, message: 'Отзыв удален' });
      }

      // 4. Проверка и погашение купонов (на кассе заведения)
      if (pathname.match(/^\/api\/coupons\/([a-zA-Z0-9_-]+)$/) && req.method === 'GET') {
        const code = pathname.split('/')[3];
        const coupon = db.getCouponByCode(code);
        if (!coupon) return sendJson(res, 404, { success: false, message: 'Купон не найден' });
        return sendJson(res, 200, { success: true, data: coupon });
      }

      if (pathname === '/api/coupons/redeem' && req.method === 'POST') {
        const body = await readRequestBody(req);
        if (!body.code) return sendJson(res, 400, { success: false, message: 'Введите код купона' });
        const result = db.redeemCoupon(body.code, body.redeemedBy || 'Кассир заведения');
        return sendJson(res, result.success ? 200 : 400, result);
      }

      // 5. Авторизация и профиль
      if (pathname === '/api/auth/login' && req.method === 'POST') {
        const body = await readRequestBody(req);
        if (!body.email || !body.password) {
          return sendJson(res, 400, { success: false, message: 'Введите email и пароль' });
        }
        const user = db.authenticateUser(body.email, body.password);
        if (!user) {
          return sendJson(res, 401, { success: false, message: 'Неверный email или пароль' });
        }
        const token = createSession(user);
        return sendJson(res, 200, {
          success: true,
          message: `Добро пожаловать, ${user.name}!`,
          token,
          user
        });
      }

      if (pathname === '/api/auth/me' && req.method === 'GET') {
        const user = getSessionUser(req);
        if (!user) return sendJson(res, 401, { success: false, message: 'Сессия не найдена или истекла' });
        return sendJson(res, 200, { success: true, user });
      }

      // 6. Управление администраторами (панель управления)
      if (pathname === '/api/admin/admins' && req.method === 'GET') {
        const user = getSessionUser(req);
        if (!user || !['super_admin', 'admin'].includes(user.role)) {
          return sendJson(res, 403, { success: false, message: 'Доступ только для главного администратора' });
        }
        const admins = db.getAdmins();
        return sendJson(res, 200, { success: true, data: admins });
      }

      if (pathname === '/api/admin/admins' && req.method === 'POST') {
        const user = getSessionUser(req);
        if (!user || user.role !== 'super_admin') {
          return sendJson(res, 403, { success: false, message: 'Только Главный администратор может назначать новых администраторов' });
        }
        const body = await readRequestBody(req);
        if (!body.email || !body.password || !body.name) {
          return sendJson(res, 400, { success: false, message: 'Заполните имя, email и пароль нового администратора' });
        }
        try {
          const newAdmin = db.createAdmin(body);
          return sendJson(res, 201, { success: true, message: `Администратор ${newAdmin.name} успешно назначен`, data: newAdmin });
        } catch (err) {
          return sendJson(res, 400, { success: false, message: err.message });
        }
      }

      if (pathname.match(/^\/api\/admin\/admins\/([a-zA-Z0-9_-]+)$/) && req.method === 'PUT') {
        const user = getSessionUser(req);
        if (!user || user.role !== 'super_admin') {
          return sendJson(res, 403, { success: false, message: 'Только Главный администратор может изменять роли' });
        }
        const id = pathname.split('/')[4];
        const body = await readRequestBody(req);
        const updated = db.updateAdmin(id, body);
        if (!updated) return sendJson(res, 404, { success: false, message: 'Администратор не найден' });
        return sendJson(res, 200, { success: true, message: 'Данные администратора обновлены', data: updated });
      }

      if (pathname.match(/^\/api\/admin\/admins\/([a-zA-Z0-9_-]+)$/) && req.method === 'DELETE') {
        const user = getSessionUser(req);
        if (!user || user.role !== 'super_admin') {
          return sendJson(res, 403, { success: false, message: 'Только Главный администратор может отзывать доступ' });
        }
        const id = pathname.split('/')[4];
        try {
          const ok = db.deleteAdmin(id);
          if (!ok) return sendJson(res, 404, { success: false, message: 'Администратор не найден' });
          return sendJson(res, 200, { success: true, message: 'Права администратора успешно отозваны' });
        } catch (err) {
          return sendJson(res, 400, { success: false, message: err.message });
        }
      }

      // 7. Аналитика и статистика
      if (pathname === '/api/admin/stats' && req.method === 'GET') {
        const user = getSessionUser(req);
        if (!user || !['super_admin', 'admin', 'moderator', 'manager'].includes(user.role)) {
          return sendJson(res, 403, { success: false, message: 'Доступ закрыт' });
        }
        const stats = db.getStats();
        return sendJson(res, 200, { success: true, data: stats });
      }

      // 8. Фиксация перехода по QR
      if (pathname === '/api/qr/scan' && req.method === 'POST') {
        const body = await readRequestBody(req);
        const result = db.recordQrScan(body.businessId, body.source);
        return sendJson(res, 200, { success: true, result });
      }

      // 9. Настройки сайта
      if (pathname === '/api/settings' && req.method === 'GET') {
        return sendJson(res, 200, { success: true, data: db.getSettings() });
      }

      if (pathname === '/api/settings' && req.method === 'PUT') {
        const user = getSessionUser(req);
        if (!user || user.role !== 'super_admin') {
          return sendJson(res, 403, { success: false, message: 'Только Главный администратор может менять системные настройки' });
        }
        const body = await readRequestBody(req);
        const updated = db.updateSettings(body);
        return sendJson(res, 200, { success: true, message: 'Настройки сохранены', data: updated });
      }

      // Если эндпоинт API не найден
      return sendJson(res, 404, { success: false, message: `API эндпоинт ${req.method} ${pathname} не найден` });
    }

    // ==========================================
    // СТАТИЧЕСКИЕ ФАЙЛЫ
    // ==========================================

    let safePath = pathname;
    if (safePath === '/' || safePath === '') {
      safePath = '/index.html';
    } else if (safePath === '/admin' || safePath === '/admin/') {
      safePath = '/admin.html';
    }

    const filePath = path.join(PUBLIC_DIR, safePath);

    // Защита от Directory Traversal
    if (!filePath.startsWith(PUBLIC_DIR)) {
      res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('403 Forbidden');
    }

    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        // Если запрашивают несуществующую страницу, отдаем index.html для SPA или 404
        const fallbackPath = path.join(PUBLIC_DIR, 'index.html');
        if (fs.existsSync(fallbackPath) && !path.extname(safePath)) {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          return fs.createReadStream(fallbackPath).pipe(res);
        }
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end('404 Not Found');
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache'
      });
      fs.createReadStream(filePath).pipe(res);
    });

  } catch (err) {
    console.error(`[SERVER ERROR] ${req.method} ${pathname}:`, err);
    sendJson(res, 500, { success: false, message: 'Внутренняя ошибка сервера: ' + err.message });
  }
});

server.listen(PORT, () => {
  console.log(`
========================================================================
🚀 Хаб Скидок и Бонусов по QR-кодам успешно запущен!
📍 Клиентский сайт с Яндекс Картами: http://localhost:${PORT}
⚙️ Панель управления (Админка):       http://localhost:${PORT}/admin.html
🔑 Логин админа:   admin@skidki.ru   |  Пароль: admin123
🔑 Логин модератора: moderator@skidki.ru | Пароль: mod123
========================================================================
  `);
});
