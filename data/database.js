import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'db.json');

// Хеширование паролей с солью через crypto.pbkdf2Sync
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt, originalHash] = storedHash.split(':');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === originalHash;
}

// Вычисление расстояния между координатами (в км)
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

// Все заведения: Приэльбрусье, Эльбрус, Архыз, Карачаево-Черкесия, Нальчик, КМВ
export const INITIAL_BUSINESSES = [
  // ==========================================
  // ПРИЭЛЬБРУСЬЕ & ЭЛЬБРУС (КБР)
  // ==========================================
  {
    id: "biz-elbrus-kogutay",
    name: "Ресторан «Когутай»",
    category: "restaurants",
    categoryName: "Рестораны и кафе",
    city: "Приэльбрусье",
    address: "КБР, Эльбрусский р-н, Поляна Чегет, 1",
    lat: 43.2452,
    lng: 42.5244,
    phone: "+7 (928) 721-12-12",
    website: "https://kogutay-elbrus.ru",
    workHours: "Пн-Вс: 09:00 — 23:00",
    discountPercent: 25,
    discountBadge: "-25% НА ВСЁ МЕНЮ",
    discountText: "Скидка 25% на нежнейший шашлык из баранины, жареную речную форель и горячий облепиховый глинтвейн с видом на ледник Семерка",
    conditions: "Покажите QR-купон официанту до оформления счета.",
    rating: 4.9,
    reviewCount: 210,
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
    qrScans: 890,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "biz-elbrus-mir-kupol",
    name: "Высокогорное кафе «Купол» (Мир 3500м)",
    category: "restaurants",
    categoryName: "Рестораны и кафе",
    city: "Приэльбрусье",
    address: "КБР, г. Эльбрус, ст. Мир канатной дороги (3500 м)",
    lat: 43.2981,
    lng: 42.4721,
    phone: "+7 (928) 001-35-00",
    website: "https://elbrus-mir3500.ru",
    workHours: "Ежедневно: 09:00 — 16:30",
    discountPercent: 20,
    discountBadge: "-20% ИЛИ ЧАЙ 0 ₽",
    discountText: "Скидка 20% на весь чек или фирменный горный сбор из чабреца с хычином в подарок на высоте 3500 метров",
    conditions: "Действует при заказе от 800 ₽ на станции Мир.",
    rating: 5.0,
    reviewCount: 420,
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80",
    qrScans: 1450,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "biz-elbrus-mustafa",
    name: "Кафе «У Мустафы»",
    category: "restaurants",
    categoryName: "Рестораны и кафе",
    city: "Приэльбрусье",
    address: "КБР, Поляна Азау, у нижней станции канатки",
    lat: 43.2662,
    lng: 42.4806,
    phone: "+7 (928) 690-44-33",
    website: "https://mustafa-azau.ru",
    workHours: "Пн-Вс: 08:30 — 22:00",
    discountPercent: 30,
    discountBadge: "-30% НА ХЫЧИНЫ",
    discountText: "Скидка 30% на тонкие балкарские хычины с сыром, зеленью, мясом и домашний айран",
    conditions: "Предъявите купон при заказе.",
    rating: 4.8,
    reviewCount: 165,
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80",
    qrScans: 620,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "biz-elbrus-ski-pro",
    name: "Прокат снаряжения «Elbrus Ski Pro»",
    category: "entertainment",
    categoryName: "Туризм и развлечения",
    city: "Приэльбрусье",
    address: "КБР, Поляна Азау, отель Вершина",
    lat: 43.2675,
    lng: 42.4820,
    phone: "+7 (928) 333-88-11",
    website: "https://elbrus-skipro.ru",
    workHours: "Ежедневно: 08:00 — 20:00",
    discountPercent: 25,
    discountBadge: "-25% НА ПРОКАТ",
    discountText: "Скидка 25% на топовые комплекты лыж и сноубордов Head, Salomon, Burton + бесплатная сушка ботинок",
    conditions: "Купон активен на всё время катания при бронировании от 1 дня.",
    rating: 4.9,
    reviewCount: 310,
    image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&auto=format&fit=crop&q=80",
    qrScans: 980,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "biz-elbrus-baydaevo-spa",
    name: "Банный комплекс «Байдаево Спа & Чан»",
    category: "spa",
    categoryName: "Спа, сауны и отдых",
    city: "Приэльбрусье",
    address: "КБР, пос. Байдаево, ул. Лесная, 12",
    lat: 43.2384,
    lng: 42.5936,
    phone: "+7 (928) 777-44-55",
    website: "https://baydaevo-spa.ru",
    workHours: "Пн-Вс: 10:00 — 00:00",
    discountPercent: 35,
    discountBadge: "-35% НА ЧАН И БАНЮ",
    discountText: "Скидка 35% на сибирский банный чан на дровах с горными травами и панорамным видом на ущелье",
    conditions: "По предварительной записи от 2-х часов.",
    rating: 5.0,
    reviewCount: 140,
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&auto=format&fit=crop&q=80",
    qrScans: 470,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "biz-elbrus-jily-su",
    name: "Джип-туры «Джилы-Су Экспресс»",
    category: "entertainment",
    categoryName: "Туризм и развлечения",
    city: "Приэльбрусье",
    address: "КБР, с. Терскол, ул. Баксанская, 22",
    lat: 43.2558,
    lng: 42.5117,
    phone: "+7 (928) 123-99-00",
    website: "https://jilysu-tour.ru",
    workHours: "Круглосуточно: 06:00 — 22:00",
    discountPercent: 20,
    discountBadge: "-20% НА ДЖИП-ТУР",
    discountText: "Скидка 20% на незабываемый джип-тур к водопадам Султан и Эмир, термальным нарзанам и поляне каменных грибов",
    conditions: "Скидка действует на весь внедорожник при бронировании тура.",
    rating: 5.0,
    reviewCount: 380,
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&auto=format&fit=crop&q=80",
    qrScans: 1120,
    isActive: true,
    createdAt: new Date().toISOString()
  },

  // ==========================================
  // АРХЫЗ & КАРАЧАЕВО-ЧЕРКЕСИЯ
  // ==========================================
  {
    id: "biz-arkhyz-tramplin",
    name: "Ресторан «Трамплин»",
    category: "restaurants",
    categoryName: "Рестораны и кафе",
    city: "Архыз",
    address: "КЧР, курорт Архыз, пос. Романтик, ул. Горная, 1",
    lat: 43.5412,
    lng: 41.1788,
    phone: "+7 (928) 030-22-11",
    website: "https://tramplin-arkhyz.ru",
    workHours: "Пн-Вс: 10:00 — 23:00",
    discountPercent: 20,
    discountBadge: "-20% НА ВСЁ МЕНЮ",
    discountText: "Скидка 20% на весь чек: авторская кавказская кухня, сочные стейки на углях и глинтвейн у канатной дороги Млечный Путь",
    conditions: "Действует в зале ресторана при предъявлении QR-купона.",
    rating: 4.9,
    reviewCount: 290,
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80",
    qrScans: 1350,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "biz-arkhyz-hychin-house",
    name: "Кафе «Хычин Хаус Архыз»",
    category: "restaurants",
    categoryName: "Рестораны и кафе",
    city: "Архыз",
    address: "КЧР, пос. Архыз, ул. Ленина, 28",
    lat: 43.5614,
    lng: 41.2789,
    phone: "+7 (928) 388-77-66",
    website: "https://hychin-arkhyz.ru",
    workHours: "Ежедневно: 09:00 — 22:00",
    discountPercent: 30,
    discountBadge: "-30% НА ХЫЧИНЫ",
    discountText: "Скидка 30% на пышные карачаевские хычины с мясом, сыром, сочную шорпу и горный чай",
    conditions: "Скидка активируется сразу после отзыва.",
    rating: 4.8,
    reviewCount: 230,
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80",
    qrScans: 790,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "biz-arkhyz-extreme",
    name: "Квадроциклы & Снегоходы «Архыз Экстрим»",
    category: "entertainment",
    categoryName: "Туризм и развлечения",
    city: "Архыз",
    address: "КЧР, пос. Архыз, ул. Курортная, 15",
    lat: 43.5590,
    lng: 41.2820,
    phone: "+7 (928) 655-44-33",
    website: "https://arkhyz-extreme.ru",
    workHours: "Ежедневно: 08:00 — 20:00",
    discountPercent: 25,
    discountBadge: "-25% НА ТУРЫ",
    discountText: "Скидка 25% на аренду мощных снегоходов и квадроциклов к Софийским водопадам и озеру Семицветное",
    conditions: "Экипировка и инструктаж включены бесплатно.",
    rating: 5.0,
    reviewCount: 340,
    image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&auto=format&fit=crop&q=80",
    qrScans: 1040,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "biz-arkhyz-termy",
    name: "Термальный спа-клуб «Термы Архыза»",
    category: "spa",
    categoryName: "Спа, сауны и отдых",
    city: "Архыз",
    address: "КЧР, с. Архыз, ул. Родниковая, 7",
    lat: 43.5650,
    lng: 41.2710,
    phone: "+7 (928) 990-11-22",
    website: "https://termy-arkhyz.ru",
    workHours: "Пн-Вс: 10:00 — 23:00",
    discountPercent: 30,
    discountBadge: "-30% НА ТЕРМЫ",
    discountText: "Скидка 30% на открытые подогреваемые бассейны под звездами, русскую баню на березовых дровах и фитобочку",
    conditions: "Купон действует на компанию до 4-х человек.",
    rating: 4.9,
    reviewCount: 195,
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&auto=format&fit=crop&q=80",
    qrScans: 680,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "biz-arkhyz-edelveys-coffee",
    name: "Спешелти кофейня «Эдельвейс Coffee»",
    category: "coffee",
    categoryName: "Кофейни и пекарни",
    city: "Архыз",
    address: "КЧР, пос. Романтик, Сервис-Центр курорта",
    lat: 43.5425,
    lng: 41.1810,
    phone: "+7 (928) 456-78-90",
    website: "https://edelveys-coffee.ru",
    workHours: "Пн-Вс: 08:00 — 21:00",
    discountPercent: 20,
    discountBadge: "-20% + ДЕСЕРТ",
    discountText: "Скидка 20% на весь кофейный бар: горный латте со специями, фильтр-кофе и домашний медовик в подарок",
    conditions: "Покажите QR-код бариста перед оплатой.",
    rating: 5.0,
    reviewCount: 180,
    image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop&q=80",
    qrScans: 550,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "biz-dombay-zula",
    name: "Легендарное кафе «У Зули» (Домбай)",
    category: "restaurants",
    categoryName: "Рестораны и кафе",
    city: "Домбай",
    address: "КЧР, пос. Домбай, ул. Карачаевская, 93",
    lat: 43.2921,
    lng: 41.6267,
    phone: "+7 (928) 380-00-55",
    website: "https://zula-dombay.ru",
    workHours: "Пн-Вс: 09:00 — 23:00",
    discountPercent: 20,
    discountBadge: "-20% НА ВСЁ МЕНЮ",
    discountText: "Скидка 20% на коронные блюда Домбая: лагман по-домашнему, форель на мангале, хычины и варенье из молодых шишек",
    conditions: "Действует на обеды и ужины.",
    rating: 4.9,
    reviewCount: 460,
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80",
    qrScans: 1680,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "biz-cherkessk-riviera",
    name: "Ресторан «Ривьера»",
    category: "restaurants",
    categoryName: "Рестораны и кафе",
    city: "Черкесск",
    address: "КЧР, г. Черкесск, парк культуры «Зеленый Остров»",
    lat: 44.2233,
    lng: 42.0578,
    phone: "+7 (8782) 26-11-22",
    website: "https://riviera-cherkessk.ru",
    workHours: "Пн-Вс: 11:00 — 00:00",
    discountPercent: 20,
    discountBadge: "-20% НА МАНГАЛ",
    discountText: "Скидка 20% на весь мангал и кавказскую кухню в живописном ресторане у озера в парке Зеленый Остров",
    conditions: "Купон действует при заказе от 1200 ₽.",
    rating: 4.8,
    reviewCount: 220,
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80",
    qrScans: 810,
    isActive: true,
    createdAt: new Date().toISOString()
  },

  // ==========================================
  // НАЛЬЧИК (СТОЛИЦА КБР)
  // ==========================================
  {
    id: "biz-nalchik-sosruko",
    name: "Культовый ресторан «Сосруко»",
    category: "restaurants",
    categoryName: "Рестораны и кафе",
    city: "Нальчик",
    address: "КБР, г. Нальчик, гора Малая Кизиловка (подъем на канатке)",
    lat: 43.4687,
    lng: 43.5935,
    phone: "+7 (8662) 42-55-11",
    website: "https://sosruko-nalchik.ru",
    workHours: "Ежедневно: 11:00 — 00:00",
    discountPercent: 20,
    discountBadge: "-20% НА ВСЁ МЕНЮ",
    discountText: "Скидка 20% в легендарном ресторане-визитной карточке Кавказа в форме головы нартского богатыря Сосруко с панорамным видом на весь город",
    conditions: "Предъявите купон официанту до оплаты счета.",
    rating: 4.9,
    reviewCount: 520,
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
    qrScans: 2100,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "biz-nalchik-bochka",
    name: "Ресторан «Бочка»",
    category: "restaurants",
    categoryName: "Рестораны и кафе",
    city: "Нальчик",
    address: "КБР, г. Нальчик, ул. Канукоева, 2 (Атажукинский сад)",
    lat: 43.4645,
    lng: 43.5850,
    phone: "+7 (8662) 72-00-88",
    website: "https://bochka-nalchik.ru",
    workHours: "Пн-Вс: 11:00 — 23:30",
    discountPercent: 25,
    discountBadge: "-25% НА КАБАРДИНСКУЮ КУХНЮ",
    discountText: "Скидка 25% на аутентичные национальные блюда: гедлибже в сметанном соусе, вяленое мясо лягур, пасту с копченым сыром и шашлык",
    conditions: "Действует на основное меню ресторана.",
    rating: 4.8,
    reviewCount: 310,
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80",
    qrScans: 1190,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "biz-nalchik-sreda-coffee",
    name: "Кофейня & Пекарня «Среда Coffee»",
    category: "coffee",
    categoryName: "Кофейни и пекарни",
    city: "Нальчик",
    address: "КБР, г. Нальчик, пр. Ленина, 32",
    lat: 43.4870,
    lng: 43.6120,
    phone: "+7 (928) 710-33-44",
    website: "https://sreda-coffee.ru",
    workHours: "Ежедневно: 08:00 — 22:30",
    discountPercent: 20,
    discountBadge: "-20% НА КОФЕ И ДЕСЕРТЫ",
    discountText: "Скидка 20% на авторский кофейный бар, свежеиспеченные круассаны и фисташковый рулет",
    conditions: "Купон активен при любом заказе от 300 ₽.",
    rating: 5.0,
    reviewCount: 240,
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&auto=format&fit=crop&q=80",
    qrScans: 740,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "biz-nalchik-auto-spa",
    name: "Детейлинг & Мойка «Nalchik Auto Spa»",
    category: "auto",
    categoryName: "Автомойки и детейлинг",
    city: "Нальчик",
    address: "КБР, г. Нальчик, ул. Кирова, 137",
    lat: 43.4912,
    lng: 43.6210,
    phone: "+7 (928) 007-88-99",
    website: "https://autospa-nalchik.ru",
    workHours: "Круглосуточно 24/7",
    discountPercent: 35,
    discountBadge: "-35% НА ХИМЧИСТКУ",
    discountText: "Скидка 35% на комплексную трёхфазную детейлинг-мойку и глубокую паровую химчистку салона",
    conditions: "Предъявите код купона администратору автомойки.",
    rating: 4.9,
    reviewCount: 130,
    image: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=600&auto=format&fit=crop&q=80",
    qrScans: 480,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "biz-nalchik-kavkaz-clan",
    name: "Барбершоп «Кавказ Клан»",
    category: "beauty",
    categoryName: "Красота и барбершопы",
    city: "Нальчик",
    address: "КБР, г. Нальчик, ул. Головко, 18",
    lat: 43.4830,
    lng: 43.6050,
    phone: "+7 (928) 691-00-11",
    website: "https://kavkaz-clan.ru",
    workHours: "Пн-Вс: 10:00 — 21:00",
    discountPercent: 25,
    discountBadge: "-500 ₽ НА СТРИЖКУ",
    discountText: "Скидка 500 ₽ на моделирование бороды опасной бритвой, стрижку и распаривание с черной маской",
    conditions: "Для новых и постоянных гостей при оставлении отзыва.",
    rating: 4.9,
    reviewCount: 190,
    image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&auto=format&fit=crop&q=80",
    qrScans: 590,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "biz-nalchik-sindika-spa",
    name: "Спа & Бальнео-комплекс «Синдика»",
    category: "spa",
    categoryName: "Спа, сауны и отдых",
    city: "Нальчик",
    address: "КБР, г. Нальчик, курортный р-н Долинск, ул. Пирогова, 8",
    lat: 43.4620,
    lng: 43.5810,
    phone: "+7 (8662) 77-22-33",
    website: "https://sindika-spa.ru",
    workHours: "Пн-Вс: 09:00 — 22:00",
    discountPercent: 30,
    discountBadge: "-30% НА СПА-ДЕНЬ",
    discountText: "Скидка 30% на азотно-термальные минеральные ванны, посещение бассейна, сауны и массаж в курортной зоне Долинск",
    conditions: "По предварительной записи.",
    rating: 4.8,
    reviewCount: 175,
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&auto=format&fit=crop&q=80",
    qrScans: 520,
    isActive: true,
    createdAt: new Date().toISOString()
  },

  // ==========================================
  // КМВ (ПЯТИГОРСК, КИСЛОВОДСК, ЕССЕНТУКИ)
  // ==========================================
  {
    id: "biz-kavkaz-grill",
    name: "Ресторан «Крыша & Гриль»",
    category: "restaurants",
    categoryName: "Рестораны и кафе",
    city: "Пятигорск",
    address: "г. Пятигорск, пр. Кирова, 47 (ТЦ Галерея, 5 этаж)",
    lat: 44.0384,
    lng: 43.0712,
    phone: "+7 (8793) 39-11-22",
    website: "https://kavkaz-grill.ru",
    workHours: "Пн-Вс: 11:00 — 00:00",
    discountPercent: 20,
    discountBadge: "-20% НА ВСЁ МЕНЮ",
    discountText: "Скидка 20% на все блюда кавказской кухни и мангал + фирменный горный чай в подарок",
    conditions: "Действует при заказе от 1500 ₽. Покажите QR-купон официанту перед расчётом.",
    rating: 4.9,
    reviewCount: 142,
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
    qrScans: 384,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "biz-shashlyk-dvor",
    name: "Шашлычный дом «Кавказский Дворик»",
    category: "restaurants",
    categoryName: "Рестораны и кафе",
    city: "Пятигорск",
    address: "г. Пятигорск, ул. 295 Стрелковой Дивизии, 19",
    lat: 44.0512,
    lng: 43.0543,
    phone: "+7 (928) 345-67-89",
    website: "https://dvorik-kmv.ru",
    workHours: "Пн-Вс: 10:00 — 23:00",
    discountPercent: 25,
    discountBadge: "-25% НА МАНГАЛ",
    discountText: "Скидка 25% на нежнейший шашлык из баранины, люля-кебаб и осетинские пироги",
    conditions: "Купон активируется после отзыва. Действует в зале и на самовывоз.",
    rating: 4.8,
    reviewCount: 98,
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80",
    qrScans: 256,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "biz-mountain-coffee",
    name: "Specialty Кофейня «Горный Эспрессо»",
    category: "coffee",
    categoryName: "Кофейни и пекарни",
    city: "Пятигорск",
    address: "г. Пятигорск, ул. Октябрьская, 10",
    lat: 44.0398,
    lng: 43.0765,
    phone: "+7 (938) 100-22-33",
    website: "https://mountain-coffee.ru",
    workHours: "Ежедневно: 08:00 — 22:00",
    discountPercent: 30,
    discountBadge: "-30% ИЛИ 2-Й КОФЕ 0 ₽",
    discountText: "Второй кофейный напиток в подарок либо скидка 30% на авторский раф и свежие круассаны",
    conditions: "Действует на любой напиток объема L или XL.",
    rating: 5.0,
    reviewCount: 215,
    image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop&q=80",
    qrScans: 620,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "biz-kavkaz-detail",
    name: "Детейлинг & Мойка «Kavkaz Auto Detail»",
    category: "auto",
    categoryName: "Автомойки и детейлинг",
    city: "Пятигорск",
    address: "г. Пятигорск, ул. Ермолова, 14/1",
    lat: 44.0321,
    lng: 43.0418,
    phone: "+7 (928) 888-01-02",
    website: "https://kavkaz-detail.ru",
    workHours: "Круглосуточно 24/7",
    discountPercent: 35,
    discountBadge: "-35% НА ХИМЧИСТКУ",
    discountText: "Скидка 35% на комплексную химчистку салона + нано-покрытие стекол «Антидождь»",
    conditions: "По предварительной записи. Сообщите промокод администратору мойки.",
    rating: 4.9,
    reviewCount: 84,
    image: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=600&auto=format&fit=crop&q=80",
    qrScans: 310,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "biz-mineral-resort",
    name: "Термальный Спа-комплекс «Минерал Резорт»",
    category: "spa",
    categoryName: "Спа, сауны и отдых",
    city: "Кисловодск",
    address: "г. Кисловодск, ул. Ленина, 12",
    lat: 43.9056,
    lng: 42.7156,
    phone: "+7 (87937) 6-77-88",
    website: "https://mineral-resort.ru",
    workHours: "Пн-Вс: 09:00 — 23:00",
    discountPercent: 30,
    discountBadge: "-30% НА СПА-ДЕНЬ",
    discountText: "Скидка 30% на посещение термальной зоны, хаммама и минеральных бассейнов",
    conditions: "Купон действует на компанию до 3-х человек.",
    rating: 4.9,
    reviewCount: 189,
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&auto=format&fit=crop&q=80",
    qrScans: 512,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "biz-papaha-makhachkala",
    name: "Ресторан горской кухни «Папаха»",
    category: "restaurants",
    categoryName: "Рестораны и кафе",
    city: "Махачкала",
    address: "г. Махачкала, пр. Расула Гамзатова, 35",
    lat: 42.9849,
    lng: 47.5047,
    phone: "+7 (988) 291-55-55",
    website: "https://papaha-rest.ru",
    workHours: "Ежедневно: 11:00 — 00:00",
    discountPercent: 20,
    discountBadge: "-20% НА КУХНЮ",
    discountText: "Скидка 20% на аварский и даргинский хинкал, чуду с мясом и сушеное мясо",
    conditions: "Купон активен в течение 7 дней после отзыва.",
    rating: 5.0,
    reviewCount: 380,
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80",
    qrScans: 920,
    isActive: true,
    createdAt: new Date().toISOString()
  }
];

export const CATEGORIES = [
  { id: "all", name: "Все заведения", icon: "🌟" },
  { id: "restaurants", name: "Рестораны и кафе", icon: "🍔" },
  { id: "coffee", name: "Кофейни и пекарни", icon: "☕" },
  { id: "auto", name: "Автомойки и детейлинг", icon: "🚗" },
  { id: "beauty", name: "Красота и барбершопы", icon: "✂️" },
  { id: "spa", name: "Спа, сауны и отдых", icon: "🧖" },
  { id: "fitness", name: "Спорт и фитнес", icon: "🏋️" },
  { id: "entertainment", name: "Туризм и экстрим", icon: "🏔️" },
  { id: "medical", name: "Здоровье и медицина", icon: "💊" }
];

export const CITIES = [
  { name: "Приэльбрусье", center: [43.2558, 42.5117], zoom: 12, region: "Эльбрус (КБР)" },
  { name: "Архыз", center: [43.5614, 41.2789], zoom: 12, region: "КЧР" },
  { name: "Домбай", center: [43.2921, 41.6267], zoom: 13, region: "КЧР" },
  { name: "Нальчик", center: [43.4853, 43.6071], zoom: 13, region: "КБР" },
  { name: "Черкесск", center: [44.2233, 42.0578], zoom: 13, region: "КЧР" },
  { name: "Пятигорск", center: [44.0486, 43.0594], zoom: 13, region: "КМВ" },
  { name: "Кисловодск", center: [43.9056, 42.7156], zoom: 13, region: "КМВ" },
  { name: "Ессентуки", center: [44.0436, 42.8617], zoom: 13, region: "КМВ" },
  { name: "Сочи", center: [43.5855, 39.7231], zoom: 12, region: "Юг" },
  { name: "Краснодар", center: [45.0355, 38.9753], zoom: 12, region: "Юг" },
  { name: "Махачкала", center: [42.9849, 47.5047], zoom: 12, region: "Кавказ" },
  { name: "Владикавказ", center: [43.0211, 44.6819], zoom: 12, region: "Кавказ" },
  { name: "Москва", center: [55.7558, 37.6176], zoom: 11, region: "Центр" },
  { name: "Санкт-Петербург", center: [59.9343, 30.3351], zoom: 11, region: "Северо-Запад" }
];

class Database {
  constructor() {
    this.data = {
      businesses: [],
      reviews: [],
      coupons: [],
      users: [],
      stats: {
        totalQrScans: 8940,
        totalReviews: 610,
        totalCouponsIssued: 745,
        totalCouponsRedeemed: 432
      },
      settings: {
        siteName: "ХабСкидок.рф",
        tagline: "Скидки до 50% в Приэльбрусье, Архызе, Нальчике и на Кавказе за честный отзыв",
        defaultCity: "Приэльбрусье"
      }
    };
    this.init();
  }

  init() {
    try {
      this.seedInitialData();
      this.save();
      console.log(`[DB] База данных инициализирована с объектами Приэльбрусья, Архыза, Нальчика и КЧР: ${DB_FILE}`);
    } catch (err) {
      console.error('[DB] Ошибка инициализации базы:', err);
    }
  }

  save() {
    try {
      const tempFile = `${DB_FILE}.tmp`;
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

    this.data.reviews = [
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
        businessName: "Ресторан «Сосруко»",
        userName: "Мурат Шогенов",
        userPhone: "+7 (928) ***-99-00",
        rating: 5,
        comment: "Легендарное место Нальчика. Вид с горы Кизиловка на город завораживает. Национальная кухня на высоте!",
        status: "approved",
        couponCode: "NALCHIK-9921-GIFT",
        createdAt: new Date(Date.now() - 3600000 * 8).toISOString()
      }
    ];

    this.data.coupons = [
      {
        id: "coup-201",
        code: "ELBRUS-7712-VIP",
        businessId: "biz-elbrus-kogutay",
        businessName: "Ресторан «Когутай»",
        discountBadge: "-25% НА ВСЁ МЕНЮ",
        userName: "Руслан Тебердиев",
        userPhone: "+7 (928) ***-45-67",
        status: "active",
        redeemedAt: null,
        expiresAt: new Date(Date.now() + 86400000 * 14).toISOString(),
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
      }
    ];
  }

  getBusinesses({ category, city, search, lat, lng, radius } = {}) {
    let list = this.data.businesses.filter(b => b.isActive !== false);

    if (category && category !== 'all') {
      list = list.filter(b => b.category === category);
    }

    if (city) {
      const cityClean = city.toLowerCase().trim();
      list = list.filter(b => b.city.toLowerCase().includes(cityClean));
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
      discountBadge: bizData.discountBadge || `-${bizData.discountPercent || 20}% СКИДКА`,
      discountText: bizData.discountText || "Скидка за отзыв",
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
      lat: updateData.lat !== undefined ? parseFloat(updateData.lat) : current.lat,
      lng: updateData.lng !== undefined ? parseFloat(updateData.lng) : current.lng,
      discountPercent: updateData.discountPercent !== undefined ? parseInt(updateData.discountPercent) : current.discountPercent,
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

    const couponCode = `${biz.city.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
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

    biz.reviewCount = (biz.reviewCount || 0) + 1;
    const currentReviews = this.data.reviews.filter(r => r.businessId === biz.id);
    const sumRatings = currentReviews.reduce((sum, r) => sum + r.rating, 0) + newReview.rating;
    biz.rating = Math.round((sumRatings / (currentReviews.length + 1)) * 10) / 10;

    this.data.reviews.unshift(newReview);
    this.data.coupons.unshift(newCoupon);
    this.data.stats.totalReviews += 1;
    this.data.stats.totalCouponsIssued += 1;

    this.save();

    return { review: newReview, coupon: newCoupon, business: biz };
  }

  getReviews({ businessId, status } = {}) {
    let list = [...this.data.reviews];
    if (businessId) list = list.filter(r => r.businessId === businessId);
    if (status && status !== 'all') list = list.filter(r => r.status === status);
    return list;
  }

  updateReviewStatus(id, status) {
    const rev = this.data.reviews.find(r => r.id === id);
    if (!rev) return null;
    rev.status = status;
    this.save();
    return rev;
  }

  deleteReview(id) {
    const len = this.data.reviews.length;
    this.data.reviews = this.data.reviews.filter(r => r.id !== id);
    if (this.data.reviews.length !== len) {
      this.save();
      return true;
    }
    return false;
  }

  getCouponByCode(code) {
    if (!code) return null;
    const cleanCode = code.trim().toUpperCase();
    return this.data.coupons.find(c => c.code.toUpperCase() === cleanCode);
  }

  redeemCoupon(code, redeemedBy = "Кассир") {
    const coupon = this.getCouponByCode(code);
    if (!coupon) return { success: false, message: "Купон не найден в базе данных" };
    if (coupon.status === 'used') {
      return {
        success: false,
        message: `Этот купон уже был погашен ${new Date(coupon.redeemedAt).toLocaleString('ru-RU')}`,
        coupon
      };
    }
    if (new Date(coupon.expiresAt) < new Date()) {
      return { success: false, message: "Срок действия купона истек", coupon };
    }

    coupon.status = 'used';
    coupon.redeemedAt = new Date().toISOString();
    coupon.redeemedBy = redeemedBy;
    this.data.stats.totalCouponsRedeemed += 1;
    this.save();

    return { success: true, message: "Купон успешно активирован и погашен!", coupon };
  }

  getUsers() {
    return this.data.users.map(({ passwordHash, ...user }) => user);
  }

  getAdmins() {
    return this.data.users
      .filter(u => ['super_admin', 'admin', 'moderator', 'manager'].includes(u.role))
      .map(({ passwordHash, ...user }) => user);
  }

  createAdmin({ name, email, phone, password, role }) {
    const existing = this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) throw new Error("Пользователь с таким email уже существует");

    const newAdmin = {
      id: "admin-" + crypto.randomBytes(4).toString('hex'),
      name: name || "Администратор",
      email: email.toLowerCase().trim(),
      phone: phone || "",
      passwordHash: hashPassword(password || "admin123"),
      role: role || "moderator",
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
