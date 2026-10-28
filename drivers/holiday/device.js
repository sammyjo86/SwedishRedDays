'use strict';

const { Device } = require('homey');
const RedDays = require('../../lib/RedDays');

const MONTHS = {
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  sv: ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'],
};

// Wait before trying again after a failed update
const RETRY_DELAY = 10 * 60 * 1000;

// How far ahead "days before a holiday" can look
const MAX_DAYS_BEFORE = 60;

class HolidayDevice extends Device {

  async onInit() {
    // Devices added with an older version are missing newer capabilities
    for (const capability of this.driver.manifest.capabilities) {
      if (!this.hasCapability(capability)) {
        await this.addCapability(capability).catch(this.error);
      }
    }

    this.years = {};
    await this.tick().catch(this.error);
    this.scheduleTick();
    this.log(`${this.getName()} has been initialized`);
  }

  async onDeleted() {
    this.stop();
  }

  async onUninit() {
    this.stop();
  }

  stop() {
    this.stopped = true;
    this.homey.clearTimeout(this.timeout);
  }

  /**
   * Runs tick() just after the start of every minute, so a flow's chosen time
   * is never skipped by timer drift.
   */
  scheduleTick() {
    if (this.stopped) return;
    const delay = 60 * 1000 - (Date.now() % (60 * 1000)) + 1000;
    this.timeout = this.homey.setTimeout(async () => {
      await this.tick().catch(this.error);
      this.scheduleTick();
    }, delay);
  }

  getTimezone() {
    return this.homey.clock.getTimezone();
  }

  /**
   * Today's or tomorrow's day info, used by the condition cards.
   */
  getDayInfo(which) {
    const day = which === 'tomorrow' ? this.tomorrow : this.today;
    if (!day) {
      throw new Error(this.homey.__('error.no_data'));
    }
    return day;
  }

  async tick() {
    const today = RedDays.todayIso(this.getTimezone());
    if (this.dataDay !== today && !(this.retryAt > Date.now())) {
      await this.refresh(today);
    }
    if (this.dataDay === today) {
      await this.fireTriggers(today, RedDays.timeNow(this.getTimezone()));
    }
  }

  async getDay(iso) {
    const year = iso.slice(0, 4);
    if (!this.years[year]) {
      const days = await RedDays.getYear(year);
      this.years[year] = new Map(days.map((day) => [day.date, day]));
    }
    return this.years[year].get(iso);
  }

  /**
   * First public holiday that is a day off, today or later.
   */
  async findNextHoliday(today) {
    const year = Number(today.slice(0, 4));
    for (const y of [year, year + 1]) {
      await this.getDay(`${y}-01-01`);
      for (const day of this.years[y].values()) {
        if (day.date >= today && day.isPublicHoliday) return day;
      }
    }
    return null;
  }

  formatHoliday(day, today) {
    const days = RedDays.daysBetween(today, day.date);
    if (days === 0) return `${day.holiday}, ${this.homey.__('date.today')}`;
    if (days === 1) return `${day.holiday}, ${this.homey.__('date.tomorrow')}`;

    const lang = this.homey.i18n.getLanguage() === 'sv' ? 'sv' : 'en';
    const [, month, date] = day.date.split('-').map(Number);
    return `${day.holiday}, ${date} ${MONTHS[lang][month - 1]}`;
  }

  async refresh(today) {
    try {
      // Recalculate the calendar each day (calculated locally, no API needed)
      this.years = {};
      const day = await this.getDay(today);
      const tomorrow = await this.getDay(RedDays.addDays(today, 1));
      const next = await this.findNextHoliday(today);
      const upcoming = [];
      for (let days = 1; days <= MAX_DAYS_BEFORE; days++) {
        const holiday = await this.getDay(RedDays.addDays(today, days));
        if (holiday.isPublicHoliday) upcoming.push({ days, holiday });
      }

      await this.setCapabilityValue('red_day', day.redDay);
      await this.setCapabilityValue('work_free_day', day.workFreeDay);
      await this.setCapabilityValue('work_free_day_tomorrow', tomorrow.workFreeDay);
      await this.setCapabilityValue('flag_day', Boolean(day.flagDay));
      // Sundays are red days without a holiday name, so show the weekday instead
      await this.setCapabilityValue('holiday_name', day.holiday || (day.redDay ? day.weekday : this.homey.__('holiday.none')));
      await this.setCapabilityValue('name_day', day.names.join(', ') || '-');
      await this.setCapabilityValue('next_holiday', next ? this.formatHoliday(next, today) : '-');
      await this.setCapabilityValue('days_until_holiday', next ? RedDays.daysBetween(today, next.date) : null);
      await this.setCapabilityValue('squeeze_day', day.squeezeDay);
      await this.setCapabilityValue('week_number', day.week || null);

      this.today = day;
      this.tomorrow = tomorrow;
      this.upcoming = upcoming;
      this.dataDay = today;
      this.retryAt = null;
      if (!this.getAvailable()) await this.setAvailable();
    } catch (err) {
      this.error('Failed to update holiday data:', err.message);
      this.retryAt = Date.now() + RETRY_DELAY;
      await this.setUnavailable(err.message).catch(this.error);
    }
  }

  /**
   * Triggers the cards that apply today with the current time. Each card's
   * run listener only lets through flows whose time matches.
   */
  async fireTriggers(today, time) {
    const minute = `${today} ${time}`;
    if (this.lastFired === minute) return;
    this.lastFired = minute;

    const { driver } = this;
    const day = this.today;
    const tomorrow = this.tomorrow;
    const state = { time };

    driver.newDayTrigger.trigger(this, {
      red_day: day.redDay,
      work_free_day: day.workFreeDay,
      flag_day: Boolean(day.flagDay),
      holiday: day.holiday,
      weekday: day.weekday,
      name_day: day.names.join(', '),
    }, state).catch(this.error);

    if (day.holiday) {
      driver.holidayTodayTrigger.trigger(this, { holiday: day.holiday }, state).catch(this.error);
    }
    if (day.flagDay) {
      driver.flagDayTodayTrigger.trigger(this, { flag_day: day.flagDay }, state).catch(this.error);
    }
    if (tomorrow.holiday) {
      driver.holidayTomorrowTrigger.trigger(this, { holiday: tomorrow.holiday }, state).catch(this.error);
    }
    if (tomorrow.workFreeDay) {
      driver.dayOffTomorrowTrigger.trigger(this, {
        holiday: tomorrow.holiday,
        weekday: tomorrow.weekday,
      }, state).catch(this.error);
    }

    if (!day.workFreeDay) {
      driver.workDayTodayTrigger.trigger(this, { weekday: day.weekday }, state).catch(this.error);
    }
    if (!tomorrow.workFreeDay) {
      driver.workDayTomorrowTrigger.trigger(this, { weekday: tomorrow.weekday }, state).catch(this.error);
    }
    if (day.squeezeDay) {
      driver.squeezeDayTodayTrigger.trigger(this, {}, state).catch(this.error);
    }
    if (tomorrow.squeezeDay) {
      driver.squeezeDayTomorrowTrigger.trigger(this, {}, state).catch(this.error);
    }

    for (const [when, info] of [['today', day], ['tomorrow', tomorrow]]) {
      if (info.group) {
        driver.specificHolidayTrigger.trigger(this, { holiday: info.holiday }, { time, when, group: info.group })
          .catch(this.error);
      }
    }

    if (day.names.length) {
      driver.nameDayTrigger.trigger(this, { name: day.names.join(', ') }, { time, names: day.names })
        .catch(this.error);
    }

    for (const { days, holiday } of this.upcoming) {
      driver.daysBeforeHolidayTrigger.trigger(this, { holiday: holiday.holiday, date: holiday.date }, { time, days })
        .catch(this.error);
    }
  }

}

module.exports = HolidayDevice;
