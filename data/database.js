import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'db.json');

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

export const CATEGORIES = [
  {
    "id": "all",
    "name": "Все заведения",
    "icon": "🌟"
  },
  {
    "id": "restaurants",
    "name": "Рестораны и кафе",
    "icon": "🍔"
  },
  {
    "id": "coffee",
    "name": "Кофейни и пекарни",
    "icon": "☕"
  },
  {
    "id": "auto",
    "name": "Автомойки и детейлинг",
    "icon": "🚗"
  },
  {
    "id": "beauty",
    "name": "Красота и барбершопы",
    "icon": "✂️"
  },
  {
    "id": "spa",
    "name": "Спа, термы и бани",
    "icon": "🧖"
  },
  {
    "id": "fitness",
    "name": "Спорт и фитнес",
    "icon": "🏋️"
  },
  {
    "id": "entertainment",
    "name": "Туризм, прокаты и экстрим",
    "icon": "🏔️"
  },
  {
    "id": "medical",
    "name": "Здоровье и медицина",
    "icon": "💊"
  }
];

export const CITIES = [
  {
    "name": "Приэльбрусье",
    "center": [
      43.2558,
      42.5117
    ],
    "zoom": 12,
    "region": "Эльбрус (КБР)"
  },
  {
    "name": "Архыз",
    "center": [
      43.5614,
      41.2789
    ],
    "zoom": 12,
    "region": "КЧР"
  },
  {
    "name": "Домбай",
    "center": [
      43.2921,
      41.6267
    ],
    "zoom": 13,
    "region": "КЧР"
  },
  {
    "name": "Нальчик",
    "center": [
      43.4853,
      43.6071
    ],
    "zoom": 13,
    "region": "КБР"
  },
  {
    "name": "Карачаево-Черкесия",
    "center": [
      44.2233,
      42.0578
    ],
    "zoom": 11,
    "region": "КЧР"
  },
  {
    "name": "Пятигорск",
    "center": [
      44.0486,
      43.0594
    ],
    "zoom": 13,
    "region": "КМВ"
  },
  {
    "name": "Кисловодск",
    "center": [
      43.9056,
      42.7156
    ],
    "zoom": 13,
    "region": "КМВ"
  },
  {
    "name": "Ессентуки",
    "center": [
      44.0436,
      42.8617
    ],
    "zoom": 13,
    "region": "КМВ"
  },
  {
    "name": "Железноводск",
    "center": [
      44.135,
      43.028
    ],
    "zoom": 13,
    "region": "КМВ"
  },
  {
    "name": "Владикавказ",
    "center": [
      43.0211,
      44.6819
    ],
    "zoom": 13,
    "region": "Северная Осетия"
  },
  {
    "name": "Махачкала",
    "center": [
      42.9849,
      47.5047
    ],
    "zoom": 12,
    "region": "Дагестан"
  },
  {
    "name": "Дербент",
    "center": [
      42.0525,
      48.274
    ],
    "zoom": 13,
    "region": "Дагестан"
  },
  {
    "name": "Сочи",
    "center": [
      43.5855,
      39.7231
    ],
    "zoom": 12,
    "region": "Юг"
  },
  {
    "name": "Краснодар",
    "center": [
      45.0355,
      38.9753
    ],
    "zoom": 12,
    "region": "Юг"
  },
  {
    "name": "Москва",
    "center": [
      55.7558,
      37.6176
    ],
    "zoom": 11,
    "region": "Центр"
  },
  {
    "name": "Санкт-Петербург",
    "center": [
      59.9343,
      30.3351
    ],
    "zoom": 11,
    "region": "Северо-Запад"
  }
];

export const INITIAL_BUSINESSES = [
  {
    "id": "biz-elbrus-kogutay",
    "name": "Ресторан «Когутай»",
    "category": "restaurants",
    "categoryName": "Рестораны и кафе",
    "city": "Приэльбрусье",
    "address": "КБР, Эльбрусский р-н, Поляна Чегет, 1",
    "lat": 43.2452,
    "lng": 42.5244,
    "phone": "+7 (928) 721-12-12",
    "website": "https://kogutay-elbrus.ru",
    "workHours": "Пн-Вс: 09:00 — 23:00",
    "discountPercent": 25,
    "discountBadge": "-25% НА ВСЁ МЕНЮ",
    "discountText": "Скидка 25% на нежнейший шашлык из баранины, жареную речную форель и горячий облепиховый глинтвейн с видом на ледник Семерка",
    "conditions": "Покажите QR-купон официанту до закрытия счёта.",
    "rating": 4.9,
    "reviewCount": 245,
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
    "qrScans": 1250,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-elbrus-mir-kupol",
    "name": "Высокогорное кафе «Купол» (Мир 3500м)",
    "category": "restaurants",
    "categoryName": "Рестораны и кафе",
    "city": "Приэльбрусье",
    "address": "КБР, г. Эльбрус, ст. Мир канатной дороги (3500 м)",
    "lat": 43.2981,
    "lng": 42.4721,
    "phone": "+7 (928) 911-35-00",
    "website": "https://elbrusresort.ru/kupol",
    "workHours": "Пн-Вс: 09:00 — 16:30",
    "discountPercent": 20,
    "discountBadge": "-20% НА ВСЁ МЕНЮ",
    "discountText": "Скидка 20% на фирменный горный чай на альпийских травах, горячий лагман и балкарские хычины на высоте 3500 метров над уровнем моря",
    "conditions": "Действует при заказе от 800 рублей. Предъявите купон бариста/кассиру.",
    "rating": 5,
    "reviewCount": 312,
    "image": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80",
    "qrScans": 2140,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-elbrus-cafe-ai",
    "name": "Легендарное кафе «Ай» (Чегет 2750м)",
    "category": "restaurants",
    "categoryName": "Рестораны и кафе",
    "city": "Приэльбрусье",
    "address": "КБР, гора Чегет, станция канатной дороги Ай (2750 м)",
    "lat": 43.2514,
    "lng": 42.5318,
    "phone": "+7 (928) 001-27-50",
    "website": "https://cheget-ai.ru",
    "workHours": "Пн-Вс: 09:30 — 16:30",
    "discountPercent": 20,
    "discountBadge": "-20% НА ПИРОЖКИ И ЧАЙ",
    "discountText": "Скидка 20% на знаменитые горячие чегетские пирожки с горной черникой и брусникой в историческом кафе, где любил бывать Владимир Высоцкий",
    "conditions": "Покажите QR-код кассиру при оформлении заказа.",
    "rating": 4.9,
    "reviewCount": 420,
    "image": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80",
    "qrScans": 3410,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-elbrus-freeride",
    "name": "Кафе-ресторан «FreeRide»",
    "category": "restaurants",
    "categoryName": "Рестораны и кафе",
    "city": "Приэльбрусье",
    "address": "КБР, Поляна Азау, здание канатной дороги, 1 этаж",
    "lat": 43.2667,
    "lng": 42.4795,
    "phone": "+7 (928) 700-11-22",
    "website": "https://freeride-azau.ru",
    "workHours": "Ежедневно: 08:30 — 23:00",
    "discountPercent": 20,
    "discountBadge": "-20% НА ВСЁ МЕНЮ",
    "discountText": "Скидка 20% на сочные бургеры из мраморной говядины, глинтвейн и кавказские супы после катания на склонах Эльбруса",
    "conditions": "Покажите купон официанту до оплаты счета.",
    "rating": 4.8,
    "reviewCount": 189,
    "image": "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80",
    "qrScans": 980,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-elbrus-tauruh",
    "name": "Кафе кавказской кухни «Таурух»",
    "category": "restaurants",
    "categoryName": "Рестораны и кафе",
    "city": "Приэльбрусье",
    "address": "КБР, пос. Терскол, ул. Баксанская, 22",
    "lat": 43.2562,
    "lng": 42.5085,
    "phone": "+7 (928) 714-44-55",
    "website": "https://tauruh-elbrus.ru",
    "workHours": "Пн-Вс: 10:00 — 23:00",
    "discountPercent": 25,
    "discountBadge": "-25% НА ХЫЧИНЫ И ШАШЛЫК",
    "discountText": "Скидка 25% на аутентичные балкарские хычины с сыром и зеленью, сочный шашлык на углях и домашний айран",
    "conditions": "Не суммируется с бизнес-ланчем. Покажите купон до расчета.",
    "rating": 4.9,
    "reviewCount": 278,
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
    "qrScans": 1420,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-elbrus-mustafa",
    "name": "Кафе «У Мустафы»",
    "category": "restaurants",
    "categoryName": "Рестораны и кафе",
    "city": "Приэльбрусье",
    "address": "КБР, Поляна Азау, центральная площадь",
    "lat": 43.2672,
    "lng": 42.4802,
    "phone": "+7 (928) 075-88-99",
    "website": "https://mustafa-azau.ru",
    "workHours": "Пн-Вс: 08:30 — 22:00",
    "discountPercent": 20,
    "discountBadge": "-20% НА МЯСО НА УГЛЯХ",
    "discountText": "Скидка 20% на легендарную баранину на косточке, шурпу в казане и свежеиспеченные лепёшки прямо у подножия канатки",
    "conditions": "Предъявите купон официанту перед заказом.",
    "rating": 4.8,
    "reviewCount": 165,
    "image": "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&auto=format&fit=crop&q=80",
    "qrScans": 870,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-elbrus-cheget-coffee",
    "name": "Кофейня «Cheget Coffee & Bakery»",
    "category": "coffee",
    "categoryName": "Кофейни и пекарни",
    "city": "Приэльбрусье",
    "address": "КБР, Поляна Чегет, пешеходная аллея",
    "lat": 43.2458,
    "lng": 42.5238,
    "phone": "+7 (928) 690-33-44",
    "website": "https://chegetcoffee.ru",
    "workHours": "Пн-Вс: 07:30 — 21:00",
    "discountPercent": 25,
    "discountBadge": "-25% НА КОФЕ И ДЕСЕРТЫ",
    "discountText": "Скидка 25% на авторский раф с кедровыми орехами, свежие круассаны и горный чай в термостаканах для прогулок",
    "conditions": "Покажите QR-код бариста перед оплатой.",
    "rating": 4.9,
    "reviewCount": 198,
    "image": "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop&q=80",
    "qrScans": 1120,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-elbrus-ski-pro",
    "name": "Прокат снаряжения «Elbrus Ski Pro»",
    "category": "entertainment",
    "categoryName": "Туризм, прокаты и экстрим",
    "city": "Приэльбрусье",
    "address": "КБР, Поляна Азау, д. 4",
    "lat": 43.2662,
    "lng": 42.4811,
    "phone": "+7 (928) 710-55-66",
    "website": "https://elbrus-skipro.ru",
    "workHours": "Пн-Вс: 08:00 — 20:00",
    "discountPercent": 25,
    "discountBadge": "-25% НА АРЕНДУ СНАРЯЖЕНИЯ",
    "discountText": "Скидка 25% на аренду горных лыж и сноубордов топовых брендов (Head, Fischer, Burton), ски-сервис и сушку ботинок",
    "conditions": "Действует на аренду от 1 дня. Покажите купон администратору проката.",
    "rating": 4.9,
    "reviewCount": 310,
    "image": "https://images.unsplash.com/photo-1551524559-8af4e6624178?w=600&auto=format&fit=crop&q=80",
    "qrScans": 2540,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-elbrus-el-par",
    "name": "Банный комплекс «Эль Пар» на Баксане",
    "category": "spa",
    "categoryName": "Спа, термы и бани",
    "city": "Приэльбрусье",
    "address": "КБР, пос. Терскол, берег реки Баксан",
    "lat": 43.2541,
    "lng": 42.5142,
    "phone": "+7 (928) 722-77-88",
    "website": "https://el-par-elbrus.ru",
    "workHours": "Пн-Вс: 11:00 — 02:00",
    "discountPercent": 30,
    "discountBadge": "-30% НА СЕАНС БАНИ",
    "discountText": "Скидка 30% на 2-часовой сеанс бани на дровах с купелью из ледниковой горной реки Баксан и травяным чаем с горным мёдом",
    "conditions": "Обязательно предварительное бронирование по телефону. Назовите код купона.",
    "rating": 5,
    "reviewCount": 142,
    "image": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&auto=format&fit=crop&q=80",
    "qrScans": 890,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-elbrus-baydaevo-spa",
    "name": "Банный комплекс «Байдаево Спа & Чан»",
    "category": "spa",
    "categoryName": "Спа, термы и бани",
    "city": "Приэльбрусье",
    "address": "КБР, пос. Байдаево, ул. Лесная, 7",
    "lat": 43.2482,
    "lng": 42.5519,
    "phone": "+7 (928) 708-99-11",
    "website": "https://baydaevo-spa.ru",
    "workHours": "Пн-Вс: 10:00 — 01:00",
    "discountPercent": 25,
    "discountBadge": "-25% НА СИБИРСКИЙ ЧАН",
    "discountText": "Скидка 25% на парение в подогреваемом сибирском банном чане на открытом воздухе с ветками кавказской пихты и эвкалипта",
    "conditions": "По бронированию от 2 часов. Покажите купон администратору спа.",
    "rating": 5,
    "reviewCount": 96,
    "image": "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=600&auto=format&fit=crop&q=80",
    "qrScans": 640,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-elbrus-forest-house",
    "name": "Эко-бани «Forest House Terskol»",
    "category": "spa",
    "categoryName": "Спа, термы и бани",
    "city": "Приэльбрусье",
    "address": "КБР, пос. Терскол, Сосновый бор",
    "lat": 43.2588,
    "lng": 42.5021,
    "phone": "+7 (928) 715-66-77",
    "website": "https://forest-terskol.ru",
    "workHours": "Пн-Вс: 10:00 — 00:00",
    "discountPercent": 20,
    "discountBadge": "-20% НА ВСЕ УСЛУГИ СПА",
    "discountText": "Скидка 20% на русскую парную в окружении реликтовых сосен, ароматерапию и массаж вениками",
    "conditions": "Предъявите купон при оплате сеанса.",
    "rating": 4.9,
    "reviewCount": 118,
    "image": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&auto=format&fit=crop&q=80",
    "qrScans": 530,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-elbrus-jily-su",
    "name": "Джип-туры «Джилы-Су Экспресс»",
    "category": "entertainment",
    "categoryName": "Туризм, прокаты и экстрим",
    "city": "Приэльбрусье",
    "address": "КБР, пос. Терскол / выезд по всему Приэльбрусью",
    "lat": 43.2568,
    "lng": 42.5099,
    "phone": "+7 (928) 700-40-50",
    "website": "https://jily-su-tour.ru",
    "workHours": "Пн-Вс: 07:00 — 21:00",
    "discountPercent": 25,
    "discountBadge": "-25% НА ТУР НА ДЖИПАХ",
    "discountText": "Скидка 25% на индивидуальные и групповые джип-туры на теплые минеральные источники Джилы-Су, водопад Султан и плато Бермамыт",
    "conditions": "Покажите купон при бронировании тура.",
    "rating": 5,
    "reviewCount": 380,
    "image": "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&auto=format&fit=crop&q=80",
    "qrScans": 2190,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-elbrus-moon-glamp",
    "name": "Глэмпинг & Ресторан «Moon Glamp Elbrus»",
    "category": "spa",
    "categoryName": "Спа, термы и бани",
    "city": "Приэльбрусье",
    "address": "КБР, пос. Тегенекли, поляна Баксан",
    "lat": 43.2511,
    "lng": 42.5831,
    "phone": "+7 (928) 718-22-33",
    "website": "https://moonglamp-elbrus.ru",
    "workHours": "Круглосуточно",
    "discountPercent": 20,
    "discountBadge": "-20% НА ПРОЖИВАНИЕ И РЕСТОРАН",
    "discountText": "Скидка 20% на отдых в видовых геокуполах с панорамой Кавказского хребта и авторский ужин от шеф-повара",
    "conditions": "Действует на бронирование от 1 суток и меню ресторана.",
    "rating": 5,
    "reviewCount": 175,
    "image": "https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=600&auto=format&fit=crop&q=80",
    "qrScans": 1340,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-elbrus-vershina",
    "name": "Отель & Панорамный ресторан «Вершина»",
    "category": "restaurants",
    "categoryName": "Рестораны и кафе",
    "city": "Приэльбрусье",
    "address": "КБР, Поляна Азау, д. 2 (у нижней станции канатной дороги)",
    "lat": 43.2758,
    "lng": 42.4839,
    "phone": "+7 (928) 723-45-67",
    "website": "https://vershina-azau.ru",
    "workHours": "Пн-Вс: 08:00 — 23:00",
    "discountPercent": 20,
    "discountBadge": "-20% НА ВСЁ МЕНЮ",
    "discountText": "Скидка 20% на завтраки с видом на белоснежные пики Эльбруса, стейки из форели и фирменный глинтвейн",
    "conditions": "Покажите QR-купон официанту при оформлении счёта.",
    "rating": 4.9,
    "reviewCount": 168,
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
    "qrScans": 720,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-elbrus-alpindustria",
    "name": "Центр экипировки и прокат «АльпИндустрия Азау»",
    "category": "entertainment",
    "categoryName": "Туризм, прокаты и экстрим",
    "city": "Приэльбрусье",
    "address": "КБР, Поляна Азау, отель Альпина, 1 этаж",
    "lat": 43.2762,
    "lng": 42.4828,
    "phone": "+7 (800) 775-16-30",
    "website": "https://alpindustria.ru/elbrus",
    "workHours": "Пн-Вс: 08:00 — 20:00",
    "discountPercent": 25,
    "discountBadge": "-25% НА ПРОКАТ ЛЫЖ И СНАРЯЖЕНИЯ",
    "discountText": "Скидка 25% на аренду экспертного горнолыжного и альпинистского снаряжения (Salomon, Petzl, Scarpa) и ски-сервис",
    "conditions": "Покажите купон на кассе проката при аренде комплекта.",
    "rating": 5,
    "reviewCount": 340,
    "image": "https://images.unsplash.com/photo-1551524559-8af4e6624178?w=600&auto=format&fit=crop&q=80",
    "qrScans": 1890,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-elbrus-tri-sestry",
    "name": "Кафе балкарской кухни «Три Сестры»",
    "category": "restaurants",
    "categoryName": "Рестораны и кафе",
    "city": "Приэльбрусье",
    "address": "КБР, Поляна Азау, около канатной дороги",
    "lat": 43.2755,
    "lng": 42.4837,
    "phone": "+7 (928) 711-22-33",
    "website": "https://tri-sestry-azau.ru",
    "workHours": "Пн-Вс: 08:30 — 22:00",
    "discountPercent": 20,
    "discountBadge": "-20% НА НАЦИОНАЛЬНУЮ КУХНЮ",
    "discountText": "Скидка 20% на нежные хычины с сыром, зеленью и картофелем, шурпу из баранины и домашний облепиховый взвар",
    "conditions": "Покажите QR-код кассиру или официанту.",
    "rating": 4.8,
    "reviewCount": 215,
    "image": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80",
    "qrScans": 1100,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-elbrus-azau-star-spa",
    "name": "Отель & Спа-комплекс «Azau Star Spa»",
    "category": "spa",
    "categoryName": "Спа, термы и бани",
    "city": "Приэльбрусье",
    "address": "КБР, Поляна Азау, отель Azau Star",
    "lat": 43.2748,
    "lng": 42.4851,
    "phone": "+7 (928) 720-00-01",
    "website": "https://azau-star.ru/spa",
    "workHours": "Пн-Вс: 10:00 — 23:00",
    "discountPercent": 30,
    "discountBadge": "-30% НА СПА И БАССЕЙН",
    "discountText": "Скидка 30% на дневное посещение спа-зоны с финской сауной, хаммамом и панорамным подогреваемым бассейном с видом на горы",
    "conditions": "Предъявите купон на стойке спа-ресепшн.",
    "rating": 5,
    "reviewCount": 130,
    "image": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&auto=format&fit=crop&q=80",
    "qrScans": 890,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-elbrus-pirozhki-cheget",
    "name": "Легендарная «Пирожковая на Чегете»",
    "category": "coffee",
    "categoryName": "Кофейни и пекарни",
    "city": "Приэльбрусье",
    "address": "КБР, Поляна Чегет, нижняя станция канатной дороги",
    "lat": 43.2455,
    "lng": 42.5255,
    "phone": "+7 (928) 718-44-11",
    "website": "https://cheget-pirozhki.ru",
    "workHours": "Пн-Вс: 08:30 — 18:00",
    "discountPercent": 20,
    "discountBadge": "-20% НА ВСЮ ВЫПЕЧКУ",
    "discountText": "Скидка 20% на знаменитые горячие жареные пирожки с горными ягодами (черника, брусника, малина) и горный чай",
    "conditions": "Покажите купон на кассе при заказе от 300 рублей.",
    "rating": 5,
    "reviewCount": 480,
    "image": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80",
    "qrScans": 3950,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-elbrus-deep-purple",
    "name": "Гриль-бар & Апре-ски «Deep Purple Cheget»",
    "category": "restaurants",
    "categoryName": "Рестораны и кафе",
    "city": "Приэльбрусье",
    "address": "КБР, Поляна Чегет, отель Чегет, 1 этаж",
    "lat": 43.2449,
    "lng": 42.524,
    "phone": "+7 (928) 712-88-00",
    "website": "https://deeppurple-cheget.ru",
    "workHours": "Пн-Вс: 16:00 — 02:00",
    "discountPercent": 20,
    "discountBadge": "-20% НА ГРИЛЬ И БАР",
    "discountText": "Скидка 20% на сочные ребрышки на гриле, крафтовое кавказское пиво и коктейли в главном рок-баре Приэльбрусья",
    "conditions": "Покажите купон бармену или официанту перед расчетом.",
    "rating": 4.8,
    "reviewCount": 195,
    "image": "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&auto=format&fit=crop&q=80",
    "qrScans": 850,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-elbrus-terskol-freeride-shop",
    "name": "Прокат и экипировка «FreeRide Ski & Snowboard»",
    "category": "entertainment",
    "categoryName": "Туризм, прокаты и экстрим",
    "city": "Приэльбрусье",
    "address": "КБР, пос. Терскол, ул. Баксанская, 15",
    "lat": 43.2736,
    "lng": 42.5273,
    "phone": "+7 (928) 716-55-44",
    "website": "https://terskol-freeride.ru",
    "workHours": "Пн-Вс: 08:00 — 21:00",
    "discountPercent": 25,
    "discountBadge": "-25% НА ФРИРАЙД ПРОКАТ",
    "discountText": "Скидка 25% на прокат широких фрирайд лыж, лавинного снаряжения (биперы, щупы, лопаты) и сноубордов Jones/Burton",
    "conditions": "Покажите купон при оформлении договора проката.",
    "rating": 4.9,
    "reviewCount": 220,
    "image": "https://images.unsplash.com/photo-1551524559-8af4e6624178?w=600&auto=format&fit=crop&q=80",
    "qrScans": 1450,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-elbrus-terskol-quads",
    "name": "Экскурсии на джипах и квадроциклах «Terskol Extreme Tour»",
    "category": "entertainment",
    "categoryName": "Туризм, прокаты и экстрим",
    "city": "Приэльбрусье",
    "address": "КБР, пос. Терскол, ул. Заречная, 8",
    "lat": 43.272,
    "lng": 42.529,
    "phone": "+7 (928) 719-88-77",
    "website": "https://terskol-extreme.ru",
    "workHours": "Пн-Вс: 08:00 — 20:00",
    "discountPercent": 25,
    "discountBadge": "-25% НА ТУР НА КВАДРОЦИКЛАХ",
    "discountText": "Скидка 25% на захватывающие туры на полноприводных квадроциклах к водопаду Девичьи Косы и обсерватории Пик Терскол",
    "conditions": "Покажите купон гиду перед отправлением на маршрут.",
    "rating": 5,
    "reviewCount": 310,
    "image": "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&auto=format&fit=crop&q=80",
    "qrScans": 1980,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-elbrus-beauty-lab",
    "name": "Барбершоп & Студия ухода «Elbrus Beauty Lab»",
    "category": "beauty",
    "categoryName": "Красота и барбершопы",
    "city": "Приэльбрусье",
    "address": "КБР, пос. Терскол, ул. Баксанская, 28",
    "lat": 43.2742,
    "lng": 42.526,
    "phone": "+7 (928) 710-12-34",
    "website": "https://elbrusbeauty.ru",
    "workHours": "Пн-Вс: 10:00 — 21:00",
    "discountPercent": 30,
    "discountBadge": "-30% НА СТРИЖКУ И БОРОДУ",
    "discountText": "Скидка 30% на мужские и женские стрижки, уход за кожей лица после горного солнца и моделирование бороды",
    "conditions": "Действует по предварительной записи. Покажите купон мастеру.",
    "rating": 4.9,
    "reviewCount": 88,
    "image": "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&auto=format&fit=crop&q=80",
    "qrScans": 430,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-elbrus-ozon-7-vershin",
    "name": "Отель-клуб & Ресторан «Ozon 7 Вершин»",
    "category": "restaurants",
    "categoryName": "Рестораны и кафе",
    "city": "Приэльбрусье",
    "address": "КБР, пос. Тегенекли, ул. Балкарская, 1",
    "lat": 43.2505,
    "lng": 42.5855,
    "phone": "+7 (86638) 7-14-14",
    "website": "https://ozon7vershin.ru",
    "workHours": "Пн-Вс: 08:00 — 23:00",
    "discountPercent": 20,
    "discountBadge": "-20% НА МЕНЮ РЕСТОРАНА",
    "discountText": "Скидка 20% на ресторан европейской и альпийской кухни: фондю, форель на углях, стейк рибай и коллекцию вин",
    "conditions": "Покажите QR-код официанту перед закрытием чека.",
    "rating": 4.9,
    "reviewCount": 205,
    "image": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80",
    "qrScans": 950,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-elbrus-adyr-su-forel",
    "name": "Форелевое хозяйство & Гриль-терраса «Ущелье Адыр-Су»",
    "category": "restaurants",
    "categoryName": "Рестораны и кафе",
    "city": "Приэльбрусье",
    "address": "КБР, с. Верхний Баксан, въезд в ущелье Адыр-Су",
    "lat": 43.284,
    "lng": 42.756,
    "phone": "+7 (928) 715-99-44",
    "website": "https://adyr-su-forel.ru",
    "workHours": "Пн-Вс: 10:00 — 21:00",
    "discountPercent": 25,
    "discountBadge": "-25% НА ЖАРЕНУЮ ФОРЕЛЬ",
    "discountText": "Скидка 25% на свежевыловленную радужную форель, запеченную на углях с горными травами, и картофель по-деревенски",
    "conditions": "Покажите купон официанту при заказе блюд из рыбы.",
    "rating": 5,
    "reviewCount": 310,
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
    "qrScans": 1650,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-elbrus-baksan-auto",
    "name": "Автокомплекс & Шиномонтаж «Баксан Экспресс»",
    "category": "auto",
    "categoryName": "Автомойки и детейлинг",
    "city": "Приэльбрусье",
    "address": "КБР, г. Тырныауз, ул. Энеева, 42 (трасса на Эльбрус)",
    "lat": 43.393,
    "lng": 42.924,
    "phone": "+7 (928) 711-66-88",
    "website": "https://baksan-auto.ru",
    "workHours": "Круглосуточно: 24/7",
    "discountPercent": 30,
    "discountBadge": "-30% НА МОЙКУ И ШИНОМОНТАЖ",
    "discountText": "Скидка 30% на бесконтактную мойку от горной соли и реагентов, ошиповку и балансировку колес по дороге на курорт",
    "conditions": "Покажите купон мастеру-приемщику перед началом работ.",
    "rating": 4.8,
    "reviewCount": 140,
    "image": "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=600&auto=format&fit=crop&q=80",
    "qrScans": 810,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-arkhyz-piki",
    "name": "Панорамный ресторан «Пики»",
    "category": "restaurants",
    "categoryName": "Рестораны и кафе",
    "city": "Архыз",
    "address": "КЧР, пос. Романтик, верхняя станция канатной дороги Млечный Путь (2500 м)",
    "lat": 43.5388,
    "lng": 41.1784,
    "phone": "+7 (928) 030-25-00",
    "website": "https://piki-arkhyz.ru",
    "workHours": "Пн-Вс: 09:30 — 17:00",
    "discountPercent": 20,
    "discountBadge": "-20% НА ПАНОРАМНЫЙ ОБЕД",
    "discountText": "Скидка 20% на каре ягненка на гриле, согревающий суп Къарачай шорпа и домашний хворост с видом на Главный Кавказский хребет",
    "conditions": "Предъявите купон официанту до оформления счёта.",
    "rating": 4.9,
    "reviewCount": 315,
    "image": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80",
    "qrScans": 2890,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-arkhyz-tramplin",
    "name": "Ресторан «Трамплин»",
    "category": "restaurants",
    "categoryName": "Рестораны и кафе",
    "city": "Архыз",
    "address": "КЧР, пос. Романтик, ул. Горная, 1 (у канатных дорог)",
    "lat": 43.535,
    "lng": 41.182,
    "phone": "+7 (928) 025-16-50",
    "website": "https://tramplin-arkhyz.ru",
    "workHours": "Пн-Вс: 08:30 — 23:00",
    "discountPercent": 25,
    "discountBadge": "-25% НА ВСЁ МЕНЮ",
    "discountText": "Скидка 25% на сытные завтраки перед каталкой, шашлык на углях, пиццу из печи и горный облепиховый глинтвейн",
    "conditions": "Покажите QR-код официанту при расчёте.",
    "rating": 4.9,
    "reviewCount": 420,
    "image": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80",
    "qrScans": 3820,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-arkhyz-mamalyga",
    "name": "Ресторан «Мамалыга Архыз»",
    "category": "restaurants",
    "categoryName": "Рестораны и кафе",
    "city": "Архыз",
    "address": "КЧР, пос. Романтик, центральная площадь курорта",
    "lat": 43.5355,
    "lng": 41.1812,
    "phone": "+7 (928) 029-77-88",
    "website": "https://mamalyga-arkhyz.ru",
    "workHours": "Пн-Вс: 11:00 — 00:00",
    "discountPercent": 20,
    "discountBadge": "-20% НА ГРУЗИНСКУЮ И ГОРСКУЮ КУХНЮ",
    "discountText": "Скидка 20% на хинкали ручной лепки с рубленым мясом, хачапури по-аджарски из дровяной печи и чашушули",
    "conditions": "Покажите купон официанту до оплаты заказа.",
    "rating": 4.8,
    "reviewCount": 260,
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
    "qrScans": 1940,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-arkhyz-bely-pik",
    "name": "Ресторан-шале «Терраса Белый Пик»",
    "category": "restaurants",
    "categoryName": "Рестораны и кафе",
    "city": "Архыз",
    "address": "КЧР, пос. Архыз, ул. Ленина, 34",
    "lat": 43.5614,
    "lng": 41.2789,
    "phone": "+7 (928) 390-44-55",
    "website": "https://bely-pik.ru",
    "workHours": "Пн-Вс: 10:00 — 23:00",
    "discountPercent": 25,
    "discountBadge": "-25% НА ВСЁ МЕНЮ",
    "discountText": "Скидка 25% на черноморские мидии в соусе дорблю, томленую баранину с розмарином и домашние настойки на травах Кавказа",
    "conditions": "Покажите QR-код официанту перед закрытием чека.",
    "rating": 4.9,
    "reviewCount": 380,
    "image": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80",
    "qrScans": 2750,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-arkhyz-ullu",
    "name": "Ресторан горской кухни «Ullu»",
    "category": "restaurants",
    "categoryName": "Рестораны и кафе",
    "city": "Архыз",
    "address": "КЧР, пос. Архыз, ул. Хубиева, 12",
    "lat": 43.5601,
    "lng": 41.2755,
    "phone": "+7 (928) 385-99-00",
    "website": "https://ullu-arkhyz.ru",
    "workHours": "Пн-Вс: 11:00 — 23:30",
    "discountPercent": 20,
    "discountBadge": "-20% НА КАРАЧАЕВСКИЕ БЛЮДА",
    "discountText": "Скидка 20% на тонкие карачаевские хычины, сохта, джылыгур и парное мясо молодого барашка",
    "conditions": "Покажите купон официанту до расчёта.",
    "rating": 4.9,
    "reviewCount": 195,
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
    "qrScans": 1180,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-arkhyz-hychin-house",
    "name": "Кафе «Хычин Хаус Архыз»",
    "category": "restaurants",
    "categoryName": "Рестораны и кафе",
    "city": "Архыз",
    "address": "КЧР, пос. Архыз, ул. Банковская, 5",
    "lat": 43.5625,
    "lng": 41.2812,
    "phone": "+7 (928) 399-12-12",
    "website": "https://hychin-arkhyz.ru",
    "workHours": "Пн-Вс: 09:00 — 22:00",
    "discountPercent": 25,
    "discountBadge": "-25% НА ХЫЧИНЫ И ШУРПУ",
    "discountText": "Скидка 25% на свежевыпеченные хычины прямо со сковороды: с сыром, зеленью, мясом, листьями свеклы и домашним айраном",
    "conditions": "Предъявите купон на кассе при заказе.",
    "rating": 4.8,
    "reviewCount": 230,
    "image": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80",
    "qrScans": 1540,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-arkhyz-green-park",
    "name": "Спа-комплекс «Грин Парк Архыз»",
    "category": "spa",
    "categoryName": "Спа, термы и бани",
    "city": "Архыз",
    "address": "КЧР, пос. Архыз, Сосновая поляна",
    "lat": 43.5582,
    "lng": 41.2721,
    "phone": "+7 (928) 380-00-55",
    "website": "https://greenpark-arkhyz.ru",
    "workHours": "Пн-Вс: 10:00 — 23:00",
    "discountPercent": 30,
    "discountBadge": "-30% НА БАННЫЙ ЧАН И СПА",
    "discountText": "Скидка 30% на кедровую баню на дровах с горячим молодильным чаном на открытом воздухе среди сосен Архыза",
    "conditions": "По предварительной брони от 2 часов. Назовите код купона.",
    "rating": 5,
    "reviewCount": 168,
    "image": "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=600&auto=format&fit=crop&q=80",
    "qrScans": 1420,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-arkhyz-extreme",
    "name": "Квадроциклы & Снегоходы «Архыз Экстрим»",
    "category": "entertainment",
    "categoryName": "Туризм, прокаты и экстрим",
    "city": "Архыз",
    "address": "КЧР, пос. Архыз, ул. Ленина, 50 / выезд к Софийским водопадам",
    "lat": 43.5638,
    "lng": 41.2855,
    "phone": "+7 (928) 395-50-50",
    "website": "https://arkhyz-extreme.ru",
    "workHours": "Пн-Вс: 08:30 — 19:30",
    "discountPercent": 25,
    "discountBadge": "-25% НА ПРОКАТ И ЭКСКУРСИИ",
    "discountText": "Скидка 25% на маршруты на снегоходах и мощных квадроциклах CFMOTO на перевал Пхия, Дуккинские озера и Белые водопады",
    "conditions": "Покажите купон инструктору перед инструктажем.",
    "rating": 5,
    "reviewCount": 345,
    "image": "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&auto=format&fit=crop&q=80",
    "qrScans": 2680,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-arkhyz-edelveys-coffee",
    "name": "Спешелти кофейня «Эдельвейс Coffee»",
    "category": "coffee",
    "categoryName": "Кофейни и пекарни",
    "city": "Архыз",
    "address": "КЧР, пос. Романтик, ул. Горная, 3",
    "lat": 43.5358,
    "lng": 41.1818,
    "phone": "+7 (928) 027-33-22",
    "website": "https://edelveys-coffee.ru",
    "workHours": "Пн-Вс: 07:30 — 20:00",
    "discountPercent": 25,
    "discountBadge": "-25% НА КОФЕ И ДЕСЕРТЫ",
    "discountText": "Скидка 25% на авторский кофе свежей обжарки (арабика Эфиопия и Колумбия), хрустящие синнабоны и круассаны с миндалем",
    "conditions": "Покажите QR-код бариста перед оплатой.",
    "rating": 5,
    "reviewCount": 210,
    "image": "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop&q=80",
    "qrScans": 1390,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-arkhyz-zolotoy-yagnenok",
    "name": "Ресторан мяса на углях «Золотой Ягнёнок»",
    "category": "restaurants",
    "categoryName": "Рестораны и кафе",
    "city": "Архыз",
    "address": "КЧР, пос. Романтик, ул. Горная, 5",
    "lat": 43.5352,
    "lng": 41.1825,
    "phone": "+7 (928) 028-11-44",
    "website": "https://yagnenok-arkhyz.ru",
    "workHours": "Пн-Вс: 10:00 — 23:30",
    "discountPercent": 20,
    "discountBadge": "-20% НА МЯСО НА УГЛЯХ",
    "discountText": "Скидка 20% на фирменное каре ягненка на живом огне, сочные люля-кебабы и домашний гранатовый соус",
    "conditions": "Покажите купон официанту перед закрытием счёта.",
    "rating": 4.9,
    "reviewCount": 185,
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
    "qrScans": 940,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-arkhyz-lunny-svet",
    "name": "Ресторан альпийской кухни «Лунный Свет» в Allure Lodge",
    "category": "restaurants",
    "categoryName": "Рестораны и кафе",
    "city": "Архыз",
    "address": "КЧР, пос. Романтик, шале Allure Lodge",
    "lat": 43.537,
    "lng": 41.18,
    "phone": "+7 (928) 032-44-66",
    "website": "https://allure-lodge.ru/restaurant",
    "workHours": "Пн-Вс: 08:00 — 23:00",
    "discountPercent": 20,
    "discountBadge": "-20% НА ВСЁ МЕНЮ",
    "discountText": "Скидка 20% на блюда из нежной горной форели, томленую шурпу и домашнюю выпечку в уютной атмосфере деревянного шале",
    "conditions": "Покажите QR-код официанту при заказе.",
    "rating": 4.9,
    "reviewCount": 160,
    "image": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80",
    "qrScans": 810,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-arkhyz-lezginka",
    "name": "Премиум-ресторан «Лезгинка» (Отель Лазурит Архыз)",
    "category": "restaurants",
    "categoryName": "Рестораны и кафе",
    "city": "Архыз",
    "address": "КЧР, пос. Романтик, отель Лазурит Архыз",
    "lat": 43.5345,
    "lng": 41.1835,
    "phone": "+7 (928) 035-77-99",
    "website": "https://lazurit-arkhyz.ru/lezginka",
    "workHours": "Пн-Вс: 12:00 — 00:00",
    "discountPercent": 20,
    "discountBadge": "-20% НА АВТОРСКИЙ УЖИН",
    "discountText": "Скидка 20% на блюда авторской кавказской кухни от бренд-шефа, дегустационные сеты и панорамный вид на горы",
    "conditions": "Покажите QR-код официанту до расчета.",
    "rating": 5,
    "reviewCount": 210,
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
    "qrScans": 1240,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-arkhyz-ski-service",
    "name": "Горнолыжный прокат & Ски-сервис «Кант Архыз»",
    "category": "entertainment",
    "categoryName": "Туризм, прокаты и экстрим",
    "city": "Архыз",
    "address": "КЧР, пос. Романтик, сервис-центр курорта",
    "lat": 43.5358,
    "lng": 41.1815,
    "phone": "+7 (800) 100-27-59",
    "website": "https://kant-arkhyz.ru",
    "workHours": "Пн-Вс: 08:00 — 20:30",
    "discountPercent": 25,
    "discountBadge": "-25% НА ПРОКАТ КОМПЛЕКТА",
    "discountText": "Скидка 25% на аренду горных лыж и сноубордов сезона 2025/2026, заточку кантов на станке Wintersteiger и парафинку",
    "conditions": "Покажите купон на кассе проката.",
    "rating": 4.9,
    "reviewCount": 290,
    "image": "https://images.unsplash.com/photo-1551524559-8af4e6624178?w=600&auto=format&fit=crop&q=80",
    "qrScans": 2310,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-arkhyz-moon-glade",
    "name": "Панорамное кафе «Moon Glade» (Лунная Поляна)",
    "category": "restaurants",
    "categoryName": "Рестораны и кафе",
    "city": "Архыз",
    "address": "КЧР, горнолыжный сектор Лунная Поляна",
    "lat": 43.5415,
    "lng": 41.1612,
    "phone": "+7 (928) 031-15-15",
    "website": "https://moonglade-arkhyz.ru",
    "workHours": "Пн-Вс: 09:00 — 17:00",
    "discountPercent": 20,
    "discountBadge": "-20% НА ОБЕД И НАПИТКИ",
    "discountText": "Скидка 20% на горячие супы, фирменные бургеры и облепиховый чай на трассе Лунной поляны",
    "conditions": "Предъявите купон на кассе кафе.",
    "rating": 4.8,
    "reviewCount": 145,
    "image": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80",
    "qrScans": 870,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-arkhyz-hizhina-lesnika",
    "name": "Ресторан таёжной и кавказской кухни «Хижина Лесника»",
    "category": "restaurants",
    "categoryName": "Рестораны и кафе",
    "city": "Архыз",
    "address": "КЧР, пос. Архыз, ул. Хубиева, 28",
    "lat": 43.5605,
    "lng": 41.277,
    "phone": "+7 (928) 392-66-77",
    "website": "https://hizhina-arkhyz.ru",
    "workHours": "Пн-Вс: 11:00 — 23:00",
    "discountPercent": 20,
    "discountBadge": "-20% НА БЛЮДА ИЗ ДИЧИ",
    "discountText": "Скидка 20% на жаркое из косули, белые грибы в сметанном соусе и настойки на горных ягодах",
    "conditions": "Покажите купон официанту перед оплатой счёта.",
    "rating": 4.9,
    "reviewCount": 175,
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
    "qrScans": 960,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-arkhyz-rafting",
    "name": "Рафтинг-клуб «Архыз Рафт на Зеленчуке»",
    "category": "entertainment",
    "categoryName": "Туризм, прокаты и экстрим",
    "city": "Архыз",
    "address": "КЧР, пос. Архыз, ул. Набережная, 2",
    "lat": 43.563,
    "lng": 41.275,
    "phone": "+7 (928) 388-12-34",
    "website": "https://arkhyz-raft.ru",
    "workHours": "Пн-Вс: 09:00 — 19:00",
    "discountPercent": 25,
    "discountBadge": "-25% НА СПЛАВ ПО РЕКЕ",
    "discountText": "Скидка 25% на сплавы на рафтах по бурной горной реке Большой Зеленчук с сертифицированными гидами и гидрокостюмами",
    "conditions": "Покажите купон администратору рафтинга при бронировании.",
    "rating": 5,
    "reviewCount": 280,
    "image": "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&auto=format&fit=crop&q=80",
    "qrScans": 1540,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-arkhyz-horse-club",
    "name": "Конный клуб «Софийские Кони»",
    "category": "entertainment",
    "categoryName": "Туризм, прокаты и экстрим",
    "city": "Архыз",
    "address": "КЧР, пос. Архыз, ул. Ленина, 72",
    "lat": 43.559,
    "lng": 41.282,
    "phone": "+7 (928) 396-77-88",
    "website": "https://horses-arkhyz.ru",
    "workHours": "Пн-Вс: 08:00 — 19:00",
    "discountPercent": 30,
    "discountBadge": "-30% НА КОННЫЕ ТУРЫ",
    "discountText": "Скидка 30% на верховые прогулки на карачаевских лошадях по ущельям Псыш, Кизгыч и к поляне Таулу",
    "conditions": "Покажите купон инструктору перед поездкой.",
    "rating": 5,
    "reviewCount": 220,
    "image": "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=600&auto=format&fit=crop&q=80",
    "qrScans": 1210,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-arkhyz-termy-spa",
    "name": "Бани и горячие чаны на травах «Архыз Термы»",
    "category": "spa",
    "categoryName": "Спа, термы и бани",
    "city": "Архыз",
    "address": "КЧР, пос. Архыз, ул. Родниковая, 14",
    "lat": 43.562,
    "lng": 41.284,
    "phone": "+7 (928) 397-90-90",
    "website": "https://arkhyz-termy.ru",
    "workHours": "Пн-Вс: 10:00 — 01:00",
    "discountPercent": 25,
    "discountBadge": "-25% НА БАННЫЙ КОМПЛЕКС",
    "discountText": "Скидка 25% на аренду парной из липы с купелью на ледниковой воде и сибирским чаном с альпийским сбором",
    "conditions": "По предварительной записи. Покажите купон администратору.",
    "rating": 5,
    "reviewCount": 155,
    "image": "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=600&auto=format&fit=crop&q=80",
    "qrScans": 890,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-dombay-zula",
    "name": "Легендарное кафе «У Зули» (Домбай)",
    "category": "restaurants",
    "categoryName": "Рестораны и кафе",
    "city": "Домбай",
    "address": "КЧР, пос. Домбай, ул. Карачаевская, 1",
    "lat": 43.2921,
    "lng": 41.6267,
    "phone": "+7 (928) 028-55-11",
    "website": "https://uzuli-dombay.ru",
    "workHours": "Пн-Вс: 09:00 — 23:00",
    "discountPercent": 25,
    "discountBadge": "-25% НА ВСЁ МЕНЮ",
    "discountText": "Скидка 25% в культовом ресторане Домбая на нежнейший шашлык из баранины, горячие карачаевские хычины и шурпу",
    "conditions": "Покажите QR-купон официанту до оформления счёта.",
    "rating": 4.9,
    "reviewCount": 460,
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
    "qrScans": 4150,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-dombay-bizon",
    "name": "Ресторан «Бизон»",
    "category": "restaurants",
    "categoryName": "Рестораны и кафе",
    "city": "Домбай",
    "address": "КЧР, пос. Домбай, ул. Альпийская, 8",
    "lat": 43.2912,
    "lng": 41.6251,
    "phone": "+7 (928) 381-44-22",
    "website": "https://bizon-dombay.ru",
    "workHours": "Пн-Вс: 10:00 — 00:00",
    "discountPercent": 20,
    "discountBadge": "-20% НА МЯСО И СТЕЙКИ",
    "discountText": "Скидка 20% на стейки из дичи, томленые говяжьи щечки и горячий глинтвейн после катания на Мусса-Ачитара",
    "conditions": "Покажите купон официанту перед закрытием счёта.",
    "rating": 4.8,
    "reviewCount": 198,
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
    "qrScans": 1320,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-dombay-kristall",
    "name": "Кафе «Кристалл» на реке Аманауз",
    "category": "restaurants",
    "categoryName": "Рестораны и кафе",
    "city": "Домбай",
    "address": "КЧР, пос. Домбай, отель Кристалл, набережная",
    "lat": 43.2895,
    "lng": 41.6288,
    "phone": "+7 (928) 029-99-33",
    "website": "https://kristall-dombay.ru",
    "workHours": "Пн-Вс: 08:30 — 22:30",
    "discountPercent": 20,
    "discountBadge": "-20% НА ВСЁ МЕНЮ",
    "discountText": "Скидка 20% на блюда кавказской кухни под шум горной реки Аманауз: форель на мангале, лагман и домашний сыр",
    "conditions": "Предъявите купон официанту при заказе.",
    "rating": 4.8,
    "reviewCount": 165,
    "image": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80",
    "qrScans": 980,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-teberda-horse",
    "name": "Конный клуб «Карачай Хорс»",
    "category": "entertainment",
    "categoryName": "Туризм, прокаты и экстрим",
    "city": "Домбай",
    "address": "КЧР, г. Теберда, Тебердинский биосферный заповедник",
    "lat": 43.4512,
    "lng": 41.7435,
    "phone": "+7 (928) 388-77-66",
    "website": "https://karachay-horse.ru",
    "workHours": "Пн-Вс: 08:00 — 19:00",
    "discountPercent": 30,
    "discountBadge": "-30% НА КОННЫЕ ПРОГУЛКИ",
    "discountText": "Скидка 30% на верховые конные туры к Бадукским озёрам и по вековым пихтовым лесам Теберды на лошадях карачаевской породы",
    "conditions": "Покажите купон инструктору перед отправлением на маршрут.",
    "rating": 5,
    "reviewCount": 290,
    "image": "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=600&auto=format&fit=crop&q=80",
    "qrScans": 1850,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-teberda-forel",
    "name": "Форелевое хозяйство «Тебердинская Форель»",
    "category": "restaurants",
    "categoryName": "Рестораны и кафе",
    "city": "Домбай",
    "address": "КЧР, г. Теберда, ул. Карачаевская, 88",
    "lat": 43.4621,
    "lng": 41.7398,
    "phone": "+7 (928) 394-11-88",
    "website": "https://teberda-forel.ru",
    "workHours": "Пн-Вс: 09:00 — 21:00",
    "discountPercent": 25,
    "discountBadge": "-25% НА РЫБАЛКУ И ПРИГОТОВЛЕНИЕ",
    "discountText": "Скидка 25% на ловлю чистейшей горной форели в родниковых прудах и её моментальное приготовление на мангале с травами",
    "conditions": "Покажите купон администратору при взвешивании улова.",
    "rating": 4.9,
    "reviewCount": 380,
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
    "qrScans": 2790,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-dombay-tarelka-ufo",
    "name": "Легендарное кафе «Тарелка UFO 2250м»",
    "category": "restaurants",
    "categoryName": "Рестораны и кафе",
    "city": "Домбай",
    "address": "КЧР, пос. Домбай, гора Мусса-Ачитара, 3-я очередь канатки (2250 м)",
    "lat": 43.298,
    "lng": 41.642,
    "phone": "+7 (928) 029-44-11",
    "website": "https://tarelka-dombay.ru",
    "workHours": "Пн-Вс: 09:30 — 16:30",
    "discountPercent": 20,
    "discountBadge": "-20% НА ВСЁ МЕНЮ В ТАРЕЛКЕ",
    "discountText": "Скидка 20% на горячие хычины, чай с чабрецом и фирменный обед внутри легендарной гостиницы-тарелки финского архитектора Матти Сууронена",
    "conditions": "Покажите купон кассиру перед оплатой.",
    "rating": 5,
    "reviewCount": 520,
    "image": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80",
    "qrScans": 4890,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-dombay-andersen",
    "name": "Уютное кафе-шале «Андерсен Домбай»",
    "category": "restaurants",
    "categoryName": "Рестораны и кафе",
    "city": "Домбай",
    "address": "КЧР, пос. Домбай, ул. Альпийская, 4",
    "lat": 43.2915,
    "lng": 41.6255,
    "phone": "+7 (928) 385-11-00",
    "website": "https://andersen-dombay.ru",
    "workHours": "Пн-Вс: 09:00 — 23:00",
    "discountPercent": 20,
    "discountBadge": "-20% НА ВСЁ МЕНЮ",
    "discountText": "Скидка 20% на пиццу из дровяной печи, домашнюю пасту с грибами Домбая, глинтвейн и фирменные десерты",
    "conditions": "Покажите купон официанту перед закрытием чека.",
    "rating": 4.8,
    "reviewCount": 170,
    "image": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80",
    "qrScans": 890,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-dombay-pro-ski",
    "name": "Горнолыжный прокат «Dombay Pro Ski»",
    "category": "entertainment",
    "categoryName": "Туризм, прокаты и экстрим",
    "city": "Домбай",
    "address": "КЧР, пос. Домбай, ул. Карачаевская, 15",
    "lat": 43.293,
    "lng": 41.6275,
    "phone": "+7 (928) 390-12-34",
    "website": "https://dombay-proski.ru",
    "workHours": "Пн-Вс: 08:00 — 20:00",
    "discountPercent": 30,
    "discountBadge": "-30% НА АРЕНДУ СНАРЯЖЕНИЯ",
    "discountText": "Скидка 30% на прокат горных лыж, сноубордов, шлемов и очков от ведущих мировых брендов (Atomic, Salomon, Burton)",
    "conditions": "Покажите QR-код на кассе проката.",
    "rating": 4.9,
    "reviewCount": 260,
    "image": "https://images.unsplash.com/photo-1551524559-8af4e6624178?w=600&auto=format&fit=crop&q=80",
    "qrScans": 1980,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-dombay-amanauz-banya",
    "name": "Банный клуб на горной реке «Аманауз Баня»",
    "category": "spa",
    "categoryName": "Спа, термы и бани",
    "city": "Домбай",
    "address": "КЧР, пос. Домбай, берег реки Аманауз",
    "lat": 43.2905,
    "lng": 41.628,
    "phone": "+7 (928) 394-55-66",
    "website": "https://amanauz-banya.ru",
    "workHours": "Пн-Вс: 11:00 — 01:00",
    "discountPercent": 25,
    "discountBadge": "-25% НА БАНЮ И ЧАН",
    "discountText": "Скидка 25% на парную на дровах с окунанием в ледяную реку Аманауз и горячий чан с травами Домбая",
    "conditions": "По предварительной брони. Назовите промокод из купона.",
    "rating": 5,
    "reviewCount": 140,
    "image": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&auto=format&fit=crop&q=80",
    "qrScans": 920,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-teberda-quad-extreme",
    "name": "Джип-туры и квадроциклы «Теберда Квадро Экстрим»",
    "category": "entertainment",
    "categoryName": "Туризм, прокаты и экстрим",
    "city": "Домбай",
    "address": "КЧР, г. Теберда, ул. Домбайская, 12",
    "lat": 43.448,
    "lng": 41.742,
    "phone": "+7 (928) 382-77-88",
    "website": "https://teberda-quad.ru",
    "workHours": "Пн-Вс: 08:30 — 19:30",
    "discountPercent": 25,
    "discountBadge": "-25% НА ТУРЫ В ГОРАХ",
    "discountText": "Скидка 25% на внедорожные туры в Джамагатское ущелье к нарзанным источникам и по заповедным тропам",
    "conditions": "Покажите купон инструктору перед стартом маршрута.",
    "rating": 5,
    "reviewCount": 210,
    "image": "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&auto=format&fit=crop&q=80",
    "qrScans": 1470,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-teberda-resort-spa",
    "name": "Спа-отель & Ресторан «Теберда Резорт»",
    "category": "spa",
    "categoryName": "Спа, термы и бани",
    "city": "Домбай",
    "address": "КЧР, г. Теберда, ул. Карачаевская, 102",
    "lat": 43.453,
    "lng": 41.748,
    "phone": "+7 (928) 399-55-11",
    "website": "https://teberda-resort.ru",
    "workHours": "Пн-Вс: 09:00 — 23:00",
    "discountPercent": 20,
    "discountBadge": "-20% НА СПА И УЖИН",
    "discountText": "Скидка 20% на спа-программы с горными травами, бассейн с подогревом и ужин в ресторане кавказской кухни",
    "conditions": "Покажите купон администратору спа-отеля.",
    "rating": 4.9,
    "reviewCount": 165,
    "image": "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=600&auto=format&fit=crop&q=80",
    "qrScans": 790,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-nalchik-sosruko",
    "name": "Культовый ресторан «Сосруко»",
    "category": "restaurants",
    "categoryName": "Рестораны и кафе",
    "city": "Нальчик",
    "address": "КБР, г. Нальчик, гора Малая Кизиловка (подъемник из парка)",
    "lat": 43.4883,
    "lng": 43.6054,
    "phone": "+7 (8662) 42-55-11",
    "website": "https://sosruko-nalchik.ru",
    "workHours": "Пн-Вс: 11:00 — 23:30",
    "discountPercent": 25,
    "discountBadge": "-25% НА ВСЁ МЕНЮ",
    "discountText": "Скидка 25% в главном символе Нальчика — ресторане в виде головы нартского богатыря Сосруко с факелом. Панорама города и кабардинская классика",
    "conditions": "Покажите QR-код официанту перед закрытием счёта.",
    "rating": 4.9,
    "reviewCount": 520,
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
    "qrScans": 4890,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-nalchik-bochka",
    "name": "Ресторан «Бочка»",
    "category": "restaurants",
    "categoryName": "Рестораны и кафе",
    "city": "Нальчик",
    "address": "КБР, г. Нальчик, Атажукинский сад, курортное озеро",
    "lat": 43.4812,
    "lng": 43.5978,
    "phone": "+7 (8662) 77-12-34",
    "website": "https://bochka-nalchik.ru",
    "workHours": "Пн-Вс: 11:00 — 00:00",
    "discountPercent": 20,
    "discountBadge": "-20% НА МЕНЮ И ШАШЛЫК",
    "discountText": "Скидка 20% в знаменитом деревянном здании-бочке: шашлык из баранины, жау-баур, гедлибже и форель на мангале",
    "conditions": "Предъявите купон официанту при расчёте.",
    "rating": 4.9,
    "reviewCount": 390,
    "image": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80",
    "qrScans": 2840,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-nalchik-quanch",
    "name": "Кафе «Къууанч» на парковом озере",
    "category": "restaurants",
    "categoryName": "Рестораны и кафе",
    "city": "Нальчик",
    "address": "КБР, г. Нальчик, Атажукинский сад, Курортное озеро №1",
    "lat": 43.4795,
    "lng": 43.5942,
    "phone": "+7 (928) 077-44-00",
    "website": "https://quanch-nalchik.ru",
    "workHours": "Пн-Вс: 10:00 — 23:00",
    "discountPercent": 20,
    "discountBadge": "-20% НА НАЦИОНАЛЬНЫЕ БЛЮДА",
    "discountText": "Скидка 20% на тонкие балкарские хычины, асык, либжа и прохладный домашний айран на террасе у воды",
    "conditions": "Покажите купон официанту перед оплатой.",
    "rating": 4.9,
    "reviewCount": 280,
    "image": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80",
    "qrScans": 1950,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-nalchik-barashka",
    "name": "Кафе кавказской классики «Барашка»",
    "category": "restaurants",
    "categoryName": "Рестораны и кафе",
    "city": "Нальчик",
    "address": "КБР, г. Нальчик, ул. Тарчокова, 54",
    "lat": 43.4782,
    "lng": 43.5891,
    "phone": "+7 (928) 710-88-88",
    "website": "https://barashka07.ru",
    "workHours": "Пн-Вс: 11:00 — 23:00",
    "discountPercent": 20,
    "discountBadge": "-20% НА ВСЁ МЯСО",
    "discountText": "Скидка 20% на мякоть баранины на углях, люля-кебаб из телятины и хачапури на углях",
    "conditions": "Предъявите купон официанту при расчёте.",
    "rating": 4.8,
    "reviewCount": 210,
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
    "qrScans": 1420,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-nalchik-sreda-coffee",
    "name": "Кофейня & Пекарня «Среда Coffee»",
    "category": "coffee",
    "categoryName": "Кофейни и пекарни",
    "city": "Нальчик",
    "address": "КБР, г. Нальчик, пешеходная ул. Кабардинская, 19",
    "lat": 43.4871,
    "lng": 43.6088,
    "phone": "+7 (928) 720-33-11",
    "website": "https://sreda-nalchik.ru",
    "workHours": "Пн-Вс: 08:00 — 22:00",
    "discountPercent": 25,
    "discountBadge": "-25% НА КОФЕ И ВЫПЕЧКУ",
    "discountText": "Скидка 25% на авторский раф халва, фильтр-кофе, свежие ремесленные тарты и круассаны на Арбате Нальчика",
    "conditions": "Покажите QR-код бариста на кассе.",
    "rating": 5,
    "reviewCount": 310,
    "image": "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop&q=80",
    "qrScans": 2340,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-nalchik-auto-spa",
    "name": "Детейлинг & Мойка «Nalchik Auto Spa»",
    "category": "auto",
    "categoryName": "Автомойки и детейлинг",
    "city": "Нальчик",
    "address": "КБР, г. Нальчик, ул. Кирова, 290",
    "lat": 43.4912,
    "lng": 43.6215,
    "phone": "+7 (928) 714-55-99",
    "website": "https://nalchik-autospa.ru",
    "workHours": "Круглосуточно: 24/7",
    "discountPercent": 30,
    "discountBadge": "-30% НА 3-ФАЗНУЮ МОЙКУ",
    "discountText": "Скидка 30% на премиальную 3-фазную мойку Koch Chemie, химчистку салона торнадором и чернение резины",
    "conditions": "Покажите купон администратору автомойки.",
    "rating": 4.9,
    "reviewCount": 275,
    "image": "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=600&auto=format&fit=crop&q=80",
    "qrScans": 1980,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-nalchik-kavkaz-clan",
    "name": "Барбершоп «Кавказ Клан»",
    "category": "beauty",
    "categoryName": "Красота и барбершопы",
    "city": "Нальчик",
    "address": "КБР, г. Нальчик, пр. Ленина, 32",
    "lat": 43.4862,
    "lng": 43.6142,
    "phone": "+7 (928) 709-11-22",
    "website": "https://kavkazclan.ru",
    "workHours": "Пн-Вс: 10:00 — 21:00",
    "discountPercent": 30,
    "discountBadge": "-30% НА СТРИЖКУ И БОРОДУ",
    "discountText": "Скидка 30% на мужскую стрижку любой сложности, оформление бороды опасной бритвой с распариванием полотенцем",
    "conditions": "Действует на первое посещение или по коду. Покажите барберу.",
    "rating": 4.9,
    "reviewCount": 190,
    "image": "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&auto=format&fit=crop&q=80",
    "qrScans": 1120,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-nalchik-sindika-spa",
    "name": "Спа & Бальнео-комплекс «Синдика»",
    "category": "spa",
    "categoryName": "Спа, термы и бани",
    "city": "Нальчик",
    "address": "КБР, г. Нальчик, курортная зона Долинск, ул. Пирогова, 8",
    "lat": 43.4682,
    "lng": 43.5821,
    "phone": "+7 (8662) 49-27-00",
    "website": "https://sindika07.ru",
    "workHours": "Пн-Вс: 08:00 — 22:00",
    "discountPercent": 25,
    "discountBadge": "-25% НА СПА-ПРОГРАММЫ",
    "discountText": "Скидка 25% на минеральные ванны Долинска, тамбуканские грязевые аппликации и плавание в термальном бассейне",
    "conditions": "Покажите купон на рецепции спа-центра.",
    "rating": 4.8,
    "reviewCount": 240,
    "image": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&auto=format&fit=crop&q=80",
    "qrScans": 1650,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-chegem-canyon",
    "name": "Ресторан «Чегемский Каньон»",
    "category": "restaurants",
    "categoryName": "Рестораны и кафе",
    "city": "Нальчик",
    "address": "КБР, Чегемский район, Чегемские водопады",
    "lat": 43.4182,
    "lng": 43.2165,
    "phone": "+7 (928) 712-40-50",
    "website": "https://chegem-canyon.ru",
    "workHours": "Пн-Вс: 09:00 — 20:00",
    "discountPercent": 25,
    "discountBadge": "-25% НА ШАШЛЫК И ХЫЧИНЫ",
    "discountText": "Скидка 25% на горячие хычины, шашлык из баранины и травяной горный чай прямо у брызг Чегемских водопадов",
    "conditions": "Покажите QR-код при оформлении заказа в кафе.",
    "rating": 4.9,
    "reviewCount": 390,
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
    "qrScans": 2890,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-golubye-ozera",
    "name": "Кафе-терраса у Голубого Озера Церик-Кёль",
    "category": "restaurants",
    "categoryName": "Рестораны и кафе",
    "city": "Нальчик",
    "address": "КБР, Черекский район, берег Нижнего Голубого Озера",
    "lat": 43.2355,
    "lng": 43.5381,
    "phone": "+7 (928) 719-33-22",
    "website": "https://cerik-kel.ru",
    "workHours": "Пн-Вс: 09:00 — 19:30",
    "discountPercent": 20,
    "discountBadge": "-20% НА МЕНЮ С ВИДОМ",
    "discountText": "Скидка 20% на озерную форель на углях, горячий кавказский лаваш и соусы с видом на глубочайшее карстовое озеро мира",
    "conditions": "Покажите купон официанту перед закрытием счёта.",
    "rating": 4.8,
    "reviewCount": 310,
    "image": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80",
    "qrScans": 2150,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-nalchik-ermitazh",
    "name": "Ресторан европейской и кавказской кухни «Эрмитаж»",
    "category": "restaurants",
    "categoryName": "Рестораны и кафе",
    "city": "Нальчик",
    "address": "КБР, г. Нальчик, ул. Ленина, 48",
    "lat": 43.486,
    "lng": 43.609,
    "phone": "+7 (8662) 40-77-55",
    "website": "https://ermitazh-nalchik.ru",
    "workHours": "Пн-Вс: 11:00 — 00:00",
    "discountPercent": 20,
    "discountBadge": "-20% НА ВСЁ МЕНЮ",
    "discountText": "Скидка 20% на авторскую кухню, нежнейшие мясные блюда, коллекционные вина и десерты от шефа",
    "conditions": "Покажите купон официанту перед оплатой счета.",
    "rating": 4.9,
    "reviewCount": 220,
    "image": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80",
    "qrScans": 1180,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-nalchik-coffee-room",
    "name": "Спешелти кофейня «Coffee Room Нальчик»",
    "category": "coffee",
    "categoryName": "Кофейни и пекарни",
    "city": "Нальчик",
    "address": "КБР, г. Нальчик, ул. Кабардинская, 25",
    "lat": 43.4875,
    "lng": 43.6065,
    "phone": "+7 (928) 722-11-99",
    "website": "https://coffeeroom-nalchik.ru",
    "workHours": "Пн-Вс: 08:00 — 22:30",
    "discountPercent": 25,
    "discountBadge": "-25% НА КОФЕ И ТОРТЫ",
    "discountText": "Скидка 25% на авторские напитки, матча-латте, баскский чизкейк и фисташковые круассаны",
    "conditions": "Покажите QR-код бариста на кассе.",
    "rating": 5,
    "reviewCount": 275,
    "image": "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop&q=80",
    "qrScans": 1650,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-nalchik-oldboy",
    "name": "Барбершоп «OldBoy Barbershop Нальчик»",
    "category": "beauty",
    "categoryName": "Красота и барбершопы",
    "city": "Нальчик",
    "address": "КБР, г. Нальчик, ул. Кешокова, 45",
    "lat": 43.484,
    "lng": 43.612,
    "phone": "+7 (928) 715-00-11",
    "website": "https://oldboybarbershop.com/nalchik",
    "workHours": "Пн-Вс: 10:00 — 21:00",
    "discountPercent": 30,
    "discountBadge": "-30% НА СТРИЖКУ И УХОД",
    "discountText": "Скидка 30% на комплекс стрижка + борода, премиальную мужскую косметику и королевское бритье",
    "conditions": "По предварительной записи. Предъявите купон администратору.",
    "rating": 4.9,
    "reviewCount": 310,
    "image": "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&auto=format&fit=crop&q=80",
    "qrScans": 1420,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-nalchik-azimut-sport",
    "name": "Фитнес-центр премиум-класса «Azimut Sport Нальчик»",
    "category": "fitness",
    "categoryName": "Спорт и фитнес",
    "city": "Нальчик",
    "address": "КБР, г. Нальчик, ул. Тарчокова, 12",
    "lat": 43.479,
    "lng": 43.598,
    "phone": "+7 (8662) 44-88-00",
    "website": "https://azimutsport07.ru",
    "workHours": "Пн-Пт: 07:00 — 23:00, Сб-Вс: 08:00 — 22:00",
    "discountPercent": 35,
    "discountBadge": "-35% НА АБОНЕМЕНТ",
    "discountText": "Скидка 35% на первый месяц клубной карты: просторный тренажерный зал LifeFitness, кроссфит-зона и финская сауна",
    "conditions": "Покажите купон в отделе продаж фитнес-клуба.",
    "rating": 5,
    "reviewCount": 180,
    "image": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80",
    "qrScans": 1190,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-nalchik-aushiger-termy",
    "name": "Горячие термальные источники «Аушигер Термы»",
    "category": "spa",
    "categoryName": "Спа, термы и бани",
    "city": "Нальчик",
    "address": "КБР, с. Аушигер (20 км от Нальчика), Нальчикский тракт",
    "lat": 43.364,
    "lng": 43.642,
    "phone": "+7 (928) 718-99-88",
    "website": "https://aushiger-termy.ru",
    "workHours": "Круглосуточно: 24/7",
    "discountPercent": 30,
    "discountBadge": "-30% НА ВХОД В БАССЕЙНЫ",
    "discountText": "Скидка 30% на купание в природных целебных азотно-термальных бассейнах под открытым небом с температурой воды +45°C круглый год",
    "conditions": "Покажите купон на кассе комплекса.",
    "rating": 4.9,
    "reviewCount": 460,
    "image": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&auto=format&fit=crop&q=80",
    "qrScans": 3750,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-nalchik-usadba-chegem",
    "name": "Тур-комплекс & Ресторан «Усадьба Чегем»",
    "category": "restaurants",
    "categoryName": "Рестораны и кафе",
    "city": "Нальчик",
    "address": "КБР, с. Хушто-Сырт, Чегемское ущелье",
    "lat": 43.418,
    "lng": 43.216,
    "phone": "+7 (928) 716-44-33",
    "website": "https://usadba-chegem.ru",
    "workHours": "Пн-Вс: 09:00 — 21:00",
    "discountPercent": 25,
    "discountBadge": "-25% НА НАЦИОНАЛЬНЫЙ ОБЕД",
    "discountText": "Скидка 25% на нежнейший балкарский шашлык, хычины с картофелем и сыром и домашние компоты из кизила",
    "conditions": "Покажите купон официанту до расчёта.",
    "rating": 4.9,
    "reviewCount": 290,
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
    "qrScans": 1980,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-nalchik-crystal-auto",
    "name": "Детейлинг & Премиум мойка «Crystal Auto Nalchik»",
    "category": "auto",
    "categoryName": "Автомойки и детейлинг",
    "city": "Нальчик",
    "address": "КБР, г. Нальчик, ул. Головко, 114",
    "lat": 43.482,
    "lng": 43.618,
    "phone": "+7 (928) 717-33-44",
    "website": "https://crystalauto-nalchik.ru",
    "workHours": "Пн-Вс: 08:30 — 22:00",
    "discountPercent": 30,
    "discountBadge": "-30% НА ПОЛИРОВКУ И МОЙКУ",
    "discountText": "Скидка 30% на восстановительную полировку кузова, нанесение керамического покрытия и бережную мойку",
    "conditions": "Покажите купон администратору детейлинга.",
    "rating": 4.9,
    "reviewCount": 160,
    "image": "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=600&auto=format&fit=crop&q=80",
    "qrScans": 890,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-cherkessk-riviera",
    "name": "Ресторан «Ривьера» в парке Зеленый Остров",
    "category": "restaurants",
    "categoryName": "Рестораны и кафе",
    "city": "Карачаево-Черкесия",
    "address": "КЧР, г. Черкесск, ПКиО Зеленый Остров, набережная",
    "lat": 44.2233,
    "lng": 42.0578,
    "phone": "+7 (8782) 28-11-22",
    "website": "https://riviera-cherkessk.ru",
    "workHours": "Пн-Вс: 11:00 — 00:00",
    "discountPercent": 20,
    "discountBadge": "-20% НА ВСЁ МЕНЮ",
    "discountText": "Скидка 20% на блюда европейской и кавказской кухни на живописной набережной пруда в Зеленом Острове",
    "conditions": "Покажите QR-купон официанту до закрытия счёта.",
    "rating": 4.8,
    "reviewCount": 310,
    "image": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80",
    "qrScans": 2150,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-kchr-medovye",
    "name": "Этно-комплекс & Зиплайн «Медовые Водопады»",
    "category": "entertainment",
    "categoryName": "Туризм, прокаты и экстрим",
    "city": "Карачаево-Черкесия",
    "address": "КЧР, Малокарачаевский р-н, ущелье реки Аликоновка",
    "lat": 43.9161,
    "lng": 42.5358,
    "phone": "+7 (928) 388-00-11",
    "website": "https://medovye-vodopady.ru",
    "workHours": "Пн-Вс: 08:30 — 20:00",
    "discountPercent": 25,
    "discountBadge": "-25% НА ЗИПЛАЙН И ЭКСКУРСИЮ",
    "discountText": "Скидка 25% на полет на самом длинном зиплайне в России (1050 метров) над каньоном водопадов и посещение этнографического музея",
    "conditions": "Предъявите купон на кассе экстрим-парка.",
    "rating": 5,
    "reviewCount": 680,
    "image": "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&auto=format&fit=crop&q=80",
    "qrScans": 6200,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-kchr-zhemchuzhina",
    "name": "Термальный комплекс «Жемчужина Кавказа»",
    "category": "spa",
    "categoryName": "Спа, термы и бани",
    "city": "Карачаево-Черкесия",
    "address": "КЧР, Прикубанский р-н, пос. Кавказский, ул. Строителей, 1А",
    "lat": 44.2647,
    "lng": 42.2184,
    "phone": "+7 (8787) 43-22-11",
    "website": "https://termalkavkaz.com",
    "workHours": "Пн-Вс: 08:00 — 22:00",
    "discountPercent": 30,
    "discountBadge": "-30% НА КУПАНИЕ В БАССЕЙНАХ",
    "discountText": "Скидка 30% на посещение 8 открытых и закрытых бассейнов с природной целебной минеральной горячей водой (от +20°C до +43°C), сауну и хаммам",
    "conditions": "Покажите QR-код кассиру при покупке входного браслета.",
    "rating": 4.9,
    "reviewCount": 840,
    "image": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&auto=format&fit=crop&q=80",
    "qrScans": 7420,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-cherkessk-cezar",
    "name": "Ресторан кавказской кухни «Цезарь»",
    "category": "restaurants",
    "categoryName": "Рестораны и кафе",
    "city": "Карачаево-Черкесия",
    "address": "КЧР, г. Черкесск, ул. Первомайская, 37",
    "lat": 44.225,
    "lng": 42.054,
    "phone": "+7 (8782) 26-44-55",
    "website": "https://cezar-cherkessk.ru",
    "workHours": "Пн-Вс: 11:00 — 00:00",
    "discountPercent": 20,
    "discountBadge": "-20% НА МЕНЮ РЕСТОРАНА",
    "discountText": "Скидка 20% на сочные кавказские шашлыки, долму, теплые салаты и фирменную выпечку",
    "conditions": "Покажите купон официанту перед закрытием счета.",
    "rating": 4.8,
    "reviewCount": 195,
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
    "qrScans": 1150,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-cherkessk-coffee-bean",
    "name": "Кофейня & Кондитерская «Coffee Bean Черкесск»",
    "category": "coffee",
    "categoryName": "Кофейни и пекарни",
    "city": "Карачаево-Черкесия",
    "address": "КЧР, г. Черкесск, пр. Ленина, 58",
    "lat": 44.221,
    "lng": 42.059,
    "phone": "+7 (928) 033-11-88",
    "website": "https://coffeebean-kchr.ru",
    "workHours": "Пн-Вс: 08:00 — 22:00",
    "discountPercent": 25,
    "discountBadge": "-25% НА КОФЕ И ДЕСЕРТЫ",
    "discountText": "Скидка 25% на кофейные напитки свежей обжарки, домашнюю пахлаву и французские эклеры",
    "conditions": "Покажите QR-код бариста на кассе.",
    "rating": 4.9,
    "reviewCount": 220,
    "image": "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop&q=80",
    "qrScans": 1420,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-kchr-tsunami-termy",
    "name": "Оздоровительный термальный комплекс «Цунами»",
    "category": "spa",
    "categoryName": "Спа, термы и бани",
    "city": "Карачаево-Черкесия",
    "address": "КЧР, Кочубеевский/Прикубанский р-н, с. Воронежское",
    "lat": 44.298,
    "lng": 42.12,
    "phone": "+7 (928) 390-88-00",
    "website": "https://tsunami-termy.ru",
    "workHours": "Пн-Вс: 08:00 — 23:00",
    "discountPercent": 30,
    "discountBadge": "-30% НА ТЕРМАЛЬНЫЕ БАССЕЙНЫ",
    "discountText": "Скидка 30% на купание в термальных кремнистых источниках с гидромассажем и аэромассажными зонами",
    "conditions": "Покажите купон на стойке регистрации.",
    "rating": 4.9,
    "reviewCount": 410,
    "image": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&auto=format&fit=crop&q=80",
    "qrScans": 2980,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-cherkessk-borodach",
    "name": "Мужская парикмахерская «Borodach Черкесск»",
    "category": "beauty",
    "categoryName": "Красота и барбершопы",
    "city": "Карачаево-Черкесия",
    "address": "КЧР, г. Черкесск, ул. Доватора, 24",
    "lat": 44.227,
    "lng": 42.062,
    "phone": "+7 (928) 385-66-55",
    "website": "https://borodach-cherkessk.ru",
    "workHours": "Пн-Вс: 10:00 — 21:00",
    "discountPercent": 30,
    "discountBadge": "-30% НА СТРИЖКУ И БОРОДУ",
    "discountText": "Скидка 30% на стрижку от топ-мастера, укладку премиальной помадой и моделирование бороды с компрессом",
    "conditions": "По предварительной записи. Покажите купон администратору.",
    "rating": 4.9,
    "reviewCount": 175,
    "image": "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&auto=format&fit=crop&q=80",
    "qrScans": 890,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-cherkessk-auto-spa",
    "name": "Автокомплекс & Детейлинг «КЧР АвтоСпа»",
    "category": "auto",
    "categoryName": "Автомойки и детейлинг",
    "city": "Карачаево-Черкесия",
    "address": "КЧР, г. Черкесск, ул. Октябрьская, 120",
    "lat": 44.218,
    "lng": 42.052,
    "phone": "+7 (928) 391-22-11",
    "website": "https://autospa-kchr.ru",
    "workHours": "Круглосуточно: 24/7",
    "discountPercent": 30,
    "discountBadge": "-30% НА ДЕТЕЙЛИНГ МОЙКУ",
    "discountText": "Скидка 30% на деликатную мойку кузова, очистку дисков от металлической пыли и гидрофобную обработку стекол",
    "conditions": "Покажите купон мастеру перед заездом в бокс.",
    "rating": 4.8,
    "reviewCount": 140,
    "image": "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=600&auto=format&fit=crop&q=80",
    "qrScans": 780,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-kavkaz-grill",
    "name": "Ресторан «Крыша & Гриль»",
    "category": "restaurants",
    "categoryName": "Рестораны и кафе",
    "city": "Пятигорск",
    "address": "Ставропольский край, г. Пятигорск, пр. Кирова, 65",
    "lat": 44.0486,
    "lng": 43.0594,
    "phone": "+7 (928) 345-67-89",
    "website": "https://roofgrill-kmv.ru",
    "workHours": "Пн-Вс: 11:00 — 00:00",
    "discountPercent": 20,
    "discountBadge": "-20% НА ВСЁ МЕНЮ",
    "discountText": "Скидка 20% на стейки на открытом огне, форель по-кавказски и авторские коктейли с видом на гору Машук",
    "conditions": "Покажите QR-код официанту перед закрытием счёта.",
    "rating": 4.9,
    "reviewCount": 389,
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
    "qrScans": 2840,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-shashlyk-dvor",
    "name": "Шашлычный дом «Кавказский Дворик»",
    "category": "restaurants",
    "categoryName": "Рестораны и кафе",
    "city": "Пятигорск",
    "address": "Ставропольский край, г. Пятигорск, бульвар Гагарина, 12 (у Провала)",
    "lat": 44.0465,
    "lng": 43.0885,
    "phone": "+7 (928) 222-33-44",
    "website": "https://kavkaz-dvorik26.ru",
    "workHours": "Пн-Вс: 10:00 — 23:00",
    "discountPercent": 25,
    "discountBadge": "-25% НА ШАШЛЫК НА УГЛЯХ",
    "discountText": "Скидка 25% на сочный шашлык из баранины, люля-кебаб и домашние соленья возле озера Провал",
    "conditions": "Покажите купон официанту при оформлении заказа.",
    "rating": 4.8,
    "reviewCount": 310,
    "image": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80",
    "qrScans": 1950,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-pyatigorsk-pravilny-coffee",
    "name": "Кофейня «Правильный Кофе» в Цветнике",
    "category": "coffee",
    "categoryName": "Кофейни и пекарни",
    "city": "Пятигорск",
    "address": "Ставропольский край, г. Пятигорск, парк Цветник, ул. Октябрьская, 10",
    "lat": 44.0372,
    "lng": 43.0805,
    "phone": "+7 (928) 301-22-33",
    "website": "https://rightcoffee-kmv.ru",
    "workHours": "Пн-Вс: 08:00 — 22:00",
    "discountPercent": 25,
    "discountBadge": "-25% НА КОФЕ И ДЕСЕРТЫ",
    "discountText": "Скидка 25% на латте соленая карамель, фильтр-кофе и знаменитые круассаны в историческом парке Цветник",
    "conditions": "Покажите QR-код бариста на кассе.",
    "rating": 5,
    "reviewCount": 420,
    "image": "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop&q=80",
    "qrScans": 3100,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-kavkaz-detail",
    "name": "Детейлинг & Мойка «Kavkaz Auto Detail»",
    "category": "auto",
    "categoryName": "Автомойки и детейлинг",
    "city": "Пятигорск",
    "address": "Ставропольский край, г. Пятигорск, ш. Черкесское, 24",
    "lat": 44.0532,
    "lng": 43.041,
    "phone": "+7 (928) 333-77-88",
    "website": "https://kavkaz-detail.ru",
    "workHours": "Круглосуточно: 24/7",
    "discountPercent": 30,
    "discountBadge": "-30% НА КОМПЛЕКСНУЮ МОЙКУ",
    "discountText": "Скидка 30% на премиум-мойку кузова, очистку салона торнадором и нанесение полимерного гидрофобного покрытия",
    "conditions": "Покажите купон мастеру-приемщику перед мойкой.",
    "rating": 4.9,
    "reviewCount": 220,
    "image": "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=600&auto=format&fit=crop&q=80",
    "qrScans": 1540,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-gorec-barber",
    "name": "Барбершоп «Горец»",
    "category": "beauty",
    "categoryName": "Красота и барбершопы",
    "city": "Пятигорск",
    "address": "Ставропольский край, г. Пятигорск, пр. 40 лет Октября, 58",
    "lat": 44.0415,
    "lng": 43.0642,
    "phone": "+7 (928) 888-44-11",
    "website": "https://gorecbarber.ru",
    "workHours": "Пн-Вс: 10:00 — 21:00",
    "discountPercent": 30,
    "discountBadge": "-30% НА ПЕРВУЮ СТРИЖКУ",
    "discountText": "Скидка 30% на мужскую стрижку, моделирование бороды опасной бритвой и уходовый комплекс",
    "conditions": "Покажите купон администратору барбершопа.",
    "rating": 4.9,
    "reviewCount": 310,
    "image": "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&auto=format&fit=crop&q=80",
    "qrScans": 1870,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-pyatigorsk-knyazhna-meri",
    "name": "Исторический ресторан «Княжна Мери»",
    "category": "restaurants",
    "categoryName": "Рестораны и кафе",
    "city": "Пятигорск",
    "address": "Ставропольский край, г. Пятигорск, парк Цветник, ул. Соборная, 2",
    "lat": 44.0375,
    "lng": 43.081,
    "phone": "+7 (928) 350-11-22",
    "website": "https://knyazhna-meri.ru",
    "workHours": "Пн-Вс: 11:00 — 23:30",
    "discountPercent": 20,
    "discountBadge": "-20% НА ВСЁ МЕНЮ",
    "discountText": "Скидка 20% на изысканную русскую и кавказскую кухню в дворянском интерьере лермонтовской эпохи",
    "conditions": "Покажите купон официанту до закрытия счёта.",
    "rating": 4.9,
    "reviewCount": 290,
    "image": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80",
    "qrScans": 1890,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-pyatigorsk-topgun",
    "name": "Барбершоп «TopGun Пятигорск»",
    "category": "beauty",
    "categoryName": "Красота и барбершопы",
    "city": "Пятигорск",
    "address": "Ставропольский край, г. Пятигорск, пр. Калинина, 54А",
    "lat": 44.045,
    "lng": 43.065,
    "phone": "+7 (928) 340-99-88",
    "website": "https://topgunbarber.ru/pyatigorsk",
    "workHours": "Пн-Вс: 10:00 — 22:00",
    "discountPercent": 30,
    "discountBadge": "-30% НА КОМПЛЕКС УСЛУГ",
    "discountText": "Скидка 30% на стрижку от шеф-барбера, камуфляж седины и массаж головы",
    "conditions": "По предварительной записи. Предъявите купон.",
    "rating": 4.9,
    "reviewCount": 240,
    "image": "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&auto=format&fit=crop&q=80",
    "qrScans": 1350,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-pyatigorsk-beshtau-spa",
    "name": "Спа-комплекс & Бассейн «Бештау Спа»",
    "category": "spa",
    "categoryName": "Спа, термы и бани",
    "city": "Пятигорск",
    "address": "Ставропольский край, г. Пятигорск, ул. 1-я Бульварная, 17",
    "lat": 44.055,
    "lng": 43.048,
    "phone": "+7 (8793) 32-11-44",
    "website": "https://hotel-beshtau.ru/spa",
    "workHours": "Пн-Вс: 07:00 — 23:00",
    "discountPercent": 25,
    "discountBadge": "-25% НА АКВА-ТЕРМАЛЬНУЮ ЗОНУ",
    "discountText": "Скидка 25% на плавание в 25-метровом бассейне с минерализованной водой, хаммам и финскую сауну",
    "conditions": "Покажите купон администратору спа-комплекса.",
    "rating": 4.9,
    "reviewCount": 320,
    "image": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&auto=format&fit=crop&q=80",
    "qrScans": 2100,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-kislovodsk-vysota",
    "name": "Ресторан «Высота 5642» в Кисловодске",
    "category": "restaurants",
    "categoryName": "Рестораны и кафе",
    "city": "Кисловодск",
    "address": "Ставропольский край, г. Кисловодск, Курортный бульвар, 14",
    "lat": 43.9056,
    "lng": 42.7156,
    "phone": "+7 (87937) 2-56-42",
    "website": "https://vysota5642-kislovodsk.ru",
    "workHours": "Пн-Вс: 11:00 — 00:00",
    "discountPercent": 20,
    "discountBadge": "-20% НА ВСЁ МЕНЮ",
    "discountText": "Скидка 20% в флагманском ресторане кавказской кухни от Novikov Group: адыгейские пироги, лягур, сочный шашлык и бургеры с брусничным соусом",
    "conditions": "Покажите QR-код официанту перед закрытием счёта.",
    "rating": 4.9,
    "reviewCount": 650,
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
    "qrScans": 5900,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-kislovodsk-chayka",
    "name": "Ресторан в Нацпарке «Чайка»",
    "category": "restaurants",
    "categoryName": "Рестораны и кафе",
    "city": "Кисловодск",
    "address": "Ставропольский край, г. Кисловодск, Курортный парк, у Стеклянной струи",
    "lat": 43.8998,
    "lng": 42.7212,
    "phone": "+7 (928) 380-11-99",
    "website": "https://chayka-park.ru",
    "workHours": "Пн-Вс: 10:00 — 23:00",
    "discountPercent": 20,
    "discountBadge": "-20% НА ОБЕД В ПАРКЕ",
    "discountText": "Скидка 20% на речную форель, домашний суп-лапшу с белыми грибами и травяные чаи в сердце знаменитого парка",
    "conditions": "Предъявите купон официанту до оплаты заказа.",
    "rating": 4.8,
    "reviewCount": 280,
    "image": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80",
    "qrScans": 1820,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-mineral-resort",
    "name": "Термальный Спа-комплекс «Минерал Резорт»",
    "category": "spa",
    "categoryName": "Спа, термы и бани",
    "city": "Кисловодск",
    "address": "Ставропольский край, г. Кисловодск, ул. Ленина, 30",
    "lat": 43.9012,
    "lng": 42.7188,
    "phone": "+7 (87937) 6-77-88",
    "website": "https://mineralresort-kmv.ru",
    "workHours": "Пн-Вс: 08:00 — 22:00",
    "discountPercent": 25,
    "discountBadge": "-25% НА ВСЕ СПА-ПРОЦЕДУРЫ",
    "discountText": "Скидка 25% на нарзанные ванны, гидромассаж, обертывания тамбуканской грязью и посещение бассейна",
    "conditions": "Покажите купон на стойке спа-комплекса.",
    "rating": 4.9,
    "reviewCount": 410,
    "image": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&auto=format&fit=crop&q=80",
    "qrScans": 2750,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-kislovodsk-shafran",
    "name": "Ресторан восточной и кавказской кухни «Шафран»",
    "category": "restaurants",
    "categoryName": "Рестораны и кафе",
    "city": "Кисловодск",
    "address": "Ставропольский край, г. Кисловодск, ул. Володарского, 8",
    "lat": 43.903,
    "lng": 42.719,
    "phone": "+7 (928) 377-22-11",
    "website": "https://shafran-kislovodsk.ru",
    "workHours": "Пн-Вс: 11:00 — 00:00",
    "discountPercent": 20,
    "discountBadge": "-20% НА ВСЁ МЕНЮ",
    "discountText": "Скидка 20% на праздничный шах-плов, садж из телятины на углях и восточные сладости",
    "conditions": "Покажите купон официанту перед закрытием счёта.",
    "rating": 4.9,
    "reviewCount": 310,
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
    "qrScans": 1950,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-kislovodsk-resort-coffee",
    "name": "Кофейня «Курортный Кофе»",
    "category": "coffee",
    "categoryName": "Кофейни и пекарни",
    "city": "Кисловодск",
    "address": "Ставропольский край, г. Кисловодск, Курортный бульвар, 8",
    "lat": 43.9015,
    "lng": 42.718,
    "phone": "+7 (928) 381-00-22",
    "website": "https://resortcoffee-kmv.ru",
    "workHours": "Пн-Вс: 08:00 — 22:00",
    "discountPercent": 25,
    "discountBadge": "-25% НА КОФЕ И ТОРТЫ",
    "discountText": "Скидка 25% на капучино на фундучном молоке, венские вафли с ягодами и яблочный штрудель",
    "conditions": "Покажите QR-код бариста на кассе.",
    "rating": 4.9,
    "reviewCount": 280,
    "image": "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop&q=80",
    "qrScans": 1840,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-essentuki-galereya",
    "name": "Ресторан «Галерея»",
    "category": "restaurants",
    "categoryName": "Рестораны и кафе",
    "city": "Ессентуки",
    "address": "Ставропольский край, г. Ессентуки, Курортный парк, ул. Анджиевского, 1",
    "lat": 44.044,
    "lng": 42.863,
    "phone": "+7 (87934) 6-22-33",
    "website": "https://galereya-essentuki.ru",
    "workHours": "Пн-Вс: 11:00 — 23:00",
    "discountPercent": 20,
    "discountBadge": "-20% НА ВСЁ МЕНЮ",
    "discountText": "Скидка 20% на изысканную европейскую и кавказскую кухню в шаге от питьевой галереи Ессентуки №4 и №17",
    "conditions": "Покажите купон официанту перед закрытием счета.",
    "rating": 4.8,
    "reviewCount": 240,
    "image": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80",
    "qrScans": 1480,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-essentuki-istochnik-spa",
    "name": "Термальный спа-центр «Источник Ессентуки»",
    "category": "spa",
    "categoryName": "Спа, термы и бани",
    "city": "Ессентуки",
    "address": "Ставропольский край, г. Ессентуки, ул. Семашко, 6",
    "lat": 44.041,
    "lng": 42.859,
    "phone": "+7 (800) 200-75-04",
    "website": "https://istochnik-spa.ru",
    "workHours": "Пн-Вс: 08:00 — 22:00",
    "discountPercent": 25,
    "discountBadge": "-25% НА АКВА-ТЕРМЫ",
    "discountText": "Скидка 25% на посещение спа-зоны с минеральным бассейном, дорожкой Кнейпа и соляной пещерой",
    "conditions": "Покажите купон администратору спа-центра.",
    "rating": 4.9,
    "reviewCount": 310,
    "image": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&auto=format&fit=crop&q=80",
    "qrScans": 2190,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-zheleznovodsk-izbushka",
    "name": "Ресторан «Избушка Лесника» у Озера",
    "category": "restaurants",
    "categoryName": "Рестораны и кафе",
    "city": "Железноводск",
    "address": "Ставропольский край, г. Железноводск, Курортное озеро (Тридцатка)",
    "lat": 44.135,
    "lng": 43.028,
    "phone": "+7 (928) 360-44-11",
    "website": "https://izbushka-kmv.ru",
    "workHours": "Пн-Вс: 11:00 — 23:30",
    "discountPercent": 20,
    "discountBadge": "-20% НА МЯСО НА УГЛЯХ",
    "discountText": "Скидка 20% на мясо дикого кабана, шашлык из баранины и фирменную уху на живописной набережной озера",
    "conditions": "Покажите купон официанту перед закрытием счёта.",
    "rating": 4.9,
    "reviewCount": 270,
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
    "qrScans": 1650,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-vladikavkaz-kona",
    "name": "Ресторан осетинской кухни «Къона»",
    "category": "restaurants",
    "categoryName": "Рестораны и кафе",
    "city": "Владикавказ",
    "address": "РСО-Алания, г. Владикавказ, пр. Коста, 74",
    "lat": 43.0211,
    "lng": 44.6819,
    "phone": "+7 (8672) 51-50-50",
    "website": "https://qona-ossetia.ru",
    "workHours": "Пн-Вс: 11:00 — 23:00",
    "discountPercent": 25,
    "discountBadge": "-25% НА НАСТОЯЩИЕ ПИРОГИ",
    "discountText": "Скидка 25% на аутентичные осетинские пироги из дровяной печи (уалибах, фыдджын, цахараджин) и традиционное домашнее пиво",
    "conditions": "Покажите QR-код официанту до расчёта.",
    "rating": 5,
    "reviewCount": 510,
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
    "qrScans": 4890,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-vladikavkaz-myasnoy-dvor",
    "name": "Ресторан кавказской кухни «Мясной Двор»",
    "category": "restaurants",
    "categoryName": "Рестораны и кафе",
    "city": "Владикавказ",
    "address": "РСО-Алания, г. Владикавказ, ул. Ватутина, 53",
    "lat": 43.026,
    "lng": 44.678,
    "phone": "+7 (8672) 54-12-12",
    "website": "https://myasnoydvor15.ru",
    "workHours": "Пн-Вс: 11:00 — 00:00",
    "discountPercent": 20,
    "discountBadge": "-20% НА ВСЁ МЯСО НА УГЛЯХ",
    "discountText": "Скидка 20% на сочные шашлыки, люля из баранины, осетинский сыр и свежеиспеченный лаваш",
    "conditions": "Предъявите купон официанту перед закрытием счета.",
    "rating": 4.9,
    "reviewCount": 310,
    "image": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80",
    "qrScans": 2210,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-vladikavkaz-look-coffee",
    "name": "Кофейня «Look Coffee Владикавказ»",
    "category": "coffee",
    "categoryName": "Кофейни и пекарни",
    "city": "Владикавказ",
    "address": "РСО-Алания, г. Владикавказ, пр. Мира, 31 (пешеходный проспект)",
    "lat": 43.024,
    "lng": 44.682,
    "phone": "+7 (928) 488-33-22",
    "website": "https://lookcoffee15.ru",
    "workHours": "Пн-Вс: 08:00 — 23:00",
    "discountPercent": 25,
    "discountBadge": "-25% НА КОФЕ И ДЕСЕРТЫ",
    "discountText": "Скидка 25% на спешелти раф с лавандой, лимонный тарт и круассаны на историческом проспекте Мира",
    "conditions": "Покажите QR-код бариста перед оплатой.",
    "rating": 5,
    "reviewCount": 340,
    "image": "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop&q=80",
    "qrScans": 2450,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-papaha-makhachkala",
    "name": "Ресторан горской кухни «Папаха»",
    "category": "restaurants",
    "categoryName": "Рестораны и кафе",
    "city": "Махачкала",
    "address": "Республика Дагестан, г. Махачкала, ул. Малыгина, 1",
    "lat": 42.9849,
    "lng": 47.5047,
    "phone": "+7 (988) 291-00-00",
    "website": "https://papaha-rest.ru",
    "workHours": "Пн-Вс: 10:00 — 23:30",
    "discountPercent": 20,
    "discountBadge": "-20% НА ВСЁ МЕНЮ",
    "discountText": "Скидка 20% в знаменитом ресторане от Хабиба Нурмагомедова: аварский хинкал, чуду с мясом и тыквой, курдюк и чай с горными травами",
    "conditions": "Покажите QR-купон официанту до расчёта.",
    "rating": 5,
    "reviewCount": 820,
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
    "qrScans": 7850,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-makhachkala-hinkal-brothers",
    "name": "Ресторан национальной дагестанской кухни «Hinkal Brothers»",
    "category": "restaurants",
    "categoryName": "Рестораны и кафе",
    "city": "Махачкала",
    "address": "Республика Дагестан, г. Махачкала, пр. Расула Гамзатова, 64",
    "lat": 42.979,
    "lng": 47.509,
    "phone": "+7 (988) 293-44-55",
    "website": "https://hinkalbrothers.ru",
    "workHours": "Пн-Вс: 10:30 — 23:30",
    "discountPercent": 20,
    "discountBadge": "-20% НА ВСЕ ВИДЫ ХИНКАЛА",
    "discountText": "Скидка 20% на аварский, даргинский, лезгинский и кумыкский хинкал, курзе с мясом и сушеным творогом",
    "conditions": "Покажите купон официанту перед закрытием счета.",
    "rating": 4.9,
    "reviewCount": 470,
    "image": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80",
    "qrScans": 3900,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-derbent-naryn-kala",
    "name": "Ресторан «Крепость Нарын-Кала»",
    "category": "restaurants",
    "categoryName": "Рестораны и кафе",
    "city": "Дербент",
    "address": "Республика Дагестан, г. Дербент, 8-й Магал, у стен крепости Нарын-Кала",
    "lat": 42.0525,
    "lng": 48.274,
    "phone": "+7 (928) 555-88-22",
    "website": "https://naryn-kala-rest.ru",
    "workHours": "Пн-Вс: 10:00 — 00:00",
    "discountPercent": 25,
    "discountBadge": "-25% НА ВСЁ МЕНЮ",
    "discountText": "Скидка 25% на осетрину на мангале, каспийскую рыбу, дербентский шах-плов и пахлаву с видом на 2000-летнюю крепость ЮНЕСКО",
    "conditions": "Покажите QR-код официанту перед закрытием счёта.",
    "rating": 4.9,
    "reviewCount": 460,
    "image": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80",
    "qrScans": 4120,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  },
  {
    "id": "biz-derbent-stary-derbent",
    "name": "Этно-кафе & Чайхана «Старый Дербент»",
    "category": "restaurants",
    "categoryName": "Рестораны и кафе",
    "city": "Дербент",
    "address": "Республика Дагестан, г. Дербент, ул. 3 Интернационала, 14 (Старый город)",
    "lat": 42.056,
    "lng": 48.288,
    "phone": "+7 (928) 540-12-34",
    "website": "https://staryderbent.ru",
    "workHours": "Пн-Вс: 10:00 — 23:00",
    "discountPercent": 25,
    "discountBadge": "-25% НА ЧАЙ И СЛАДОСТИ",
    "discountText": "Скидка 25% на горный чай с чабрецом в традиционных армудах, горячие чуду и дербентскую пахлаву с грецким орехом",
    "conditions": "Покажите QR-код при расчете в чайхане.",
    "rating": 5,
    "reviewCount": 390,
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
    "qrScans": 2850,
    "isActive": true,
    "createdAt": "2026-11-06T10:00:00.000Z"
  }
];

export class Database {
  constructor() {
    this.data = {
      businesses: [],
      users: [],
      reviews: [],
      coupons: [],
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
      console.log(`[DB] База данных успешно инициализирована с ${this.data.businesses.length} объектами: ${DB_FILE}`);
    } catch (err) {
      console.error('[DB] Ошибка инициализации базы, сбрасываем к сиду:', err);
      this.seedInitialData();
      this.save();
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
    "id": "rev-201",
    "businessId": "biz-elbrus-kogutay",
    "businessName": "Ресторан «Когутай»",
    "userName": "Руслан Тебердиев",
    "userPhone": "+7 (928) ***-45-67",
    "rating": 5,
    "comment": "Вид на ледник Семерка просто волшебный! Форель свежайшая, хычины горячие с хрустящей корочкой. Скидка 25% прошла сразу по купону на кассе!",
    "status": "approved",
    "couponCode": "ELBRUS-7712-VIP",
    "createdAt": "2026-11-06T17:23:18.089Z"
  },
  {
    "id": "rev-202",
    "businessId": "biz-arkhyz-tramplin",
    "businessName": "Ресторан «Трамплин»",
    "userName": "Диана Карданова",
    "userPhone": "+7 (918) ***-11-22",
    "rating": 5,
    "comment": "После каталки в Архызе зашли в Трамплин. Глинтвейн и стейк на высшем уровне, обслуживание быстрое, сэкономили 1200 рублей!",
    "status": "approved",
    "couponCode": "ARKHYZ-5501-WIN",
    "createdAt": "2026-11-06T14:23:18.090Z"
  },
  {
    "id": "rev-203",
    "businessId": "biz-nalchik-sosruko",
    "businessName": "Культовый ресторан «Сосруко»",
    "userName": "Мурат Шогенов",
    "userPhone": "+7 (928) ***-99-00",
    "rating": 5,
    "comment": "Легендарное место Нальчика. Вид с горы Кизиловка на город завораживает. Национальная кухня на высоте!",
    "status": "approved",
    "couponCode": "NALCHIK-9921-GIFT",
    "createdAt": "2026-11-06T11:23:18.090Z"
  },
  {
    "id": "rev-204",
    "businessId": "biz-arkhyz-piki",
    "businessName": "Панорамный ресторан «Пики»",
    "userName": "Алан Дзантиев",
    "userPhone": "+7 (928) ***-33-21",
    "rating": 5,
    "comment": "Вид на Романтик и хребет Абишира-Ахуба фантастический! Скидка по QR сработала в 1 секунду. Спасибо за отличный сервис!",
    "status": "approved",
    "couponCode": "PIKI-3301-PROMO",
    "createdAt": "2026-11-06T07:23:18.090Z"
  },
  {
    "id": "rev-205",
    "businessId": "biz-dombay-zula",
    "businessName": "Легендарное кафе «У Зули» (Домбай)",
    "userName": "Тимур Байрамуков",
    "userPhone": "+7 (928) ***-55-12",
    "rating": 5,
    "comment": "Самые лучшие хычины и шурпа на всем Домбае! Уже 10 лет приезжаем только к Зуле. Скидка 25% за честный отзыв — приятный бонус!",
    "status": "approved",
    "couponCode": "DOMBAY-8812-GOLD",
    "createdAt": "2026-11-06T03:23:18.090Z"
  },
  {
    "id": "rev-206",
    "businessId": "biz-kchr-zhemchuzhina",
    "businessName": "Термальный комплекс «Жемчужина Кавказа»",
    "userName": "Елена Смирнова",
    "userPhone": "+7 (905) ***-67-89",
    "rating": 5,
    "comment": "Горячая минеральная вода в 8 бассейнах — просто блаженство! После купания чувствуешь себя заново рожденным. Купон предъявили на кассе без проблем.",
    "status": "approved",
    "couponCode": "KCHR-4421-SPA",
    "createdAt": "2026-11-05T23:23:18.090Z"
  }
];
    this.data.coupons = [
  {
    "id": "coup-201",
    "code": "ELBRUS-7712-VIP",
    "businessId": "biz-elbrus-kogutay",
    "businessName": "Ресторан «Когутай»",
    "businessCity": "Приэльбрусье",
    "businessAddress": "КБР, Эльбрусский р-н, Поляна Чегет, 1",
    "discountBadge": "-25% НА ВСЁ МЕНЮ",
    "discountText": "Скидка 25% на нежнейший шашлык из баранины, жареную речную форель и горячий облепиховый глинтвейн с видом на ледник Семерка",
    "conditions": "Покажите QR-купон официанту до закрытия счёта.",
    "userName": "Руслан Тебердиев",
    "userPhone": "+7 (928) ***-45-67",
    "status": "active",
    "redeemedAt": null,
    "expiresAt": "2026-11-20T19:23:18.090Z",
    "createdAt": "2026-11-06T17:23:18.090Z"
  },
  {
    "id": "coup-202",
    "code": "ARKHYZ-5501-WIN",
    "businessId": "biz-arkhyz-tramplin",
    "businessName": "Ресторан «Трамплин»",
    "businessCity": "Архыз",
    "businessAddress": "КЧР, пос. Романтик, ул. Горная, 1 (у канатных дорог)",
    "discountBadge": "-25% НА ВСЁ МЕНЮ",
    "discountText": "Скидка 25% на сытные завтраки перед каталкой, шашлык на углях, пиццу из печи и горный облепиховый глинтвейн",
    "conditions": "Покажите QR-код официанту при расчёте.",
    "userName": "Диана Карданова",
    "userPhone": "+7 (918) ***-11-22",
    "status": "active",
    "redeemedAt": null,
    "expiresAt": "2026-11-20T19:23:18.090Z",
    "createdAt": "2026-11-06T14:23:18.090Z"
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
      discountBadge: bizData.discountBadge || `-${bizData.discountPercent || 20}% СКИДКА`,
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
        message: `Купон уже был погашен ${new Date(coupon.redeemedAt).toLocaleString('ru-RU')}`,
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
      message: `Купон ${coupon.code} успешно погашен! Предоставьте клиенту: ${coupon.discountBadge}`,
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
