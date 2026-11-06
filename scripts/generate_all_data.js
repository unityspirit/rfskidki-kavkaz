import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

export const CATEGORIES = [
  { id: "all", name: "Все заведения", icon: "🌟" },
  { id: "restaurants", name: "Рестораны и кафе", icon: "🍔" },
  { id: "coffee", name: "Кофейни и пекарни", icon: "☕" },
  { id: "auto", name: "Автомойки и детейлинг", icon: "🚗" },
  { id: "beauty", name: "Красота и барбершопы", icon: "✂️" },
  { id: "spa", name: "Спа, термы и бани", icon: "🧖" },
  { id: "fitness", name: "Спорт и фитнес", icon: "🏋️" },
  { id: "entertainment", name: "Туризм, прокаты и экстрим", icon: "🏔️" },
  { id: "medical", name: "Здоровье и медицина", icon: "💊" }
];

export const CITIES = [
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

console.log('Script loaded. Total cities:', CITIES.length);
