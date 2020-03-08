import React, { PureComponent } from 'react';
import {
  Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart, ResponsiveContainer
} from 'recharts';

import moment from 'moment';
import { isMobile } from 'react-device-detect';

const criterionsTitles = {
  'Confirmés': 'cas confirmés',
  'Rétablis': 'cas rétablis',
  'Décédés': 'personnes décédés'
}


export default class Chart extends PureComponent {

  createLandDataForCriterion(landsDataByDates, landData, criterion, key) {
    landData.forEach(item => {
      if(typeof landsDataByDates[item.date] === 'undefined') {
        landsDataByDates[item.date] = {
          [key]: item[criterion]
        };
      } else {
        landsDataByDates[item.date][key] = item[criterion];
      }
    });
  }

  createLandsCompareData(landsDataByDates) {
    let land1LastCriterionValue = 0;
    let land2LastCriterionValue = 0;

    return Object.keys(landsDataByDates).map(key => {
      return {
        date: key,
        ...landsDataByDates[key]
      }
    })
    .sort((a, b) => a.date < b.date ? -1 : 1)
    .map(item => {
      const updatedItem = {
        date: item.date,
        land1: item.land1 ? item.land1 : land1LastCriterionValue,
        land2: item.land2 ? item.land2 : land2LastCriterionValue
      }
      if(item.land1) { land1LastCriterionValue = item.land1 }
      if(item.land2) { land2LastCriterionValue = item.land2 }
      return updatedItem;
    });
  }

  correctValue(currentValue, previousValue) {
    if(currentValue && currentValue !== 0) {
      return currentValue;
    } else {
      return previousValue;
    }
  }

  cleanLandData(landData_arr) {
    var landDataByDates = {};
    let previousDate = new Date(landData_arr[0].date);
    // landData_arr.forEach(item => console.log(`${item.date}`));
    landData_arr.forEach((item, i) => {
      let currentDate = new Date(item.date);
      const differenceInDaysFromPreviousDate = (currentDate.getTime() - previousDate.getTime()) / (1000 * 3600 * 24);
      if(typeof landDataByDates[item.date] === 'undefined') {
        landDataByDates[item.date] = item;
      }
      if(differenceInDaysFromPreviousDate > 1) {
        for(let j = 1; j < differenceInDaysFromPreviousDate; ++j) {
          const tmp_date = new Date(currentDate.getTime());
          tmp_date.setDate(tmp_date.getDate() - j);
          let tmp_date_isoFormat = moment(tmp_date).format('YYYY-MM-DD');
          const confirmedInterpolationShare = (item['Confirmés'] - landData_arr[(i - 1)]['Confirmés']) / differenceInDaysFromPreviousDate;
          const recoveredInterpolationShare = (item['Rétablis'] - landData_arr[(i - 1)]['Rétablis']) / differenceInDaysFromPreviousDate;
          const deathsInterpolationShare = (item['Décédés'] - landData_arr[(i - 1)]['Décédés']) / differenceInDaysFromPreviousDate;
          const confirmed = parseInt(item['Confirmés'] - (j * confirmedInterpolationShare));
          const recovered = parseInt(item['Rétablis'] - (j * recoveredInterpolationShare));
          const deaths = parseInt(item['Décédés'] - (j * deathsInterpolationShare));
          landDataByDates[tmp_date_isoFormat] = {
            ...item,
            date: tmp_date_isoFormat,
            'Confirmés': confirmed,
            'Rétablis': recovered,
            'Décédés' : deaths,
            'Existants': confirmed - recovered - deaths
          };
        }
      }
      previousDate = currentDate;
    });
    let landPreviousConfirmedValue = 0;
    let landPreviousRecoveredValue = 0;
    let landPreviousDeathsValue = 0;
    const cleanedData = Object.keys(landDataByDates).map(key => {
      landPreviousConfirmedValue = this.correctValue(landDataByDates[key]['Confirmés'], landPreviousConfirmedValue);
      landPreviousRecoveredValue = this.correctValue(landDataByDates[key]['Rétablis'], landPreviousRecoveredValue);
      landPreviousDeathsValue = this.correctValue(landDataByDates[key]['Décédés'], landPreviousDeathsValue);
      return {
        date: landDataByDates[key].date,
        'Confirmés': landPreviousConfirmedValue,
        'Rétablis': landPreviousRecoveredValue,
        'Décédés': landPreviousDeathsValue,
        'Existants': landPreviousConfirmedValue - landPreviousRecoveredValue - landPreviousDeathsValue
      }
    });
    return cleanedData.sort((a, b) => a.date < b.date ? -1 : 1);
  }

  render() {
    var landsDataByDates = {};
    const land1Data = this.props.data[this.props.land];
    const land2Data = this.props.data[this.props.land2];
    this.createLandDataForCriterion(landsDataByDates, land1Data, this.props.criterion, 'land1');
    this.createLandDataForCriterion(landsDataByDates, land2Data, this.props.criterion, 'land2');
    const landCompareData = this.createLandsCompareData(landsDataByDates);

    return (
      <div className='thin-shadow' style={{width: '100%', borderWidth: 1, borderStyle: 'solid', borderColor: '#cccfdd'}}>
        <div style={{textAlign: 'center', paddingTop: 20, fontSize: !isMobile ? '1.5rem' : '3rem', width: '100%', paddingBottom: !isMobile ? 0 : '1.5rem'}}>
          { this.props.mode === 'find'
            ?
              <React.Fragment>COVID-19 : évolution en { this.props.land }</React.Fragment>
            :
              <React.Fragment>COVID-19 : comparaison entre { this.props.land } et { this.props.land2 } ({ criterionsTitles[this.props.criterion] })</React.Fragment>
          }
        </div>
        <div style={{width: '100%', height: 530}}>
          <ResponsiveContainer>
            <ComposedChart
              data={this.props.mode === 'find' ? this.cleanLandData(this.props.data[this.props.land]) : landCompareData}
              margin={{
                top: 5, bottom: 5, right: 40, left: 10
              }}
            >
              <defs>
                <linearGradient id="confirmedColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f4dda6" stopOpacity={1}/>
                  <stop offset="95%" stopColor="#fff9ea" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#ccc" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend
                verticalAlign='top'
                height={!isMobile ? 36 : '4rem'}
                formatter={(value) => <span style={{fontSize: !isMobile ? '16px' : '2rem'}}>{ value }</span>}
                iconSize={!isMobile ? 16 : '1.5rem'}
              />
              { this.props.mode === 'find' && this.props.displayedCriterions.includes('Confirmés') &&
                <Area strokeWidth={2} type="monotone" dataKey="Confirmés" stroke="orange" fill='url(#confirmedColor)' activeDot={{ r: 10 }} /> }
              { this.props.mode === 'find' && this.props.displayedCriterions.includes('Rétablis') &&
                <Line strokeWidth={2} type="monotone" dataKey="Rétablis" stroke="#82ca9d" dot={false} />
              }
              { this.props.mode === 'find' && this.props.displayedCriterions.includes('Décédés') &&
                <Line strokeWidth={2} type="monotone" dataKey="Décédés" stroke="#db5e5e" dot={false} />
              }
              { this.props.mode === 'find' && this.props.displayedCriterions.includes('Existants') &&
                <Line strokeWidth={2} type="monotone" dataKey="Existants" stroke="#c775ea" dot={false} />
              }
              { this.props.mode === 'compare' &&
                <Line strokeWidth={2} type="monotone" name={`${this.props.land} (${this.props.criterion})`} dataKey="land1" stroke="#c775ea" dot={false} />
              }
              { this.props.mode === 'compare' &&
                <Line strokeWidth={2} type="monotone" name={`${this.props.land2} (${this.props.criterion})`} dataKey="land2" stroke="#50994a" dot={false} />
              }
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }
}