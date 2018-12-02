'use strict';
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

const Homey = require('homey');

//const TodaySwedishHolidayToken = new Homey.FlowToken('TodaySwedishHoliday', {
//	type: 'string',
//	title: 'Today is Swedish holiday'
//});

var SwedishHoliday;
var DataUrl = "https://api.dryg.net/dagar/v2.1"; //Using api.dryg.net

let HolidayCondition = new Homey.FlowCardCondition('is_holiday');

class MyApp extends Homey.App {


	
	onInit() {
		this.log('MyApp is running...');
		SwedishHoliday = this.UpdateDataFromAPI(); //Retrive data on app lunch
		
		HolidayCondition
		.register()
		.registerRunListener(( args, state ) => {
			this.CheckIfDataisValid();
			let Holiday = SwedishHoliday.ThisIsRedDay
			this.log('Condition card is running, value is '+ SwedishHoliday.CurrentDate+" "+SwedishHoliday.ThisIsRedDay);
			return Promise.resolve( Holiday );
		});


	};

	CheckIfDataisValid(){ //Check if data is old, if old get new data from API
		var d1 = new Date(SwedishHoliday.CurrentDate);
		var d2 = new Date();
		d2.setHours(1,0,0,0)

		
			if (d1.getTime() == d2.getTime() ){
				console.log ("Correct day, no nothing")
				return true;
			} else {
				console.log("Old data, request new from API")
				SwedishHoliday = this.UpdateDataFromAPI();
				return false;
			}
 

	}


	UpdateDataFromAPI() { //Get data from API adapted for https://api.dryg.net/
		this.log('Getting current data from API');

		var d = new Date(); // Get the current day
		var year = d.getFullYear().toString();
		var month = d.getMonth()+1;
		month.toString();
		var day = d.getDate().toString();

		var JsonURL = DataUrl+"/"+year+"/"+month+"/"+day;
		this.log("Using API URL: "+JsonURL);


		const xhr = new XMLHttpRequest()
		xhr.onreadystatechange = () => {
		  if (xhr.readyState === 4 && xhr.status === 200) {
			xhr.status === 200 ? console.log(xhr.responseText) : console.error('error')
			
				try {
				var myArr = JSON.parse(xhr.responseText); //Get Json and print debug below


				console.log("Datum: " + myArr.dagar[0]["datum"]);
				console.log("Arbetsfri dag: "+myArr.dagar[0]["arbetsfri dag"]);
				console.log("Röd dag:"+ myArr.dagar[0]["r\u00f6d dag"]);
				console.log("Flaggdag:"+ myArr.dagar[0]["flaggdag"]);

				SwedishHoliday =  {
					CurrentDate:myArr.dagar[0]["datum"],
					WorkFreeDay:this.convertToBoolean(myArr.dagar[0]["arbetsfri dag"]),
					ThisIsRedDay:this.convertToBoolean(myArr.dagar[0]["r\u00f6d dag"],),
					FlagDay:myArr.dagar[0]["flaggdag"],
				}; //Return object

					console.log("Var update complete")

				} catch (e) {
					console.log(e)
					Console.log("Error JSON request")
				};

		  	}
			else {

				console.log("Loading ReqHed "+xhr.status);

		  }
		}
		xhr.open('GET', JsonURL)
		xhr.send()
	};

	convertToBoolean(input){

		if (input == "Ja") {
			return true;
		}
		else {
			return false;
		}
	};

};

module.exports = MyApp;