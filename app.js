'use strict';
const fetch = require("node-fetch");


const Homey = require('homey');

const TodaySwedishHolidayToken = new Homey.FlowToken('TodaySwedishHoliday', {
	type: 'boolean',
	title: 'holiday'
});

const TodaySwedishWorkFreeDayToken = new Homey.FlowToken('TodaySwedishWorkFreeDay', {
	type: 'boolean',
	title: 'Business day'
});

const TodaySwedishCurrentDate = new Homey.FlowToken('TodaySwedishCurrentDate', {
	type: 'string',
	title: 'API Date'
});

var SwedishHolidayToday;
var SwedishHolidayTomorrow;
var SwedishHolidayYesterday;

const DataUrl = "https://api.dryg.net/dagar/v2.1"; //Using api.dryg.net

let HolidayCondition = new Homey.FlowCardCondition('is_holiday');
let DayOfWorkCondition = new Homey.FlowCardCondition('is_DayOfWork');

class MyApp extends Homey.App {

	async onInit() {
		this.log('MyApp is running...');

		HolidayCondition
			.register()
			.registerRunListener(async (args, state) => {
				console.log(args);
				await this.updateDataIfInvalid();
				if (args.CurrentDay == "today") {
					return Promise.resolve(SwedishHolidayToday.ThisIsRedDay);
				} else if (args.CurrentDay == "tomorrow") {
					return Promise.resolve(SwedishHolidayTomorrow.ThisIsRedDay);
				} else if (args.CurrentDay == "yesterday") {
					return Promise.resolve(SwedishHolidayYesterday.ThisIsRedDay);
				} else {
					return Promise.resolve(SwedishHolidayToday.ThisIsRedDay);
				}
			});

		DayOfWorkCondition
			.register()
			.registerRunListener(async (args, state) => {
				await this.updateDataIfInvalid();
				if (args.CurrentDay == "today") {
					return Promise.resolve(SwedishHolidayToday.WorkFreeDay);
				} else if (args.CurrentDay == "tomorrow") {
					return Promise.resolve(SwedishHolidayTomorrow.WorkFreeDay);
				} else if (args.CurrentDay == "yesterday") {
					return Promise.resolve(SwedishHolidayYesterday.WorkFreeDay);
				} else {
					return Promise.resolve(SwedishHolidayToday.WorkFreeDay);
				}
			});

		await TodaySwedishHolidayToken.register();
		await TodaySwedishWorkFreeDayToken.register();
		await TodaySwedishCurrentDate.register();
		await this.GetData();
	};

	async GetData() {
		try {
			console.log("Async getdata start")
			SwedishHolidayYesterday = await this.UpdateDataFromAPI("yesterday");
			SwedishHolidayToday = await this.UpdateDataFromAPI("today");
			SwedishHolidayTomorrow = await this.UpdateDataFromAPI("tomorrow");
			console.log("Async getdata complete");
			await this.updateTokens();
		} catch (e) {
			console.error('Error caught Getdata ' + e);
		}
	};

	async updateTokens() {

		console.log("Updating tokens");
		await TodaySwedishHolidayToken.setValue(SwedishHolidayToday.ThisIsRedDay);
		await TodaySwedishWorkFreeDayToken.setValue(this.convertToBooleanOp(SwedishHolidayToday.WorkFreeDay));
		await TodaySwedishCurrentDate.setValue(SwedishHolidayToday.CurrentDate);

	}

	SelectDate(input) {
		var todayDate = new Date();
		if (input == "today") {
			todayDate.setDate(todayDate.getDate() - 0);
			return todayDate;
		} else if (input == "yesterday") {
			todayDate.setDate(todayDate.getDate() - 1);
			return todayDate;
		} else if (input == "tomorrow") {
			todayDate.setDate(todayDate.getDate() + 1);
			return todayDate;
		} else {
			return todayDate.setDate(todayDate.getDate());
		}
	};

	async updateDataIfInvalid() { //Check if data is old, if old get new data from API
		var d1 = new Date(SwedishHolidayToday.CurrentDate);
		var d2 = new Date();
		d2.setHours(1, 0, 0, 0)

		if (d1.getTime() === d2.getTime()) {
			console.log("Correct day stored")
		} else {
			console.log("Old data, request new from API")
			await GetData();
		}
	};

	createURL(input) {
		const d = this.SelectDate(input);
		const year = d.getFullYear();
		const month = d.getMonth() + 1;
		const day = d.getDate();

		return `${DataUrl}/${year}/${month}/${day}`;
	};

	async runFetchOperation(input) {
		this.log('Fetch data from API ' + input);
		const response = await fetch(this.createURL(input));

		this.log('Fetch data from API complete');

		if (response.ok) {
			return await response.json();
		}

		throw Error(`Failed to get data from API: ${input}, response code: ${response.status}`);
	};

	async UpdateDataFromAPI(input) { //Get data from API adapted for https://api.dryg.net/ with fetch

		const response = await this.runFetchOperation(input);
		return {
			CurrentDate: response.dagar[0]["datum"],
			WorkFreeDay: this.convertToBoolean(response.dagar[0]["arbetsfri dag"]),
			ThisIsRedDay: this.convertToBoolean(response.dagar[0]["r\u00f6d dag"]),
			FlagDay: response.dagar[0]["flaggdag"],
		}; //Return object
	};

	convertToBoolean(input) {

		if (input == "Ja") {
			return true;
		}
		else {
			return false;
		}
	};

	convertToBooleanOp(input) {

		if (input == true) {
			return false;
		}
		else {
			return true;
		}
	};


};

module.exports = MyApp;