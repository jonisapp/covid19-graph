import React, { PureComponent } from 'react';
import {
  Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart, ResponsiveContainer
} from 'recharts';

import { interpolateExisting, predict } from '../utility/interpolate';

import moment from 'moment';
import { isMobile } from 'react-device-detect';

const criterionsTitles = {
  'Confirmés': 'total',
  'Rétablis': 'rétablis',
  'Décédés': 'personnes décédées'
}


export default class Chart extends PureComponent {

  createLandDataForCriterion(landsDataByDates, landData, criterion, key) {
    console.log(landData);
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

  cleanLandDataInterpolate(landData_arr) {
    const today = (new Date).toISOString().substr(0, 10);
    var landDataByDates = {};
    let previousDate = new Date(landData_arr[0].date);
    landData_arr.forEach((item, i) => {
      let currentDate = new Date(item.date);
      const differenceInDaysFromPreviousDate = (currentDate.getTime() - previousDate.getTime()) / (1000 * 3600 * 24);
      if(typeof landDataByDates[item.date] === 'undefined') {
        landDataByDates[item.date] = item;
      }

      if(differenceInDaysFromPreviousDate > 1 && this.props.interpolate) {
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
    let cleanedData = Object.keys(landDataByDates).map(key => {
      landPreviousConfirmedValue = this.correctValue(landDataByDates[key]['Confirmés'], landPreviousConfirmedValue);
      landPreviousRecoveredValue = this.correctValue(landDataByDates[key]['Rétablis'], landPreviousRecoveredValue);
      landPreviousDeathsValue = this.correctValue(landDataByDates[key]['Décédés'], landPreviousDeathsValue);
      return {
        date: landDataByDates[key].date,
        ...(landDataByDates[key].date < today ? { 'Confirmés': landPreviousConfirmedValue } : {}),
        ...(landDataByDates[key].date < today ? { 'Rétablis': landPreviousRecoveredValue } : {}),
        ...(landDataByDates[key].date < today ? { 'Décédés': landPreviousDeathsValue } : {}),
        ...(landDataByDates[key].date < today ? { 'Existants': landPreviousConfirmedValue - landPreviousRecoveredValue - landPreviousDeathsValue } : {})
      }
    });
    cleanedData = cleanedData.sort((a, b) => a.date < b.date ? -1 : 1);
    if(this.props.interpolate) {
      interpolateExisting(cleanedData);
    }

    return cleanedData;
  }

  tr(sentence) {
    return this.props.tr(sentence);
  }

  render() {
    // const cleanedData = this.cleanLandDataInterpolate(this.props.data[this.props.land]);
    const cleanedData = this.cleanLandDataInterpolate(this.props.land1_data);

    const predictedData = [ ...cleanedData ];
    predict(predictedData);
    
    const currentData = this.props.enablePrediction ? predictedData : cleanedData;

    var landsDataByDates = {};
    const land1Data = this.props.land1_data;
    const land2Data = this.props.land2_data;
    this.createLandDataForCriterion(landsDataByDates, land1Data, this.props.criterion, 'land1');
    this.createLandDataForCriterion(landsDataByDates, land2Data, this.props.criterion, 'land2');
    const landCompareData = this.createLandsCompareData(landsDataByDates);

    return (
      <div className='thin-shadow' style={{width: '100%', borderWidth: 1, borderStyle: 'solid', borderColor: '#cccfdd'}}>
        <div style={{textAlign: 'center', paddingTop: 20, width: '100%', paddingBottom: !isMobile ? 0 : '1.5rem'}}>
          { this.props.mode === 'find'
            ?
              <h1 style={{display: 'inline', fontSize: !isMobile ? '1.5rem' : '3rem', fontWeight: 'normal'}}>
                COVID-19 : { this.props.land !== 'World' ? this.tr('évolution en') + ' ' + this.props.land : this.tr('évolution dans le monde') }
              </h1>
            :
              <h1 style={{display: 'inline', fontSize: !isMobile ? '1.5rem' : '3rem', fontWeight: 'normal'}}>
                COVID-19 : { this.tr('comparaison entre') } { this.props.land } {this.tr('et')} { this.props.land2 } ({ this.tr(criterionsTitles[this.props.criterion]) })
              </h1>
          }
        </div>
        <div style={{width: '100%', height: 530}}>
          <ResponsiveContainer>
            <ComposedChart
              onMouseMove={({ activeLabel }) => { this.props.setPointedDate(activeLabel) }}
              data={this.props.mode === 'find' ? currentData : landCompareData}
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
                <Area strokeWidth={2} type="monotone" name={this.tr('Total')}
                  dataKey="Confirmés" stroke="orange" fill='url(#confirmedColor)' activeDot={{ r: 10 }}
                />
              }
              { this.props.mode === 'find' && this.props.displayedCriterions.includes('Confirmés') && this.props.enablePrediction &&
                <Line strokeWidth={2} type="monotone" name="Total (prédiction)" legendType='none' animationBegin={1000}
                  animationDuration={1000} dot={false}
                  dataKey="Confirmés-prédiction" stroke="orange" strokeDasharray="5 5" activeDot={{ r: 10 }}
                />
              }
              { this.props.mode === 'find' && this.props.displayedCriterions.includes('Rétablis') &&
                <Line strokeWidth={2} type="monotone" name={this.tr('Rétablis')}
                  animationDuration={1000}
                  dataKey="Rétablis" stroke="#82ca9d" dot={false}
                />
              }
              { this.props.mode === 'find' && this.props.displayedCriterions.includes('Rétablis') &&  this.props.enablePrediction &&
                <Line strokeWidth={2} type="monotone" name={this.tr('Rétablis (prédiction)')} legendType='none' animationBegin={1000}
                  animationDuration={1000}
                  dataKey="Rétablis-prédiction" stroke="#82ca9d" strokeDasharray="5 5" dot={false}
                />
              }
              { this.props.mode === 'find' && this.props.displayedCriterions.includes('Décédés') &&
                <Line strokeWidth={2} type="monotone" name={this.tr('Décédés')}
                  animationDuration={1000}
                  dataKey="Décédés" stroke="#db5e5e" dot={false}
                />
              }
              { this.props.mode === 'find' && this.props.displayedCriterions.includes('Décédés') &&  this.props.enablePrediction &&
                <Line strokeWidth={2} type="monotone" name={this.tr('Décédés (prédiction)')} legendType='none' animationBegin={1000}
                  animationDuration={1000}
                  dataKey="Décédés-prédiction" stroke="#db5e5e" strokeDasharray="5 5" dot={false}
                />
              }
              { this.props.mode === 'find' && this.props.displayedCriterions.includes('Existants') &&
                <Line strokeWidth={2} type="monotone" name={this.tr('Existants')}
                  animationDuration={1000}
                  dataKey="Existants" stroke="#c775ea" dot={false}
                />
              }
              { this.props.mode === 'find' && this.props.displayedCriterions.includes('Existants') &&  this.props.enablePrediction &&
                <Line strokeWidth={2} type="monotone" name={this.tr('Existants (prédiction)')} legendType='none' animationBegin={1000}
                  animationDuration={1000}
                  dataKey="Existants-prédiction" stroke="#c775ea" strokeDasharray="5 5" dot={false}
                />
              }
              { this.props.mode === 'compare' &&
                <Line strokeWidth={2} type="monotone"
                  animationDuration={1000}
                  name={`${this.props.land} (${this.props.criterion !== 'Confirmés' ? this.tr(this.props.criterion) : this.tr('Total')})`}
                  dataKey="land1" stroke="#c775ea" dot={false}
                />
              }
              { this.props.mode === 'compare' &&
                <Line strokeWidth={2} type="monotone"
                  name={`${this.props.land2} (${this.props.criterion !== 'Confirmés' ? this.tr(this.props.criterion) : this.tr('Total')})`}
                  animationDuration={1500}
                  dataKey="land2" stroke="#50994a" dot={false}
                />
              }
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }
}