import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { ALL_BUSINESSES } from './businesses_all_148.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const CATEGORIES = [
  { id: "all", name: "Все заведения", icon: "🌟" },
  { id: "restaurants", name: "Рестораны и кафе", icon: "🍔" },
  { id: "coffee", name: "Кофейни и пекарни", icon: "☕" },
  { id: "auto", name: "Автомойки и детейлинг", icon: "🚗" },
  { id: "beauty", name: "Красота и барбершопы", icon: "✂️" },
  { id: "spa", name: "Спа, термы и бани", icon: "🧖" },
  { id: "fitness", name: "Спорт и фитнес", icon: "🏋️" },
  { id: "entertainment", name: "Туризм, прокаты и экстрим", icon: "🏔️" },
  { id: "taxi", name: "Такси и трансферы", icon: "🚕" },
  { id: "medical", name: "Здоровье и медицина", icon: "💊" }
];

const CITIES = [
  { name: "Приэльбрусье", center: [43.2558, 42.5117], zoom: 12, region: "Эльбрус (КБР)" },
  { name: "Архыз", center: [43.5614, 41.2789], zoom: 12, region: "КЧР" },
  { name: "Домбай", center: [43.2921, 41.6267], zoom: 13, region: "КЧР" },
  { name: "Нальчик", center: [43.4853, 43.6071], zoom: 13, region: "КБР" },
  { name: "Карачаево-Черкесия", center: [44.2233, 42.0578], zoom: 11, region: "КЧР" },
  { name: "Пятигорск", center: [44.0486, 43.0594], zoom: 13, region: "КМВ" },
  { name: "Кисловодск", center: [43.9056, 42.7156], zoom: 13, region: "КМВ" },
  { name: "Ессентуки", center: [44.0436, 42.8617], zoom: 13, region: "КМВ" },
  { name: "Железноводск", center: [44.1350, 43.0280], zoom: 13, region: "КМВ" },
  { name: "Владикавказ", center: [43.0211, 44.6819], zoom: 13, region: "Северная Осетия" },
  { name: "Махачкала", center: [42.9849, 47.5047], zoom: 12, region: "Дагестан" },
  { name: "Дербент", center: [42.0525, 48.2740], zoom: 13, region: "Дагестан" },
  { name: "Сочи", center: [43.5855, 39.7231], zoom: 12, region: "Юг" },
  { name: "Краснодар", center: [45.0355, 38.9753], zoom: 12, region: "Юг" },
  { name: "Москва", center: [55.7558, 37.6176], zoom: 11, region: "Центр" },
  { name: "Санкт-Петербург", center: [59.9343, 30.3351], zoom: 11, region: "Северо-Запад" }
];

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

const ADMIN_USERS = [
  {
    id: "admin-super",
    name: "Главный Администратор",
    email: "admin@skidki.ru",
    phone: "+7 (999) 000-00-01",
    passwordHash: hashPassword("admin123"),
    role: "super_admin",
    createdAt: "2026-11-06T10:00:00.000Z"
  },
  {
    id: "admin-moderator",
    name: "Модератор Отзывов",
    email: "moderator@skidki.ru",
    phone: "+7 (999) 000-00-02",
    passwordHash: hashPassword("mod123"),
    role: "moderator",
    createdAt: "2026-11-06T10:00:00.000Z"
  }
];

const INITIAL_REVIEWS = [
  {
    id: "rev-201",
    businessId: "biz-elbrus-kogutay",
    businessName: "Ресторан «Когутай»",
    userName: "Руслан Тебердиев",
    userPhone: "+7 (928) ***-45-67",
    rating: 5,
    comment: "Вид на ледник Семерка просто волшебный! Форель свежайшая, хычины горячие с хрустящей корочкой. Скидка 25% прошла сразу по купону на кассе!",
    status: "approved",
    couponCode: "ELBRUS-7712-VIP",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: "rev-202",
    businessId: "biz-arkhyz-tramplin",
    businessName: "Ресторан «Трамплин»",
    userName: "Диана Карданова",
    userPhone: "+7 (918) ***-11-22",
    rating: 5,
    comment: "После каталки в Архызе зашли в Трамплин. Глинтвейн и стейк на высшем уровне, обслуживание быстрое, сэкономили 1200 рублей!",
    status: "approved",
    couponCode: "ARKHYZ-5501-WIN",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: "rev-203",
    businessId: "biz-nalchik-sosruko",
    businessName: "Культовый ресторан «Сосруко»",
    userName: "Мурат Шогенов",
    userPhone: "+7 (928) ***-99-00",
    rating: 5,
    comment: "Легендарное место Нальчика. Вид с горы Кизиловка на город завораживает. Национальная кухня на высоте!",
    status: "approved",
    couponCode: "NALCHIK-9921-GIFT",
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString()
  },
  {
    id: "rev-204",
    businessId: "biz-arkhyz-piki",
    businessName: "Панорамный ресторан «Пики»",
    userName: "Алан Дзантиев",
    userPhone: "+7 (928) ***-33-21",
    rating: 5,
    comment: "Вид на Романтик и хребет Абишира-Ахуба фантастический! Скидка по QR сработала в 1 секунду. Спасибо за отличный сервис!",
    status: "approved",
    couponCode: "PIKI-3301-PROMO",
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: "rev-205",
    businessId: "biz-dombay-zula",
    businessName: "Легендарное кафе «У Зули» (Домбай)",
    userName: "Тимур Байрамуков",
    userPhone: "+7 (928) ***-55-12",
    rating: 5,
    comment: "Самые лучшие хычины и шурпа на всем Домбае! Уже 10 лет приезжаем только к Зуле. Скидка 25% за честный отзыв — приятный бонус!",
    status: "approved",
    couponCode: "DOMBAY-8812-GOLD",
    createdAt: new Date(Date.now() - 3600000 * 16).toISOString()
  },
  {
    id: "rev-206",
    businessId: "biz-kchr-zhemchuzhina",
    businessName: "Термальный комплекс «Жемчужина Кавказа»",
    userName: "Елена Смирнова",
    userPhone: "+7 (905) ***-67-89",
    rating: 5,
    comment: "Горячая минеральная вода в 8 бассейнах — просто блаженство! После купания чувствуешь себя заново рожденным. Купон предъявили на кассе без проблем.",
    status: "approved",
    couponCode: "KCHR-4421-SPA",
    createdAt: new Date(Date.now() - 3600000 * 20).toISOString()
  }
];

const INITIAL_COUPONS = [
  {
    id: "coup-201",
    code: "ELBRUS-7712-VIP",
    businessId: "biz-elbrus-kogutay",
    businessName: "Ресторан «Когутай»",
    businessCity: "Приэльбрусье",
    businessAddress: "КБР, Эльбрусский р-н, Поляна Чегет, 1",
    discountBadge: "-25% НА ВСЁ МЕНЮ",
    discountText: "Скидка 25% на нежнейший шашлык из баранины, жареную речную форель и горячий облепиховый глинтвейн с видом на ледник Семерка",
    conditions: "Покажите QR-купон официанту до закрытия счёта.",
    userName: "Руслан Тебердиев",
    userPhone: "+7 (928) ***-45-67",
    status: "active",
    redeemedAt: null,
    expiresAt: new Date(Date.now() + 86400000 * 14).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: "coup-202",
    code: "ARKHYZ-5501-WIN",
    businessId: "biz-arkhyz-tramplin",
    businessName: "Ресторан «Трамплин»",
    businessCity: "Архыз",
    businessAddress: "КЧР, пос. Романтик, ул. Горная, 1 (у канатных дорог)",
    discountBadge: "-25% НА ВСЁ МЕНЮ",
    discountText: "Скидка 25% на сытные завтраки перед каталкой, шашлык на углях, пиццу из печи и горный облепиховый глинтвейн",
    conditions: "Покажите QR-код официанту при расчёте.",
    userName: "Диана Карданова",
    userPhone: "+7 (918) ***-11-22",
    status: "active",
    redeemedAt: null,
    expiresAt: new Date(Date.now() + 86400000 * 14).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
  }
];

// 1. Создаем data/db.json
let currentDb = {};
try {
  currentDb = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'db.json'), 'utf8'));
} catch (e) {}

const bMap = new Map();
(currentDb.businesses || []).forEach(b => bMap.set(b.id, b));
ALL_BUSINESSES.forEach(b => bMap.set(b.id, b));
const FINAL_BUSINESSES = Array.from(bMap.values());

const fullDbData = {
  businesses: FINAL_BUSINESSES,
  cities: CITIES,
  categories: CATEGORIES,
  users: currentDb.users || ADMIN_USERS,
  reviews: currentDb.reviews || INITIAL_REVIEWS,
  coupons: currentDb.coupons || INITIAL_COUPONS,
  transfers: currentDb.transfers || [],
  stats: {
    totalReviews: 2450 + FINAL_BUSINESSES.length * 15,
    issuedCoupons: 3820 + FINAL_BUSINESSES.length * 20,
    redeemedCoupons: 2940 + FINAL_BUSINESSES.length * 12,
    totalQrScans: 48500 + FINAL_BUSINESSES.length * 250
  },
  settings: {
    siteName: "ХабСкидок.рф",
    tagline: "Скидки до 50% в Приэльбрусье, Архызе, Домбае, Нальчике, КЧР и на Кавказе за честный отзыв",
    defaultCity: "Приэльбрусье"
  }
};

const dbJsonPath = path.join(ROOT, 'data', 'db.json');
fs.writeFileSync(dbJsonPath, JSON.stringify(fullDbData, null, 2), 'utf8');
console.log(`[OK] db.json успешно записан (${FINAL_BUSINESSES.length} заведений) -> ${dbJsonPath}`);

// 2. Создаем public/js/data-seed.js и js/data-seed.js
const seedPayload = {
  cities: CITIES,
  categories: CATEGORIES,
  businesses: FINAL_BUSINESSES,
  admins: (fullDbData.users || []).map(({ passwordHash, ...safe }) => safe),
  reviews: fullDbData.reviews || [],
  coupons: fullDbData.coupons || [],
  transfers: fullDbData.transfers || [],
  version: `2.${FINAL_BUSINESSES.length}.0`
};

const seedJsContent = `// Автоматически сгенерированный сид данных для автономного режима (GitHub Pages)
// Дата генерации: ${new Date().toISOString()}
// Всего заведений: ${FINAL_BUSINESSES.length}
window.RFSKIDKI_INITIAL_DATA = ${JSON.stringify(seedPayload, null, 2)};
`;

fs.writeFileSync(path.join(ROOT, 'public', 'js', 'data-seed.js'), seedJsContent, 'utf8');
fs.writeFileSync(path.join(ROOT, 'js', 'data-seed.js'), seedJsContent, 'utf8');
console.log(`[OK] data-seed.js записан в public/js/ и js/`);

// 3. Создаем data/database.js
const databaseJsContent = `import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'db.json');

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return \`\${salt}:\${hash}\`;
}

export function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt, originalHash] = storedHash.split(':');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === originalHash;
}

export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round((R * c) * 10) / 10;
}

export const CATEGORIES = ${JSON.stringify(CATEGORIES, null, 2)};

export const CITIES = ${JSON.stringify(CITIES, null, 2)};

export const INITIAL_BUSINESSES = ${JSON.stringify(FINAL_BUSINESSES, null, 2)};

export class Database {
  constructor() {
    this.data = {
      businesses: [],
      users: [],
      reviews: [],
      coupons: [],
      transfers: [],
      stats: {
        totalReviews: 2450,
        issuedCoupons: 3820,
        redeemedCoupons: 2940,
        totalQrScans: 48500
      },
      settings: {
        siteName: "ХабСкидок.рф",
        tagline: "Скидки до 50% в Приэльбрусье, Архызе, Домбае, Нальчике, КЧР и на Кавказе за честный отзыв",
        defaultCity: "Приэльбрусье"
      }
    };
    this.init();
  }

  init() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        // Если заведений в db.json меньше, чем в коде, обновляем
        if (!this.data.businesses || this.data.businesses.length < INITIAL_BUSINESSES.length) {
          this.seedInitialData();
          this.save();
        }
      } else {
        this.seedInitialData();
        this.save();
      }
      console.log(\`[DB] База данных успешно инициализирована с \${this.data.businesses.length} объектами: \${DB_FILE}\`);
    } catch (err) {
      console.error('[DB] Ошибка инициализации базы, сбрасываем к сиду:', err);
      this.seedInitialData();
      this.save();
    }
  }

  save() {
    try {
      const tempFile = \`\${DB_FILE}.tmp\`;
      fs.writeFileSync(tempFile, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tempFile, DB_FILE);
    } catch (err) {
      console.error('[DB] Ошибка сохранения базы данных:', err);
    }
  }

  seedInitialData() {
    this.data.businesses = [...INITIAL_BUSINESSES];
    this.data.users = [
      {
        id: "admin-super",
        name: "Главный Администратор",
        email: "admin@skidki.ru",
        phone: "+7 (999) 000-00-01",
        passwordHash: hashPassword("admin123"),
        role: "super_admin",
        createdAt: new Date().toISOString()
      },
      {
        id: "admin-moderator",
        name: "Модератор Отзывов",
        email: "moderator@skidki.ru",
        phone: "+7 (999) 000-00-02",
        passwordHash: hashPassword("mod123"),
        role: "moderator",
        createdAt: new Date().toISOString()
      }
    ];

    this.data.reviews = ${JSON.stringify(INITIAL_REVIEWS, null, 2)};
    this.data.coupons = ${JSON.stringify(INITIAL_COUPONS, null, 2)};
  }

  getBusinesses({ category, city, search, lat, lng, radius } = {}) {
    let list = this.data.businesses.filter(b => b.isActive !== false);

    if (category && category !== 'all') {
      list = list.filter(b => b.category === category);
    }

    if (city) {
      const cityClean = city.toLowerCase().trim();
      list = list.filter(b => b.city.toLowerCase().includes(cityClean) || cityClean.includes(b.city.toLowerCase()));
    }

    if (search) {
      const q = search.toLowerCase().trim();
      list = list.filter(b =>
        b.name.toLowerCase().includes(q) ||
        b.address.toLowerCase().includes(q) ||
        b.discountText.toLowerCase().includes(q) ||
        b.categoryName.toLowerCase().includes(q) ||
        b.city.toLowerCase().includes(q)
      );
    }

    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      if (!isNaN(userLat) && !isNaN(userLng)) {
        list = list.map(b => ({
          ...b,
          distanceKm: calculateDistanceKm(userLat, userLng, b.lat, b.lng)
        }));

        if (radius) {
          const maxRadius = parseFloat(radius);
          if (!isNaN(maxRadius)) {
            list = list.filter(b => b.distanceKm <= maxRadius);
          }
        }

        list.sort((a, b) => a.distanceKm - b.distanceKm);
      }
    }

    return list;
  }

  getBusinessById(id) {
    return this.data.businesses.find(b => b.id === id);
  }

  addBusiness(bizData) {
    const id = "biz-" + crypto.randomBytes(4).toString('hex');
    const newBiz = {
      id,
      name: bizData.name || "Новое заведение",
      category: bizData.category || "restaurants",
      categoryName: bizData.categoryName || "Рестораны и кафе",
      city: bizData.city || "Приэльбрусье",
      address: bizData.address || "",
      lat: parseFloat(bizData.lat) || 43.2558,
      lng: parseFloat(bizData.lng) || 42.5117,
      phone: bizData.phone || "",
      website: bizData.website || "",
      workHours: bizData.workHours || "Ежедневно: 09:00 — 22:00",
      discountPercent: parseInt(bizData.discountPercent) || 20,
      discountBadge: bizData.discountBadge || \`-\${bizData.discountPercent || 20}% СКИДКА\`,
      discountText: bizData.discountText || "Скидка за честный отзыв на Яндекс Картах",
      conditions: bizData.conditions || "Предъявите купон до расчёта.",
      rating: parseFloat(bizData.rating) || 5.0,
      reviewCount: 0,
      image: bizData.image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80",
      qrScans: 0,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    this.data.businesses.unshift(newBiz);
    this.save();
    return newBiz;
  }

  updateBusiness(id, updateData) {
    const index = this.data.businesses.findIndex(b => b.id === id);
    if (index === -1) return null;

    const current = this.data.businesses[index];
    this.data.businesses[index] = {
      ...current,
      ...updateData,
      id: current.id,
      updatedAt: new Date().toISOString()
    };
    this.save();
    return this.data.businesses[index];
  }

  deleteBusiness(id) {
    const initialLen = this.data.businesses.length;
    this.data.businesses = this.data.businesses.filter(b => b.id !== id);
    if (this.data.businesses.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  submitReviewAndIssueCoupon({ businessId, userName, userPhone, rating, comment }) {
    const biz = this.getBusinessById(businessId);
    if (!biz) throw new Error("Заведение не найдено");

    const couponCode = \`\${biz.city.substring(0, 3).toUpperCase()}-\${Math.floor(1000 + Math.random() * 9000)}-\${crypto.randomBytes(2).toString('hex').toUpperCase()}\`;
    const couponId = "coup-" + crypto.randomBytes(4).toString('hex');
    const expiresAt = new Date(Date.now() + 86400000 * 14).toISOString();

    const reviewId = "rev-" + crypto.randomBytes(4).toString('hex');
    const newReview = {
      id: reviewId,
      businessId: biz.id,
      businessName: biz.name,
      userName: userName || "Гость",
      userPhone: userPhone || "",
      rating: Math.min(5, Math.max(1, parseInt(rating) || 5)),
      comment: comment || "Прекрасное место, очень понравилось!",
      status: "approved",
      couponCode,
      createdAt: new Date().toISOString()
    };

    const newCoupon = {
      id: couponId,
      code: couponCode,
      businessId: biz.id,
      businessName: biz.name,
      businessCity: biz.city,
      businessAddress: biz.address,
      discountBadge: biz.discountBadge,
      discountText: biz.discountText,
      conditions: biz.conditions,
      userName: newReview.userName,
      userPhone: newReview.userPhone,
      status: "active",
      redeemedAt: null,
      expiresAt,
      createdAt: new Date().toISOString()
    };

    this.data.reviews.unshift(newReview);
    this.data.coupons.unshift(newCoupon);

    biz.reviewCount = (biz.reviewCount || 0) + 1;
    this.data.stats.totalReviews += 1;
    this.data.stats.issuedCoupons += 1;

    this.save();

    return {
      review: newReview,
      coupon: newCoupon
    };
  }

  getReviews({ businessId, status } = {}) {
    let list = this.data.reviews;
    if (businessId) list = list.filter(r => r.businessId === businessId);
    if (status) list = list.filter(r => r.status === status);
    return list;
  }

  updateReviewStatus(id, status) {
    const review = this.data.reviews.find(r => r.id === id);
    if (!review) return null;
    review.status = status;
    review.moderatedAt = new Date().toISOString();
    this.save();
    return review;
  }

  deleteReview(id) {
    const initialLen = this.data.reviews.length;
    this.data.reviews = this.data.reviews.filter(r => r.id !== id);
    if (this.data.reviews.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  getCouponByCode(code) {
    if (!code) return null;
    return this.data.coupons.find(c => c.code.toLowerCase().trim() === code.toLowerCase().trim());
  }

  redeemCoupon(code, redeemedBy = "Кассир") {
    const coupon = this.getCouponByCode(code);
    if (!coupon) return { success: false, message: "Купон не найден в базе данных" };
    if (coupon.status === 'redeemed') {
      return {
        success: false,
        message: \`Купон уже был погашен \${new Date(coupon.redeemedAt).toLocaleString('ru-RU')}\`,
        coupon
      };
    }
    if (new Date(coupon.expiresAt) < new Date()) {
      return { success: false, message: "Срок действия купона истек", coupon };
    }

    coupon.status = 'redeemed';
    coupon.redeemedAt = new Date().toISOString();
    coupon.redeemedBy = redeemedBy;
    this.data.stats.redeemedCoupons += 1;
    this.save();

    return {
      success: true,
      message: \`Купон \${coupon.code} успешно погашен! Предоставьте клиенту: \${coupon.discountBadge}\`,
      coupon
    };
  }

  getAdmins() {
    return this.data.users.map(({ passwordHash, ...safeUser }) => safeUser);
  }

  createAdmin({ name, email, phone, password, role = 'moderator' }) {
    const emailClean = email.toLowerCase().trim();
    if (this.data.users.some(u => u.email.toLowerCase() === emailClean)) {
      throw new Error("Пользователь с таким email уже существует");
    }

    const newAdmin = {
      id: "admin-" + crypto.randomBytes(4).toString('hex'),
      name: name.trim(),
      email: emailClean,
      phone: phone || "",
      passwordHash: hashPassword(password),
      role: role || 'moderator',
      createdAt: new Date().toISOString()
    };

    this.data.users.push(newAdmin);
    this.save();
    const { passwordHash, ...safeUser } = newAdmin;
    return safeUser;
  }

  updateAdmin(id, { name, role, phone, password }) {
    const user = this.data.users.find(u => u.id === id);
    if (!user) return null;
    if (name) user.name = name;
    if (role) user.role = role;
    if (phone) user.phone = phone;
    if (password) user.passwordHash = hashPassword(password);
    user.updatedAt = new Date().toISOString();
    this.save();
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  deleteAdmin(id) {
    const target = this.data.users.find(u => u.id === id);
    if (!target) return false;
    if (target.role === 'super_admin') {
      const superAdmins = this.data.users.filter(u => u.role === 'super_admin');
      if (superAdmins.length <= 1) {
        throw new Error("Нельзя удалить единственного главного администратора");
      }
    }
    this.data.users = this.data.users.filter(u => u.id !== id);
    this.save();
    return true;
  }

  authenticateUser(email, password) {
    const user = this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) return null;
    if (verifyPassword(password, user.passwordHash)) {
      const { passwordHash, ...safeUser } = user;
      return safeUser;
    }
    return null;
  }

  recordQrScan(businessId, source = "qr_tent") {
    this.data.stats.totalQrScans += 1;
    if (businessId) {
      const biz = this.getBusinessById(businessId);
      if (biz) biz.qrScans = (biz.qrScans || 0) + 1;
    }
    this.save();
    return { success: true, total: this.data.stats.totalQrScans };
  }

  addTransfer(data) {
    if (!this.data.transfers) this.data.transfers = [];
    const id = 'tr-' + crypto.randomBytes(4).toString('hex');
    const transfer = {
      id,
      from: data.from || "Аэропорт Минеральные Воды (MRV)",
      to: data.to || "Приэльбрусье (Терскол / Поляна Азау)",
      vehicleType: data.vehicleType || "comfort",
      vehicleName: data.vehicleName || "Комфорт (до 4 чел)",
      date: data.date || new Date().toISOString().slice(0, 10),
      time: data.time || "12:00",
      passengers: parseInt(data.passengers) || 1,
      luggageInfo: data.luggageInfo || "Горнолыжное снаряжение",
      clientName: data.clientName || "Гость",
      clientPhone: data.clientPhone || "",
      comment: data.comment || "",
      priceEstimated: data.priceEstimated || 3500,
      priceWithDiscount: data.priceWithDiscount || 2800,
      discountPercent: 20,
      promoCode: data.promoCode || "ТРАНСФЕР-20",
      status: "new",
      createdAt: new Date().toISOString()
    };
    this.data.transfers.unshift(transfer);
    this.save();
    return transfer;
  }

  getTransfers() {
    return this.data.transfers || [];
  }

  updateTransferStatus(id, status) {
    if (!this.data.transfers) return null;
    const t = this.data.transfers.find(x => x.id === id);
    if (!t) return null;
    t.status = status;
    t.updatedAt = new Date().toISOString();
    this.save();
    return t;
  }

  getStats() {
    return {
      ...this.data.stats,
      totalBusinesses: this.data.businesses.length,
      activeBusinesses: this.data.businesses.filter(b => b.isActive).length,
      categoriesCount: CATEGORIES.length - 1,
      totalAdmins: this.data.users.filter(u => ['super_admin', 'admin', 'moderator'].includes(u.role)).length,
      citiesCount: CITIES.length
    };
  }

  updateSettings(settings) {
    this.data.settings = { ...this.data.settings, ...settings };
    this.save();
    return this.data.settings;
  }

  getSettings() {
    return this.data.settings;
  }
}

export const db = new Database();
`;

fs.writeFileSync(path.join(ROOT, 'data', 'database.js'), databaseJsContent, 'utf8');
console.log(`[OK] database.js записан`);
