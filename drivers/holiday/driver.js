'use strict';

const { Driver } = require('homey');

/**
 * True when any of the comma separated names in `text` is one of `names`.
 */
function matchesName(text, names) {
  const wanted = String(text || '').split(/[,;]/).map((name) => name.trim().toLowerCase()).filter(Boolean);
  return names.some((name) => wanted.includes(name.toLowerCase()));
}

class HolidayDriver extends Driver {

  async onInit() {
    const trigger = (id) => this.homey.flow.getDeviceTriggerCard(id);
    this.newDayTrigger = trigger('new_day');
    this.holidayTodayTrigger = trigger('holiday_today');
    this.flagDayTodayTrigger = trigger('flag_day_today');
    this.holidayTomorrowTrigger = trigger('holiday_tomorrow');
    this.dayOffTomorrowTrigger = trigger('day_off_tomorrow');
    this.workDayTodayTrigger = trigger('work_day_today');
    this.workDayTomorrowTrigger = trigger('work_day_tomorrow');
    this.squeezeDayTodayTrigger = trigger('squeeze_day_today');
    this.squeezeDayTomorrowTrigger = trigger('squeeze_day_tomorrow');
    this.specificHolidayTrigger = trigger('specific_holiday');
    this.nameDayTrigger = trigger('name_day');
    this.daysBeforeHolidayTrigger = trigger('days_before_holiday');

    // Each flow picks its own time, the device triggers every minute with the current time
    for (const card of [this.newDayTrigger, this.holidayTodayTrigger, this.flagDayTodayTrigger,
      this.holidayTomorrowTrigger, this.dayOffTomorrowTrigger, this.workDayTodayTrigger,
      this.workDayTomorrowTrigger, this.squeezeDayTodayTrigger, this.squeezeDayTomorrowTrigger]) {
      card.registerRunListener(async (args, state) => args.time === state.time);
    }
    this.specificHolidayTrigger.registerRunListener(async (args, state) => args.time === state.time
      && args.when === state.when && args.holiday === state.group);
    this.nameDayTrigger.registerRunListener(async (args, state) => args.time === state.time
      && matchesName(args.name, state.names));
    this.daysBeforeHolidayTrigger.registerRunListener(async (args, state) => args.time === state.time
      && Number(args.days) === state.days);

    const condition = (id, test) => this.homey.flow.getConditionCard(id)
      .registerRunListener(async (args) => test(args.device.getDayInfo(args.day), args));
    condition('is_red_day', (day) => day.redDay);
    condition('is_day_off', (day) => day.workFreeDay);
    condition('is_flag_day', (day) => Boolean(day.flagDay));
    condition('is_squeeze_day', (day) => day.squeezeDay);
    condition('is_specific_holiday', (day, args) => day.group === args.holiday);
    condition('has_name_day', (day, args) => matchesName(args.name, day.names));

    this.log('Holiday driver has been initialized');
  }

  async onPairListDevices() {
    // The calendar is the same for everyone, so a single device is enough
    return [
      {
        name: this.homey.__('device.name'),
        data: {
          id: 'swedish-red-days',
        },
      },
    ];
  }

}

module.exports = HolidayDriver;
