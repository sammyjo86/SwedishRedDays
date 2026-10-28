'use strict';
const Homey = require('homey');
const { todayIso, addDays, holidayGroup, getRawDay } = require('./lib/RedDays');

console.log('Declare variables');
//Create var
let SwedishHolidayToday;
let SwedishHolidayTomorrow;
let SwedishHolidayYesterday;

console.log('Start app');

class MyApp extends Homey.App {

	async onInit() {
		console.log(this.homey.__("title"));
		console.log('is running...');
		console.log(this.homey.__("tags.TodaySwedishHoliday"));
		
		console.log('Register Global Tokens');
		await this.homey.flow.createToken("TodaySwedishHoliday", {
			type: "boolean",
			title: this.homey.__("tags.TodaySwedishHoliday"),
		  });
		await this.homey.flow.createToken("TodaySwedishWorkFreeDay", {
			type: "boolean",
			title: this.homey.__("tags.TodaySwedishWorkFreeDay"),
		  });
		await this.homey.flow.createToken("TodaySwedishCurrentDate", {
			type: "string",
			title: this.homey.__("tags.TodaySwedishCurrentDate"),
		  });
		await this.homey.flow.createToken("TodayFlagDayToken", {
			type: "boolean",
			title: this.homey.__("tags.TodayFlagDay"),
		  });
		await this.homey.flow.createToken("TodayWeekDay", {
			type: "string",
			title: this.homey.__("tags.TodayWeekDay"),
		  });
		await this.homey.flow.createToken("FirstNameOfTheDay", {
			type: "string",
			title: this.homey.__("tags.FirstNameOfTheDay"),
		  });
		await this.homey.flow.createToken("SecondNameOfTheDay", {
			type: "string",
			title: this.homey.__("tags.SecondNameOfTheDay"),
		  });
		await this.homey.flow.createToken("ThirdNameOfTheDay", {
			type: "string",
			title: this.homey.__("tags.ThirdNameOfTheDay"),
		  });
		await this.homey.flow.createToken("HolidayNameToken", {
			type: "string",
			title: this.homey.__("tags.HolidayNameToken"),
		  });

		//RegisterCards
		console.log('Create flow cards');
		const HolidayCondition = this.homey.flow.getConditionCard('is_holiday');
		HolidayCondition
			.registerRunListener(async (args, state) => {
				await this.updateDataIfInvalid();

				if (args.CurrentDay == "today") {
					console.log('HolidayCondition SwedishHolidayToday.ThisIsRedDay');
					return SwedishHolidayToday.ThisIsRedDay;
				} else if (args.CurrentDay == "tomorrow") {
					console.log('HolidayCondition SwedishHolidayTomorrow.ThisIsRedDay');
					return SwedishHolidayTomorrow.ThisIsRedDay;
				} else if (args.CurrentDay == "yesterday") {
					console.log('HolidayCondition SwedishHolidayYesterday.ThisIsRedDay');
					return SwedishHolidayYesterday.ThisIsRedDay;
				} else {
					console.log('HolidayCondition SwedishHolidayToday.ThisIsRedDay');
					return SwedishHolidayToday.ThisIsRedDay;
				}
			});

		const DayOfWorkCondition = this.homey.flow.getConditionCard('is_DayOfWork');
		DayOfWorkCondition
			.registerRunListener(async (args, state) => {
				await this.updateDataIfInvalid();

				if (args.CurrentDay == "today") {
					return SwedishHolidayToday.WorkFreeDay;
				} else if (args.CurrentDay == "tomorrow") {
					return SwedishHolidayTomorrow.WorkFreeDay;
				} else if (args.CurrentDay == "yesterday") {
					return SwedishHolidayYesterday.WorkFreeDay;
				} else {
					return SwedishHolidayToday.WorkFreeDay;
				}
			});

		const FlagDayCondition = this.homey.flow.getConditionCard('is_FlagDay');
		FlagDayCondition
		.registerRunListener(async (args, state) => {
			await this.updateDataIfInvalid();

			if (args.CurrentDay == "today") {
				return SwedishHolidayToday.ThisIsFlagDay;
			} else if (args.CurrentDay == "tomorrow") {
				return SwedishHolidayTomorrow.ThisIsFlagDay;
			} else if (args.CurrentDay == "yesterday") {
				return SwedishHolidayYesterday.ThisIsFlagDay;
			} else {
				return SwedishHolidayToday.ThisIsFlagDay;
			}
		});

		const is_MasterHoliday = this.homey.flow.getConditionCard('is_MasterHoliday');
		is_MasterHoliday
		.registerRunListener(async (args, state) => {
			await this.updateDataIfInvalid();

			console.log("VAR data "+ SwedishHolidayToday.MasterHoliday);
			console.log("ARGS data "+ args.MasterHoliday);

			if (args.MasterHoliday == SwedishHolidayToday.MasterHoliday) {
				return true;
			} else {
				return false;
			}
		});
		
		//Get data on appinit
		console.log('Prepare to get data');
		await this.GetData();
		console.log('Data fetched app onInit is complete');

		this.homey.setInterval(this.updateDataIfInvalid.bind(this), 1000 * 60 * 10);
	};

	async GetData() { //Gets data from the API
		try {
			console.log("Async getdata start")
			SwedishHolidayYesterday = await this.UpdateDataFromAPI("yesterday");
			SwedishHolidayToday = await this.UpdateDataFromAPI("today");
			SwedishHolidayTomorrow = await this.UpdateDataFromAPI("tomorrow");
			console.log("Async getdata complete");

			await this.updateTokens();

		} catch (e) {
			console.error('Error caught Getdata', e); //error Try again later
		}
	};

	async updateTokens() {

		console.log("Updating tokens");

		await this.homey.flow.getToken('TodaySwedishHoliday').setValue(SwedishHolidayToday.ThisIsRedDay);
		await this.homey.flow.getToken('TodaySwedishWorkFreeDay').setValue(this.convertToBooleanOp(SwedishHolidayToday.WorkFreeDay));
		await this.homey.flow.getToken('TodaySwedishCurrentDate').setValue(SwedishHolidayToday.CurrentDate);
		await this.homey.flow.getToken('TodayFlagDayToken').setValue(SwedishHolidayToday.ThisIsFlagDay);
		await this.homey.flow.getToken('TodayWeekDay').setValue(SwedishHolidayToday.WeekDay);
		await this.homey.flow.getToken('FirstNameOfTheDay').setValue(SwedishHolidayToday.FirstName);
		await this.homey.flow.getToken('SecondNameOfTheDay').setValue(SwedishHolidayToday.SecondName);
		await this.homey.flow.getToken('ThirdNameOfTheDay').setValue(SwedishHolidayToday.ThirdName);
		await this.homey.flow.getToken('HolidayNameToken').setValue(SwedishHolidayToday.HolidayName);

		console.log("Updating tokens complete");

	}

	SelectDate(input) { //Returns "YYYY-MM-DD" in Homey's timezone, Homey runs apps in UTC
		const today = todayIso(this.homey.clock.getTimezone());
		if (input == "yesterday") {
			return addDays(today, -1);
		} else if (input == "tomorrow") {
			return addDays(today, 1);
		} else {
			return today;
		}
	};

	async updateDataIfInvalid() { //Check if data is old, if old get new data from API
		try {
			const dataDate = SwedishHolidayToday.CurrentDate;
			const today = this.SelectDate("today");

			if (dataDate === today) {
				console.log(`Correct day stored, Data=${dataDate}, Today=${today}`);
			} else {
				console.log(`Old data, request new from API, Data=${dataDate}, Today=${today}`);
				await this.GetData();
			}
		} catch(err) {
			console.log("Invalid data updateDataIfInvalid");
			await this.GetData();
		}
	};

	async UpdateDataFromAPI(input) { //Calculates the day locally, same data format as the old API

		const response = { dagar: [getRawDay(this.SelectDate(input))] };
		//const response = { dagar: [getRawDay(`${new Date().getFullYear()}-04-19`)] };  // For testing
		return {
			CurrentDate: response.dagar[0]["datum"],

			WorkFreeDay: this.convertToBoolean(response.dagar[0]["arbetsfri dag"]),
			ThisIsRedDay: this.convertToBoolean(response.dagar[0]["r\u00f6d dag"]),

			FirstName: this.checkNameOfDay(response.dagar[0].namnsdag[0]),
			SecondName: this.checkNameOfDay(response.dagar[0].namnsdag[1]),
			ThirdName: this.checkNameOfDay(response.dagar[0].namnsdag[2]),

			HolidayName: this.checkHolidayName(response.dagar[0]["helgdag"],response.dagar[0]["helgdagsafton"]),
			MasterHoliday: this.getHolidayPeriod(this.checkHolidayName(response.dagar[0]["helgdag"],response.dagar[0]["helgdagsafton"])),
			
			ThisIsFlagDay: this.convertToBooleanFl(response.dagar[0]["flaggdag"]),
			WeekDay: response.dagar[0]["veckodag"],
		}; //Return object
	};

	convertToBoolean(input) {
		if (input == "Ja") {
			return true;
		} else {
			return false;
		}
	};

	convertToBooleanOp(input) {
		if (input == true) {
			return false;
		} else {
			return true;
		}
	};

	convertToBooleanFl(input) {

		if (input > "") {
			return true;
		}
		else {
			return false;
		}
	};

	
	checkNameOfDay(input) {//Check if name of the day is correct

		if (input > "") {
			return input;
		}
		else {
			return "";
		}
	};

		
	checkHolidayName(input, input2) {//Check if name of the day is correct

		if (input > "") {
			return input;
		}
		else {
			if (input2 > "") {
				return input2;
			}
			else { 
				return "";

			}
		}
	};


	getHolidayPeriod(input){ //Holiday name -> holiday group id, e.g. "Julafton" -> "christmas"
		return holidayGroup(input);
	};


};

module.exports = MyApp;
