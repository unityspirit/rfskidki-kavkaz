import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const poolFile = path.resolve(__dirname, '..', 'data', 'candidate_pool.json');

const existing = fs.existsSync(poolFile) ? JSON.parse(fs.readFileSync(poolFile, 'utf8')) : [];

const newCandidates = [
  {
    "id": "biz-elbrus-balka-narzanov",
    "name": "Эко-кафе «Поляна Нарзанов»",
    "category": "restaurants",
    "categoryName": "Рестораны и кафе",
    "city": "Приэльбрусье",
    "address": "КБР, Эльбрусский р-н, с. Байдаево, Поляна Нарзанов",
    "lat": 43.2562,
    "lng": 42.5620,
    "phone": "+7 (928) 722-19-19",
    "website": "https://polyana-narzanov.ru",
    "workHours": "Пн-Вс: 09:00 — 21:00",
    "discountPercent": 20,
    "discountBadge": "-20% У НАРЗАННЫХ ИСТОЧНИКОВ",
    "discountText": "Скидка 20% на хычины на нарзанной воде, шашлык из баранины и травяной горный чай",
    "conditions": "Предъявите купон до оформления счёта.",
    "rating": 4.9,
    "reviewCount": 380,
    "image": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=700&auto=format&fit=crop&q=80",
    "qrScans": 3120
  },
  {
    "id": "biz-arkhyz-gornoe-solntse",
    "name": "SPA-комплекс «Горное Солнце Архыза»",
    "category": "spa",
    "categoryName": "Спа и отдых",
    "city": "Архыз",
    "address": "КЧР, Зеленчукский р-н, пос. Романтик, ул. Горная, 15",
    "lat": 43.5410,
    "lng": 41.1790,
    "phone": "+7 (928) 399-44-11",
    "website": "https://arkhyz-sun-spa.ru",
    "workHours": "Пн-Вс: 10:00 — 23:00",
    "discountPercent": 25,
    "discountBadge": "-25% НА БАССЕЙН И САУНУ",
    "discountText": "Скидка 25% на посещение открытого подогреваемого бассейна с видом на вершины Романтика и кедровую сауну",
    "conditions": "Покажите купон администратору SPA-центра.",
    "rating": 5.0,
    "reviewCount": 490,
    "image": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=700&auto=format&fit=crop&q=80",
    "qrScans": 4150
  },
  {
    "id": "biz-dombay-sofrudju",
    "name": "Панорамное кафе «Софруджу» (2500 м)",
    "category": "restaurants",
    "categoryName": "Рестораны и кафе",
    "city": "Домбай",
    "address": "КЧР, пос. Домбай, гора Мусса-Ачитара, 3-я станция канатной дороги",
    "lat": 43.2980,
    "lng": 41.6420,
    "phone": "+7 (928) 388-77-55",
    "website": "https://sofrudju-dombay.ru",
    "workHours": "Пн-Вс: 09:00 — 17:00",
    "discountPercent": 20,
    "discountBadge": "-20% С ВИДОМ НА ЛЕДНИК",
    "discountText": "Скидка 20% на горный глинтвейн, сытную шурпу и форель на мангале с круговой панорамой пиков Домбая",
    "conditions": "Покажите купон на экране перед оплатой.",
    "rating": 4.9,
    "reviewCount": 460,
    "image": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=700&auto=format&fit=crop&q=80",
    "qrScans": 3890
  },
  {
    "id": "biz-nalchik-sokoliny-kamen",
    "name": "Ресторан кавказской кухни «Соколиный Камень»",
    "category": "restaurants",
    "categoryName": "Рестораны и кафе",
    "city": "Нальчик",
    "address": "КБР, г. Нальчик, Атажукинский сад, аллея Голубых Елей, 4",
    "lat": 43.4720,
    "lng": 43.5930,
    "phone": "+7 (8662) 42-18-18",
    "website": "https://sokol-nalchik.ru",
    "workHours": "Пн-Вс: 11:00 — 23:30",
    "discountPercent": 20,
    "discountBadge": "-20% В АТАЖУКИНСКОМ САДУ",
    "discountText": "Скидка 20% на фирменное гедлибже, баранину по-кабардински и свежеиспеченные лакумы",
    "conditions": "Покажите купон официанту перед закрытием счёта.",
    "rating": 4.9,
    "reviewCount": 510,
    "image": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=700&auto=format&fit=crop&q=80",
    "qrScans": 4320
  },
  {
    "id": "biz-ossetia-karmadon-springs",
    "name": "Термальный SPA-комплекс «Кармадон Спрингс»",
    "category": "spa",
    "categoryName": "Спа и отдых",
    "city": "Владикавказ",
    "address": "РСО-Алания, Пригородный р-н, Кармадонское ущелье, 12",
    "lat": 42.8750,
    "lng": 44.5120,
    "phone": "+7 (988) 835-00-22",
    "website": "https://karmadon-springs.ru",
    "workHours": "Пн-Вс: 09:00 — 22:00",
    "discountPercent": 20,
    "discountBadge": "-20% НА МИНЕРАЛЬНЫЕ ТЕРМЫ",
    "discountText": "Скидка 20% на купание в природных радоновых ваннах и горячих минеральных бассейнах Кармадона",
    "conditions": "Предъявите купон на ресепшн комплекса.",
    "rating": 4.9,
    "reviewCount": 390,
    "image": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=700&auto=format&fit=crop&q=80",
    "qrScans": 3200
  },
  {
    "id": "biz-dagestan-gunib-orlinoe",
    "name": "Этно-ресторан «Орлиное Гнездо Гуниба»",
    "category": "restaurants",
    "categoryName": "Рестораны и кафе",
    "city": "Махачкала",
    "address": "Республика Дагестан, Гунибский р-н, Верхний Гуниб, природный парк",
    "lat": 42.3850,
    "lng": 46.9600,
    "phone": "+7 (988) 291-33-44",
    "website": "https://gunib-nest.ru",
    "workHours": "Пн-Вс: 09:00 — 21:00",
    "discountPercent": 20,
    "discountBadge": "-20% НА ВЫСОТЕ ОРЛОВ",
    "discountText": "Скидка 20% на дагестанский хинкал, курзе с горной зеленью и ароматный чай из трав Гунибского плато",
    "conditions": "Покажите купон официанту перед закрытием счёта.",
    "rating": 5.0,
    "reviewCount": 580,
    "image": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=700&auto=format&fit=crop&q=80",
    "qrScans": 4750
  },
  {
    "id": "biz-kmv-orlinye-skaly",
    "name": "Панорамный гриль-бар «Орлиные Скалы Бештау»",
    "category": "restaurants",
    "categoryName": "Рестораны и кафе",
    "city": "Пятигорск",
    "address": "Ставропольский край, г. Пятигорск, Кольцевая дорога горы Бештау, 7",
    "lat": 44.0950,
    "lng": 43.0320,
    "phone": "+7 (928) 350-88-77",
    "website": "https://beshtau-skaly.ru",
    "workHours": "Пн-Вс: 11:00 — 23:00",
    "discountPercent": 20,
    "discountBadge": "-20% НА ВСЁ ГРИЛЬ-МЕНЮ",
    "discountText": "Скидка 20% на сочные шашлыки, каре ягненка на мангале и овощи-гриль с видом на пятиглавый Бештау",
    "conditions": "Покажите купон официанту.",
    "rating": 4.9,
    "reviewCount": 420,
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?w=700&auto=format&fit=crop&q=80",
    "qrScans": 3610
  },
  {
    "id": "biz-kislovodsk-medovye-rest",
    "name": "Ресторанный комплекс «Медовые Водопады»",
    "category": "restaurants",
    "categoryName": "Рестораны и кафе",
    "city": "Кисловодск",
    "address": "КЧР / граница с Кисловодском, ущелье реки Аликоновка, Медовые водопады",
    "lat": 43.9150,
    "lng": 42.6250,
    "phone": "+7 (928) 385-15-15",
    "website": "https://medovye-vodo.ru",
    "workHours": "Пн-Вс: 09:00 — 20:00",
    "discountPercent": 20,
    "discountBadge": "-20% У МЕДОВЫХ ВОДОПАДОВ",
    "discountText": "Скидка 20% на карачаевские хычины, шашлык на углях и травяной горный сбор с мёдом у бурлящих водопадов",
    "conditions": "Покажите купон при заказе.",
    "rating": 4.9,
    "reviewCount": 630,
    "image": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=700&auto=format&fit=crop&q=80",
    "qrScans": 5200
  }
];

const existingIds = new Set(existing.map(x => x.id));
let addedCount = 0;
for (const item of newCandidates) {
  if (!existingIds.has(item.id)) {
    existing.push(item);
    addedCount++;
  }
}

fs.writeFileSync(poolFile, JSON.stringify(existing, null, 2), 'utf8');
console.log(`Candidate pool replenished! Total in pool: ${existing.length} (+${addedCount} new candidates)`);
