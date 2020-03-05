import React, { PureComponent } from 'react';
import {
  Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart, ResponsiveContainer
} from 'recharts';

const criterionsTitles = {
  'Confirmés': 'cas confirmés',
  'Récupéré': 'cas rétablis',
  'Morts': 'décès'
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
    if(currentValue && currentValue >= previousValue) {
      return currentValue;
    } else {
      return previousValue;
    }
  }

  cleanLandData(landData_arr) {
    var landDataByDates = {};
    landData_arr.forEach(item => {
      if(typeof landDataByDates[item.date] === 'undefined') {
        landDataByDates[item.date] = item;
      }
    });
    let landPreviousConfirmedValue = 0;
    let landPreviousRecoveredValue = 0;
    let landPreviousDeathsValue = 0;
    return Object.keys(landDataByDates).map(key => {
      landPreviousConfirmedValue = this.correctValue(landDataByDates[key]['Confirmés'], landPreviousConfirmedValue);
      landPreviousRecoveredValue = this.correctValue(landDataByDates[key]['Récupéré'], landPreviousRecoveredValue);
      landPreviousDeathsValue = this.correctValue(landDataByDates[key]['Morts'], landPreviousDeathsValue);
      return {
        date: landDataByDates[key].date,
        'Confirmés': landPreviousConfirmedValue,
        'Récupéré': landPreviousRecoveredValue,
        'Morts': landPreviousDeathsValue,
        'Existants': landPreviousConfirmedValue - landPreviousRecoveredValue - landPreviousDeathsValue
      }
    });
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
        <h2 style={{textAlign: 'center', paddingTop: 20}}>
          { this.props.mode === 'find'
            ?
              <React.Fragment>COVID-19 : évolution en { this.props.land }</React.Fragment>
            :
              <React.Fragment>COVID-19 : comparaison entre { this.props.land } et { this.props.land2 } ({ criterionsTitles[this.props.criterion] })</React.Fragment>
          }
          
        </h2>
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
              <Legend verticalAlign='top' height={36} />
              { this.props.mode === 'find' && this.props.displayedCriterions.includes('Confirmés') &&
                <Area strokeWidth={2} type="monotone" dataKey="Confirmés" stroke="orange" fill='url(#confirmedColor)' activeDot={{ r: 10 }} /> }
              { this.props.mode === 'find' && this.props.displayedCriterions.includes('Récupéré') &&
                <Line strokeWidth={2} type="monotone" dataKey="Récupéré" stroke="#82ca9d" dot={false} />
              }
              { this.props.mode === 'find' && this.props.displayedCriterions.includes('Morts') &&
                <Line strokeWidth={2} type="monotone" dataKey="Morts" stroke="#db5e5e" dot={false} />
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