'use strict';
const fetch = require("node-fetch");
const Homey = require('homey');

console.log('Declare variables');
//Create var
let SwedishHolidayToday;
let SwedishHolidayTomorrow;
let SwedishHolidayYesterday;

console.log('Set parameters');
//Parameters
const DataUrl = "https://sholiday.faboul.se/dagar/v2.1";



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
		try {
			let dataDate = new Date(SwedishHolidayToday.CurrentDate);
			let today = new Date();
			dataDate.setHours(0, 0, 0, 0)
			today.setHours(0, 0, 0, 0)

			if (dataDate.getTime() === today.getTime()) {
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

	createURL(input) {
		const d = this.SelectDate(input);
		const year = d.getFullYear();
		const month = d.getMonth() + 1;
		const day = d.getDate();

 		return `${DataUrl}/${year}/${month}/${day}`;
 		//return `${DataUrl}/${year}/04/19`;  // For testing
	};

	async runFetchOperation(input) {
		console.log('Fetch data from API ' + input);
		const response = await fetch(this.createURL(input));

		console.log('Fetch data from API complete');

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


	getHolidayPeriod(input){

		switch (input) {

			case "Sveriges nationaldag":
			  	return "Sveriges nationaldag";
			  	break;

			case "Annandag jul":
			case "Julafton" :
			case "Juldagen" :
				console.log("Jul")
				return "christmas";
				break;

			case "Påskafton":
			case "Påskdagen" :
			case "Annandag påsk" :
			case "Långfredagen" :
				console.log("Påsk")
				return "easter";
				break;

			case "Pingstafton":
			case "Pingstdagen" :
			case "Annandag pingst" :
				console.log("Pingst")
				return "pentecost";
				break;

			case "Valborgsmässoafton" :
			case "Första Maj" :
				console.log("Valborg/Första maj")
				return "valborg";
				break;

			case "Nyårsafton" :
			case "Nyårsdagen" :
				console.log("Nyår")
				return "newyear";
				break;

			case "Trettondagsafton" :
			case "Trettondedag jul" :
				console.log("Trettonhelgen")
				return "trettonhelgen";
				break;

			case "Midsommarafton" :
			case "Midsommardagen" :
				console.log("Midsommar")
				return "midsommar";
				break;

			case "Kristi himmelfärdsdag" :
				console.log("Kristi himmelfärdsdag")
				return "Kristi";
				break;

			case "Skärtorsdagen" :
				console.log("Skärtorsdagen")
				return "skartorsdagen";
				break;
	
			case "Allhelgonaafton" :
			case "Alla helgons dag" :
				console.log("Alla helgon helgen")
				return "allahelgonhelgen";
				break;
				  
			default:
			 	console.log("This day is not a Swedish named holiday"+ input)
			 	return "";
			 	break;
		  }
	};


};

module.exports = MyApp;
