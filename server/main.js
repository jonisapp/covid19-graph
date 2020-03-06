import { Meteor } from 'meteor/meteor';
import moment from 'moment';

function convertDate(year, month_int, day_int) {
  const date = new Date(year, month_int, day_int);
  return [
    date.getMonth() < 10 ? '0' + date.getMonth() : date.getMonth(),
    date.getDate() < 10 ? '0' + date.getDate() : date.getDate(),
    date.getFullYear()
  ]
}

function getLandsByDate(month_int, day_int) {
  const [ month, day, year ] = convertDate(2020, month_int, day_int);
  const textFile = Assets.getText(`COVID-19/csse_covid_19_data/csse_covid_19_daily_reports/${month}-${day}-${year}.csv`);
  var arrayFile = textFile.split('\n');
  arrayFile = arrayFile.map(line => {
    if(line.indexOf('"') > -1) {
      const subString = line.split('"')[1];
      const newSubString = subString.split(',').join(';');
      line = line.replace(subString, newSubString);
    }
    return line;
  });
  const keys = arrayFile[0].split(',');
  var data = [];
  for(let i = 1; i < arrayFile.length; ++i) {
    const line_arr = arrayFile[i].split(',');
    var line = {};
    keys.map((key, j) => {
      line[key] = line_arr[j];
    })
    data.push(line);
  }
  var lands = {};
  data.forEach(land => {
    if(typeof lands[land['Country/Region']] === 'undefined') {
      lands[land['Country/Region']] = {
        date: moment(land['Last Update']).format('YYYY-MM-DD'),
        'Confirmés': land.Confirmed ? parseInt(land.Confirmed) : 0,
        'Décédés': land.Deaths ? parseInt(land.Deaths) : 0,
        'Rétablis': land.Recovered ? parseInt(land.Recovered) : 0
      }
    } else {
      lands[land['Country/Region']]['Confirmés'] += (land.Confirmed ? parseInt(land.Confirmed) : 0);
      lands[land['Country/Region']]['Décédés'] += (land.Deaths ? parseInt(land.Deaths) : 0);
      lands[land['Country/Region']]['Rétablis'] += (land.Recovered ? parseInt(land.Recovered) : 0);
    }
  });
  return lands;
}

function getLandByMonth(firstDay, lastDay, month, lands) {
  for(let i = firstDay; i <= lastDay; ++i) {
    const landsGroupedByDate = getLandsByDate(month, i);
    Object.keys(landsGroupedByDate).forEach(key => {
      if(typeof lands[key] === 'undefined') {
        lands[key] = [ { country: key, ...landsGroupedByDate[key] } ];
      } else {
        lands[key].push({ country: key, ...landsGroupedByDate[key] });
      }
    });
  }
}

Meteor.methods({
  getData: () => {
    var lands = {};
    getLandByMonth(22, 31, 1, lands);
    getLandByMonth(1, 29, 2, lands);
    getLandByMonth(1, 5, 3, lands);
    return lands;
  }
});
