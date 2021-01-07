import { Meteor } from "meteor/meteor";
import { HTTP } from "meteor/http";

const Records = new Mongo.Collection("records");
const Lands = new Mongo.Collection("lands");

const LANDS_ALIASES = {
	"Republic of Korea": "South Korea",
	'"Korea; South"': "South Korea",
	"Iran (Islamic Republic of)": "Iran",
	"Hong Kong SAR": "Hong Kong",
	"Taipei and environs": "Taiwan",
	"Taiwan*": "Taiwan",
	"Viet Nam": "Vietnam",
	"occupied Palestinian territory": "Palestine",
	"Republic of Ireland": "Ireland",
	"Russian Federation": "Russia",
	"Republic of Moldova": "Moldova",
	"St. Martin": "Saint Martin",
	"Mainland China": "China",
	Others: "Cruise Ship",
	"United Kingdom": "UK",
	Czechia: "Czech Republic",
	"Macao SAR": "Macau",
	"Cote d'Ivoire": "Ivory Coast",
	"French Guyana": "Guyana",
	"Diamond Princess": "Cruise Ship",
};

function convertDate(year, month_int, day_int) {
	const date = new Date(year, month_int, day_int);
	const month_str =
		date.getMonth() < 9
			? `0${parseInt(date.getMonth() + 1)}`
			: parseInt(date.getMonth() + 1);
	return [
		month_str,
		date.getDate() < 10 ? "0" + date.getDate() : date.getDate(),
		date.getFullYear(),
	];
}

function parseTextFile(textFile) {
	let data_arr = textFile.split("\n");

	data_arr[0] = data_arr[0]
		.replace("Country_Region", "Country/Region")
		.replace("Last_Update", "Last Update");
	data_arr = data_arr.map((line) => {
		if (line.indexOf('"') > -1) {
			const subString = line.split('"')[1];
			const newSubString = subString.replace(/,/g, ";");
			line = line.replace('"' + subString + '"', '"' + newSubString + '"');
		}
		return line;
	});

	return data_arr;
}

function formatData(data_arr, month, day, year) {
	const keys = data_arr[0].split(",");

	const formattedData = {};

	for (let record_num = 1; record_num < data_arr.length; ++record_num) {
		const record_arr = data_arr[record_num].split(",");
		const record_o = {};
		keys.map((key, key_index) => {
			record_o[key] = record_arr[key_index];
		});

		if (LANDS_ALIASES[record_o["Country/Region"]]) {
			record_o["Country/Region"] = LANDS_ALIASES[record_o["Country/Region"]];
		}

		if (typeof formattedData[record_o["Country/Region"]] === "undefined") {
			formattedData[record_o["Country/Region"]] = {
				date: `${year}-${month}-${day}`,
				Confirmés: record_o.Confirmed ? parseInt(record_o.Confirmed) : 0,
				Décédés: record_o.Deaths ? parseInt(record_o.Deaths) : 0,
				Rétablis: record_o.Recovered ? parseInt(record_o.Recovered) : 0,
			};
		} else {
			formattedData[record_o["Country/Region"]][
				"Confirmés"
			] += record_o.Confirmed ? parseInt(record_o.Confirmed) : 0;
			formattedData[record_o["Country/Region"]]["Décédés"] += record_o.Deaths
				? parseInt(record_o.Deaths)
				: 0;
			formattedData[record_o["Country/Region"]][
				"Rétablis"
			] += record_o.Recovered ? parseInt(record_o.Recovered) : 0;
		}
	}

	return formattedData;
}

function getRecordsByDate(
	year_int,
	month_int,
	day_int,
	currentDate,
	lastRecord_date
) {
	var [month, day, year] = convertDate(year_int, month_int, day_int);
	let textFile = null;

	try {
		textFile = Assets.getText(
			`COVID-19/csse_covid_19_data/csse_covid_19_daily_reports/${month}-${day}-${year}.csv`
		);
	} catch (err) {}

	if (!textFile) {
		let res = null;
		const repo = "https://github.com/CSSEGISandData/COVID-19";
		const params = "raw=true";
		try {
			res = HTTP.get(
				`${repo}/blob/master/csse_covid_19_data/csse_covid_19_daily_reports/${month}-${day}-${year}.csv?${params}`,
				{}
			);
		} catch (err) {}

		textFile = res ? res.content : null;
		if (textFile) console.log(`Remote fetch: ${month}-${day}-${year}`);
	} else {
		console.log(`Local fetch: ${month}-${day}-${year}`);
	}

	if (textFile) {
		lastRecord_date = new Date(currentDate);

		const data_arr = parseTextFile(textFile);
		const formattedData = formatData(data_arr, month, day, year);

		return formattedData;
	}
	return false;
}

Meteor.methods({
	getLandsNames: () => {
		return Lands.find({}).fetch();
	},
	getLandData: (country_name) => {
		return Records.find({ country: country_name }).fetch();
	},
	// getData: () => {
	//   var firstDate = new Date(2020, 0, 22);
	//   var lastDate = new Date();

	//   firstDate.setUTCHours(0,0,0,0);
	//   lastDate.setUTCHours(0,0,0,0);

	//   var currentDate = new Date(firstDate);

	//   var landsGroupedByDate = {};
	//   var lands = {};
	//   while(currentDate.toISOString() !== lastDate.toISOString()) {
	//     currentDate.setDate(currentDate.getDate() + 1);

	//     landsGroupedByDate = getRecordsByDate(currentDate.getMonth(), currentDate.getDate(), currentDate);
	//     Object.keys(landsGroupedByDate).forEach(key => {
	//       if(typeof lands[key] === 'undefined') {
	//         lands[key] = [ { country: key, ...landsGroupedByDate[key] } ];
	//       } else {
	//         lands[key].push({ country: key, ...landsGroupedByDate[key] });
	//       }
	//     });
	//   }

	//   return lands;
	// }
});

function dateIterator(
	firstDate,
	lastDate,
	applied_func,
	lands_names,
	lastRecord_date
) {
	var currentDate = new Date(firstDate);

	while (currentDate.toISOString() !== lastDate.toISOString()) {
		currentDate.setDate(currentDate.getDate() + 1);
		applied_func(
			currentDate.getFullYear(),
			currentDate.getMonth(),
			currentDate.getDate(),
			lands_names,
			currentDate,
			lastRecord_date
		);
	}
}

function storeRecordsByDate(
	year,
	month,
	day,
	lands_names,
	currentDate,
	lastRecord_date
) {
	const records = getRecordsByDate(
		year,
		month,
		day,
		currentDate,
		lastRecord_date
	);
	if (records) {
		Object.keys(records).forEach((key) => {
			lands_names[key] = true;
			Records.insert({
				country: key,
				...records[key],
			});
		});
	}
}

Meteor.startup(() => {
	var restartFrequency = 1000 * 3600 * 6;
	setTimeout(function () {
		process.exit();
	}, restartFrequency);

	Records.remove({});
	Lands.remove({});

	var firstDate = new Date(2020, 0, 22);
	var lastDate = new Date();
	var lastRecord_date = new Date();
	firstDate.setUTCHours(0, 0, 0, 0);
	lastDate.setUTCHours(0, 0, 0, 0);

	const lands_names = {};
	var lastRecord_date = new Date();

	dateIterator(
		firstDate,
		lastDate,
		storeRecordsByDate,
		lands_names,
		lastRecord_date
	);

	lastRecord_date.setUTCHours(0, 0, 0, 0);
	lastRecord_date.setDate(lastRecord_date.getDate() - 2);
	const lastRecordDate_isoStr = lastRecord_date.toISOString().substr(0, 10);

	console.log(lastRecordDate_isoStr);

	Object.keys(lands_names).forEach((key) => {
		const lastRecord = Records.findOne({
			date: lastRecordDate_isoStr,
			country: key,
		});

		if (typeof lastRecord !== "undefined") {
			Lands.insert({ country: key, confirmed: lastRecord["Confirmés"] });
		}
	});
});
