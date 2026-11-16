const config = require('../config');
const { HttpError } = require('../utils/httpError');

const TZ = 'Asia/Jakarta';
const CITIES = ['Jakarta', 'Bandung', 'Surabaya', 'Yogyakarta'];

const DEMO = {
  Jakarta: { temp: 28, condition: 'Partly Cloudy', feelsLike: 31, windKmh: 12, humidity: 65, pressure: 1010, cloudCover: 45, rainChance: 15, sunrise: '05:48', sunset: '17:52' },
  Bandung: { temp: 24, condition: 'Rainy', feelsLike: 26, windKmh: 9, humidity: 82, pressure: 1012, cloudCover: 85, rainChance: 70, sunrise: '05:44', sunset: '17:49' },
  Surabaya: { temp: 31, condition: 'Sunny', feelsLike: 35, windKmh: 14, humidity: 58, pressure: 1009, cloudCover: 10, rainChance: 5, sunrise: '05:30', sunset: '17:36' },
  Yogyakarta: { temp: 27, condition: 'Partly Cloudy', feelsLike: 29, windKmh: 10, humidity: 70, pressure: 1011, cloudCover: 50, rainChance: 25, sunrise: '05:34', sunset: '17:41' },
};

// There are no real indoor sensors yet, so this block is always demo data.
const INDOOR = { temp: 24, comfort: 'Comfortable', humidity: 58, airQuality: 'Good', co2: 420, noise: 32 };

const HOUR_STEPS = 8; // "now" plus seven 3-hour steps = the next 21 hours
const DAILY_MAX = 6;

const hourLabel = (date) => date.toLocaleTimeString('en-US', { hour: 'numeric', timeZone: TZ });
const clock = (date) => date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: TZ });
const dayKey = (date) => date.toLocaleDateString('en-CA', { timeZone: TZ });

function dayLabels(date, index) {
  return {
    label: index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'long', timeZone: TZ }),
    date: date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: TZ }),
  };
}

const labelHumidity = (h) => (h < 30 ? 'Dry' : h <= 70 ? 'Good' : 'Humid');
const labelWind = (w) => (w < 20 ? 'Normal' : w < 40 ? 'Breezy' : 'Strong');
const labelRain = (r) => (r < 30 ? 'Low' : r < 60 ? 'Moderate' : 'High');
const labelCloud = (c) => (c < 25 ? 'Clear' : c < 70 ? 'Partly' : 'Overcast');
const labelUv = (u) => (u == null ? 'N/A' : u < 3 ? 'Low' : u < 6 ? 'Moderate' : u < 8 ? 'High' : 'Very High');
const labelFeels = (feels, temp) => (feels - temp >= 3 ? 'Warmer' : temp - feels >= 3 ? 'Cooler' : 'Normal');

function demoReport(city) {
  const base = DEMO[city];
  const now = Date.now();

  const curve = [0, 1, 2, 3, 2, 0, -1, -2];
  const hourConditions = [base.condition, 'Cloudy', base.condition, 'Cloudy', 'Rainy', 'Cloudy', 'Cloudy', 'Cloudy'];
  const hourly = curve.map((d, i) => ({
    label: i === 0 ? 'Now' : hourLabel(new Date(now + i * 3 * 3600 * 1000)),
    temp: base.temp + d,
    condition: hourConditions[i],
  }));

  const deltas = [0, -3, -5, -4, -2, 1];
  const dayConditions = [base.condition, 'Stormy', 'Rainy', 'Stormy', 'Rainy', 'Partly Cloudy'];
  const daily = deltas.map((d, i) => ({
    ...dayLabels(new Date(now + i * 86400 * 1000), i),
    max: base.temp + d,
    min: base.temp + d - 6,
    condition: dayConditions[i],
  }));

  return { ...base, visibilityKm: 10, uvIndex: 6, hourly, daily };
}

function normalizeCondition(weather) {
  const main = weather.main;
  const desc = weather.description || '';
  if (main === 'Clear') return 'Sunny';
  if (main === 'Clouds') return /few|scattered/.test(desc) ? 'Partly Cloudy' : 'Cloudy';
  if (main === 'Rain' || main === 'Drizzle') return 'Rainy';
  if (main === 'Thunderstorm') return 'Stormy';
  if (main === 'Snow') return 'Snowy';
  return 'Foggy';
}

const mostCommon = (items) => {
  const counts = {};
  items.forEach((i) => (counts[i] = (counts[i] || 0) + 1));
  return Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];
};

function buildDaily(list) {
  const groups = new Map();
  list.forEach((f) => {
    const key = dayKey(new Date(f.dt * 1000));
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(f);
  });

  return [...groups.values()].slice(0, DAILY_MAX).map((entries, i) => ({
    ...dayLabels(new Date(entries[0].dt * 1000), i),
    max: Math.round(Math.max(...entries.map((e) => e.main.temp_max))),
    min: Math.round(Math.min(...entries.map((e) => e.main.temp_min))),
    condition: mostCommon(entries.map((e) => normalizeCondition(e.weather[0]))),
  }));
}

const cache = new Map();
const TTL_MS = 10 * 60 * 1000;

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new HttpError(502, 'Weather provider unavailable');
  return res.json();
}

async function liveReport(city) {
  const q = encodeURIComponent(`${city},ID`);
  const key = config.weatherApiKey;
  const base = 'https://api.openweathermap.org/data/2.5';

  const [current, forecast] = await Promise.all([
    fetchJson(`${base}/weather?q=${q}&units=metric&appid=${key}`),
    fetchJson(`${base}/forecast?q=${q}&units=metric&appid=${key}`),
  ]);

  const condition = normalizeCondition(current.weather[0]);
  const temp = Math.round(current.main.temp);

  return {
    temp,
    condition,
    feelsLike: Math.round(current.main.feels_like),
    windKmh: Math.round(current.wind.speed * 3.6),
    humidity: current.main.humidity,
    pressure: current.main.pressure,
    cloudCover: current.clouds?.all ?? 0,
    visibilityKm: Math.round((current.visibility ?? 10000) / 1000),
    rainChance: Math.round((forecast.list[0]?.pop ?? 0) * 100),
    uvIndex: null, // not available on the free OpenWeatherMap endpoints
    sunrise: clock(new Date(current.sys.sunrise * 1000)),
    sunset: clock(new Date(current.sys.sunset * 1000)),
    hourly: [
      { label: 'Now', temp, condition },
      ...forecast.list.slice(0, HOUR_STEPS - 1).map((f) => ({
        label: hourLabel(new Date(f.dt * 1000)),
        temp: Math.round(f.main.temp),
        condition: normalizeCondition(f.weather[0]),
      })),
    ],
    daily: buildDaily(forecast.list),
  };
}

async function getReport(city) {
  if (!config.weatherApiKey) return demoReport(city);

  const hit = cache.get(city);
  if (hit && hit.expires > Date.now()) return hit.value;

  const value = await liveReport(city);
  cache.set(city, { value, expires: Date.now() + TTL_MS });
  return value;
}

async function getDashboard(city) {
  const r = await getReport(city);
  return {
    location: { city, country: 'ID' },
    date: new Date().toISOString(),
    current: {
      temp: r.temp,
      condition: r.condition,
      high: r.daily[0]?.max ?? r.temp,
      low: r.daily[0]?.min ?? r.temp,
      pressure: r.pressure,
      visibilityKm: r.visibilityKm,
    },
    hourly: r.hourly,
    daily: r.daily,
    sun: { sunrise: r.sunrise, sunset: r.sunset },
    highlights: {
      feelsLike: { value: r.feelsLike, label: labelFeels(r.feelsLike, r.temp) },
      windKmh: { value: r.windKmh, label: labelWind(r.windKmh) },
      rainChance: { value: r.rainChance, label: labelRain(r.rainChance) },
      humidity: { value: r.humidity, label: labelHumidity(r.humidity) },
      uvIndex: { value: r.uvIndex, label: labelUv(r.uvIndex) },
      cloudCover: { value: r.cloudCover, label: labelCloud(r.cloudCover) },
    },
    indoor: INDOOR,
    demo: !config.weatherApiKey,
  };
}

async function getCities() {
  return Promise.all(
    CITIES.map(async (city) => {
      const r = await getReport(city);
      return {
        city,
        temp: r.temp,
        condition: r.condition,
        high: r.daily[0]?.max ?? r.temp,
        low: r.daily[0]?.min ?? r.temp,
        humidity: r.humidity,
        windKmh: r.windKmh,
        rainChance: r.rainChance,
      };
    })
  );
}

const SEVERITY_ORDER = { warning: 0, advisory: 1, info: 2 };

// Alerts are derived from the same weather report the dashboard uses.
function buildAlerts(city, r) {
  const alerts = [];
  const add = (severity, slug, title, message) =>
    alerts.push({ id: `${city.toLowerCase()}-${slug}`, city, severity, title, message });

  if (r.rainChance >= 60) {
    add('warning', 'rain', 'Heavy rain likely', `${r.rainChance}% chance of rain today. Carry an umbrella and watch for local flooding.`);
  }

  const stormIndex = r.daily.slice(0, 3).findIndex((d) => d.condition === 'Stormy');
  if (stormIndex !== -1) {
    const when = r.daily[stormIndex].label.toLowerCase();
    add(
      stormIndex === 0 ? 'warning' : 'advisory',
      'storm',
      `Thunderstorms expected ${when}`,
      'Avoid open areas during storms and unplug sensitive electronics.'
    );
  }

  if (r.feelsLike >= 35) {
    add('advisory', 'heat', 'Heat advisory', `It feels like ${r.feelsLike}°C. Stay hydrated and limit time in direct sun.`);
  }
  if (r.windKmh >= 30) {
    add('advisory', 'wind', 'Strong winds', `Winds around ${r.windKmh} km/h. Secure loose outdoor items.`);
  }
  if (r.uvIndex != null && r.uvIndex >= 8) {
    add('advisory', 'uv', 'High UV index', `UV index is ${r.uvIndex}. Use sunscreen and seek shade at midday.`);
  }
  if (r.humidity >= 85) {
    add('info', 'humidity', 'Very humid', `Humidity is ${r.humidity}%. It may feel warmer than the temperature suggests.`);
  }

  return alerts;
}

async function getAlerts() {
  const perCity = await Promise.all(CITIES.map(async (city) => buildAlerts(city, await getReport(city))));
  return perCity.flat().sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
}

module.exports = { CITIES, getDashboard, getCities, getAlerts };