'use strict';
const fetch = require("node-fetch");
const Homey = require('homey');

//Create Tokens
const TodaySwedishHolidayToken = new Homey.FlowToken('TodaySwedishHoliday', {type: 'boolean',title: Homey.__("TodaySwedishHoliday")});
const TodaySwedishWorkFreeDayToken = new Homey.FlowToken('TodaySwedishWorkFreeDay', {type: 'boolean',title: Homey.__("TodaySwedishWorkFreeDay")});
const TodaySwedishCurrentDate = new Homey.FlowToken('TodaySwedishCurrentDate', {type: 'string',title: Homey.__("TodaySwedishCurrentDate")});
const TodayFlagDayToken = new Homey.FlowToken('TodayFlagDay', {type: 'boolean',title: Homey.__("TodayFlagDay")});
const TodayWeekDayToken = new Homey.FlowToken('TodayWeekDay', {type: 'string',title: Homey.__("TodayWeekDay")});
const FirstNameOfTheDayToken = new Homey.FlowToken('FirstNameOfTheDay', {type: 'string',title: Homey.__("FirstNameOfTheDay")});
const SecondNameOfTheDayToken = new Homey.FlowToken('SecondNameOfTheDay', {type: 'string',title: Homey.__("SecondNameOfTheDay")});
const ThirdNameOfTheDayToken = new Homey.FlowToken('ThirdNameOfTheDay', {type: 'string',title: Homey.__("ThirdNameOfTheDay")});
const HolidayNameToken = new Homey.FlowToken('HolidayNameToken', {type: 'string',title: Homey.__("HolidayNameToken")});

//Create var
var SwedishHolidayToday;
var SwedishHolidayTomorrow;
var SwedishHolidayYesterday;

//Parameters
const DataUrl = "https://api.dryg.net/dagar/v2.1"; //Using api.dryg.net

//Set Flow JSON names
let HolidayCondition = new Homey.FlowCardCondition('is_holiday');
let DayOfWorkCondition = new Homey.FlowCardCondition('is_DayOfWork');
let FlagDayCondition = new Homey.FlowCardCondition('is_FlagDay');
let is_MasterHoliday = new Homey.FlowCardCondition('is_MasterHoliday');

//Set Cron parameters
const cronName = "swedishHolidayCronTask"
const cronInterval = "0 0 * * *"; // 0 0 * * * = every day at midnight (00:00)

class MyApp extends Homey.App {

	async onInit() {
		this.log('Swedish holiday is running...');

		//Register crontask
		Homey.ManagerCron.getTask(cronName)
			.then(task => {
				this.log("This crontask is already registred: " + cronName);
				task.on('run', () => this.GetData());
			})
			.catch(err => {
				if (err.code == 404) {
					this.log("This crontask has not been registered yet, registering task: " + cronName);
					Homey.ManagerCron.registerTask(cronName, cronInterval, null)
						.then(task => {
							task.on('run', () => this.GetData());
						})
						.catch(err => {
							this.log(`problem with registering crontask: ${err.message}`);
						});
				} else {
					this.log(`other cron error: ${err.message}`);
				}
			});
	
		//Unregister crontask on unload
		Homey
			.on('unload', () => {
				Homey.ManagerCron.unregisterTask(cronName);
			});
		
		HolidayCondition
			.register()
			.registerRunListener(async (args, state) => {
				await this.updateDataIfInvalid(); //Check if data needs update
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

			
		FlagDayCondition
		.register()
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

		is_MasterHoliday
		.register()
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

		//Register tokens
		await TodaySwedishHolidayToken.register(); 
		await TodaySwedishWorkFreeDayToken.register();
		await TodaySwedishCurrentDate.register();
		await TodayFlagDayToken.register();
		await TodayWeekDayToken.register();
		await FirstNameOfTheDayToken.register();
		await SecondNameOfTheDayToken.register();
		await ThirdNameOfTheDayToken.register();
		await HolidayNameToken.register();

		//Get data on appinit
		await this.GetData();

		console.log(SwedishHolidayToday);
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
			d2.setHours(1, 0, 0, 0)

			if (d1.getTime() === d2.getTime()) {
				console.log("Correct day stored")
			} else {
				console.log("Old data, request new from API")
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
