'use strict';
const fetch = require("node-fetch");
const Homey = require('homey');
//const { TokenClass } = require("./TokenClass");

console.log('Decleare variables');
//Create var
var SwedishHolidayToday;
var SwedishHolidayTomorrow;
var SwedishHolidayYesterday;
var TodaySwedishHolidayToken;



//TODO items
//-Missing update at midnight for the data. 

//Create Tokens 
//let TodaySwedishHolidayToken = new Homey.FlowToken('TodaySwedishHoliday', { type: 'boolean', title: 'TodaySwedishHoliday' });
//let TodaySwedishWorkFreeDayToken = new Homey.FlowToken('TodaySwedishWorkFreeDay', { type: 'boolean', title: 'TodaySwedishWorkFreeDay' });
//let TodaySwedishCurrentDate = new Homey.FlowToken('TodaySwedishCurrentDate', { type: 'string', title: 'tags.TodaySwedishCurrentDate' });
//let TodayFlagDayToken = new Homey.FlowToken('TodayFlagDay', { type: 'boolean', title: 'TodayFlagDay' });
//let TodayWeekDayToken = new Homey.FlowToken('TodayWeekDay', { type: 'string', title: 'tags.TodayWeekDay' });
//let FirstNameOfTheDayToken = new Homey.FlowToken('FirstNameOfTheDay', { type: 'string', title: 'FirstNameOfTheDay' });
//let SecondNameOfTheDayToken = new Homey.FlowToken('SecondNameOfTheDay', { type: 'string', title: 'SecondNameOfTheDay' });
//let ThirdNameOfTheDayToken = new Homey.FlowToken('ThirdNameOfTheDay', { type: 'string', title: 'ThirdNameOfTheDay' });
//let HolidayNameToken = new Homey.FlowToken('HolidayNameToken', { type: 'string', title: 'HolidayNameToken' });

console.log('Set parameters');
//Parameters
const DataUrl = "https://sholiday.faboul.se/dagar/v2.1";

//Set Flow JSON names this.homey.flow.getCard()
//const HolidayCondition = this.homey.flow.getConditionCard('is_holiday');
//const DayOfWorkCondition = this.homey.flow.getConditionCard('is_DayOfWork');
//const FlagDayCondition = this.homey.flow.getConditionCard('is_FlagDay');
//const is_MasterHoliday = this.homey.flow.getConditionCard('is_MasterHoliday');

console.log('Start app');

class MyApp extends Homey.App {

	//TodaySwedishHolidayToken = new TokenClass("","");

	async onInit() {
		console.log(this.homey.__("title"));
		console.log('is running...');
		console.log(this.homey.__("tags.TodaySwedishHoliday"));
		
		
		console.log('Register Global Tokens');
		const TodaySwedishHolidayToken = await this.homey.flow.createToken("TodaySwedishHoliday", {
			type: "boolean",
			title: this.homey.__("tags.TodaySwedishHoliday"),
		  });
		const TodaySwedishWorkFreeDayToken = await this.homey.flow.createToken("TodaySwedishWorkFreeDay", {
			type: "boolean",
			title: "tags.TodaySwedishWorkFreeDay",
		  });
		const TodaySwedishCurrentDateToken = await this.homey.flow.createToken("TodaySwedishCurrentDate", {
			type: "string",
			title: "tags.TodaySwedishCurrentDate",
		  });
		const TodayFlagDayToken = await this.homey.flow.createToken("TodayFlagDayToken", {
			type: "boolean",
			title: "tags.TodayFlagDay",
		  });
		const TodayWeekDayToken = await this.homey.flow.createToken("TodayWeekDay", {
			type: "string",
			title: "tags.TodayWeekDay",
		  });
		const FirstNameOfTheDayToken = await this.homey.flow.createToken("FirstNameOfTheDay", {
			type: "string",
			title: "tags.FirstNameOfTheDay",
		  });
		const SecondNameOfTheDayToken = await this.homey.flow.createToken("SecondNameOfTheDay", {
			type: "string",
			title: "tags.SecondNameOfTheDay",
		  });
		const ThirdNameOfTheDayToken = await this.homey.flow.createToken("ThirdNameOfTheDay", {
			type: "string",
			title: "tags.ThirdNameOfTheDay",
		  });
		const HolidayNameToken = await this.homey.flow.createToken("HolidayNameToken", {
			type: "string",
			title: "tags.HolidayNameToken",
		  });

		  await TodaySwedishHolidayToken.setValue(true);
		  await TodaySwedishWorkFreeDayToken.setValue(true);

		//Create Tokens 
		//console.log('Create tokens');
		//TodaySwedishHolidayToken = new Homey.FlowToken('TodaySwedishHoliday', {type: 'boolean',title: Homey.__("tags.TodaySwedishHoliday")});
		//TodaySwedishWorkFreeDayToken = new Homey.FlowToken('TodaySwedishWorkFreeDay', {type: 'boolean',title: Homey.__("tags.TodaySwedishWorkFreeDay")});
		//TodaySwedishCurrentDate = new Homey.FlowToken('TodaySwedishCurrentDate', {type: 'string',title: Homey.__("tags.TodaySwedishCurrentDate")});
		//TodayFlagDayToken = new Homey.FlowToken('TodayFlagDay', {type: 'boolean',title: Homey.__("tags.TodayFlagDay")});
		//TodayWeekDayToken = new Homey.FlowToken('TodayWeekDay', {type: 'string',title: Homey.__("tags.TodayWeekDay")});
		//FirstNameOfTheDayToken = new Homey.FlowToken('FirstNameOfTheDay', {type: 'string',title: Homey.__("tags.FirstNameOfTheDay")});
		//SecondNameOfTheDayToken = new Homey.FlowToken('SecondNameOfTheDay', {type: 'string',title: Homey.__("tags.SecondNameOfTheDay")});
		//ThirdNameOfTheDayToken = new Homey.FlowToken('ThirdNameOfTheDay', {type: 'string',title: Homey.__("tags.ThirdNameOfTheDay")});
		//HolidayNameToken = new Homey.FlowToken('HolidayNameToken', {type: 'string',title: Homey.__("tags.HolidayNameToken")});

		//Register tokens
		//console.log('Register tokens');
		//await TodaySwedishHolidayToken.register(); 
		//await TodaySwedishWorkFreeDayToken.register();
		//await TodaySwedishCurrentDateToken.register();
		//await TodayFlagDayToken.register();
		//await TodayWeekDayToken.register();
		//await FirstNameOfTheDayToken.register();
		//await SecondNameOfTheDayToken.register();
		//await ThirdNameOfTheDayToken.register();
		//await HolidayNameToken.register();
	

		//RegisterCards
		console.log('Create flow cards');
		const HolidayCondition = this.homey.flow.getConditionCard('is_holiday');
		HolidayCondition
			.registerRunListener(async (args, state) => {
				await this.updateDataIfInvalid(); //Check if data needs update
				if (args.CurrentDay == "today") {
					console.log('HolidayCondition SwedishHolidayToday.ThisIsRedDay');
					return Promise.resolve(SwedishHolidayToday.ThisIsRedDay);
				} else if (args.CurrentDay == "tomorrow") {
					console.log('HolidayCondition SwedishHolidayTomorrow.ThisIsRedDay');
					return Promise.resolve(SwedishHolidayTomorrow.ThisIsRedDay);
				} else if (args.CurrentDay == "yesterday") {
					console.log('HolidayCondition SwedishHolidayYesterday.ThisIsRedDay');
					return Promise.resolve(SwedishHolidayYesterday.ThisIsRedDay);
				} else {
					console.log('HolidayCondition SwedishHolidayToday.ThisIsRedDay');
					return Promise.resolve(SwedishHolidayToday.ThisIsRedDay);
				}
			});

		const DayOfWorkCondition = this.homey.flow.getConditionCard('is_DayOfWork');
		DayOfWorkCondition
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

		const FlagDayCondition = this.homey.flow.getConditionCard('is_FlagDay');
		FlagDayCondition
		.registerRunListener(async (args, state) => {
			await this.updateDataIfInvalid();
			if (args.CurrentDay == "today") {
				return Promise.resolve(SwedishHolidayToday.ThisIsFlagDay);
			} else if (args.CurrentDay == "tomorrow") {
				return Promise.resolve(SwedishHolidayTomorrow.ThisIsFlagDay);
			} else if (args.CurrentDay == "yesterday") {
				return Promise.resolve(SwedishHolidayYesterday.ThisIsFlagDay);
			} else {
				return Promise.resolve(SwedishHolidayToday.ThisIsFlagDay);
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
			console.error('Error caught Getdata ' + e); //error Try again later
		}
	};

	async updateTokens() {

		console.log("Updating tokens");

		await TodaySwedishHolidayToken.setValue(SwedishHolidayToday.ThisIsRedDay);
		await TodaySwedishWorkFreeDayToken.setValue(this.convertToBooleanOp(SwedishHolidayToday.WorkFreeDay));
		await TodaySwedishCurrentDate.setValue(SwedishHolidayToday.CurrentDate);
		await TodayFlagDayToken.setValue(SwedishHolidayToday.ThisIsFlagDay);
		await TodayWeekDayToken.setValue(SwedishHolidayToday.WeekDay);
		await FirstNameOfTheDayToken.setValue(SwedishHolidayToday.FirstName);
		await SecondNameOfTheDayToken.setValue(SwedishHolidayToday.SecondName);
		await ThirdNameOfTheDayToken.setValue(SwedishHolidayToday.ThirdName);
		await HolidayNameToken.setValue(SwedishHolidayToday.HolidayName);

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
		try
		{
			var d1 = new Date(SwedishHolidayToday.CurrentDate);
			var d2 = new Date();
			d1.setHours(0, 0, 0, 0)
			d2.setHours(0, 0, 0, 0)

			if (d1.getTime() === d2.getTime()) {
				console.log("Correct day stored, D1="+d1+", d2="+d2)
			} else {
				console.log("Old data, request new from API, D1="+d1+", d2="+d2)
				await this.GetData();
			}
		}
		catch(err)
		{
			console.log("Invalid data updateDataIfInvalid")
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
