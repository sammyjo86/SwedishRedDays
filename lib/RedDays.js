'use strict';

// The calendar is calculated locally (port of "Svenska dagar API v2.1"),
// no server or network request is needed.
const SvenskaDagar = require('./svenska-dagar');

// Holiday name from the API -> holiday group id used by the "specific holiday" cards
const HOLIDAY_GROUPS = {
  'julafton': 'christmas',
  'juldagen': 'christmas',
  'annandag jul': 'christmas',
  'långfredagen': 'easter',
  'påskafton': 'easter',
  'påskdagen': 'easter',
  'annandag påsk': 'easter',
  'pingstafton': 'pentecost',
  'pingstdagen': 'pentecost',
  'annandag pingst': 'pentecost',
  'valborgsmässoafton': 'valborg',
  'första maj': 'valborg',
  'nyårsafton': 'newyear',
  'nyårsdagen': 'newyear',
  'trettondagsafton': 'trettonhelgen',
  'trettondedag jul': 'trettonhelgen',
  'midsommarafton': 'midsommar',
  'midsommardagen': 'midsommar',
  'kristi himmelfärdsdag': 'Kristi',
  'kristi himmelsfärdsdag': 'Kristi', // Spelling used by the API
  'skärtorsdagen': 'skartorsdagen',
  'allhelgonaafton': 'allahelgonhelgen',
  'alla helgons dag': 'allahelgonhelgen',
  'sveriges nationaldag': 'nationaldag',
};

function holidayGroup(name) {
  return HOLIDAY_GROUPS[String(name || '').toLowerCase()] || '';
}

/**
 * Today's date in the given timezone as "YYYY-MM-DD". Homey runs apps in UTC,
 * so plain `new Date()` would give the wrong day just after midnight.
 */
function todayIso(timezone) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const get = (type) => parts.find((part) => part.type === type).value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}

/**
 * Current time in the given timezone as "HH:mm", the format of a flow time argument.
 */
function timeNow(timezone) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date());
  const get = (type) => parts.find((part) => part.type === type).value;
  return `${get('hour')}:${get('minute')}`;
}

function addDays(iso, days) {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

function daysBetween(fromIso, toIso) {
  return Math.round((Date.parse(toIso) - Date.parse(fromIso)) / 86400000);
}

/**
 * Converts a raw API day into a plain object.
 */
function parseDay(raw) {
  const holiday = raw.helgdag || raw.helgdagsafton || '';
  return {
    date: raw.datum,
    weekday: raw.veckodag || '',
    week: Number(raw.vecka) || 0,
    // A work day between a holiday and a weekend
    squeezeDay: raw['klämdag'] === 'Ja',
    group: holidayGroup(holiday),
    redDay: raw['röd dag'] === 'Ja',
    workFreeDay: raw['arbetsfri dag'] === 'Ja',
    // Public holiday or holiday eve (e.g. Julafton, Valborgsmässoafton)
    holiday,
    // Only real public holidays that are days off, used for "next holiday"
    isPublicHoliday: Boolean(raw.helgdag) && raw['arbetsfri dag'] === 'Ja',
    flagDay: raw.flaggdag || '',
    names: (raw.namnsdag || []).filter(Boolean),
  };
}

/**
 * Raw day objects in the same format as the API, e.g. { year: 2025, month: 12 }.
 */
function rawDays(query) {
  return SvenskaDagar.getDays(query).dagar;
}

/**
 * All days of a year. Async to keep the same interface as when data came from the API.
 */
async function getYear(year) {
  return rawDays({ year: Number(year) }).map(parseDay);
}

/**
 * A single day, iso as "YYYY-MM-DD".
 */
async function getDay(iso) {
  const [year, month, day] = iso.split('-').map(Number);
  return parseDay(rawDays({ year, month, day })[0]);
}

/**
 * A single day as a raw API day object, iso as "YYYY-MM-DD".
 */
function getRawDay(iso) {
  const [year, month, day] = iso.split('-').map(Number);
  return rawDays({ year, month, day })[0];
}

module.exports = {
  todayIso,
  timeNow,
  addDays,
  daysBetween,
  holidayGroup,
  getYear,
  getDay,
  getRawDay,
};
