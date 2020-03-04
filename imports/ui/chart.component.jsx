import React, { PureComponent } from 'react';
import {
  Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart, ResponsiveContainer
} from 'recharts';

export default class Chart extends PureComponent {
  render() {
    var landsDataByDates = {};
    const land1Data = this.props.data[this.props.land];
    const land2Data = this.props.data[this.props.land2];
    land1Data.map(item => {
      if(typeof landsDataByDates[item.date] === 'undefined') {
        landsDataByDates[item.date] = {
          land1: item[this.props.criterion]
        };
      } else {
        landsDataByDates[item.date].land1 = item[this.props.criterion]
      }
    });
    land2Data.map(item => {
      if(typeof landsDataByDates[item.date] === 'undefined') {
        landsDataByDates[item.date] = {
          land2: item[this.props.criterion]
        };
      } else {
        landsDataByDates[item.date].land2 = item[this.props.criterion]
      }
    });
    let land1LastDataForCriterion = 0;
    let land2LastDataForCriterion = 0;
    const landCompareData = Object.keys(landsDataByDates).map(key => {
      return {
        date: key,
        ...landsDataByDates[key]
      }
    })
    .sort((a, b) => a.date < b.date ? -1 : 1)
    .map(item => {
      const updatedItem = {
        date: item.date,
        land1: item.land1 ? item.land1 : land1LastDataForCriterion,
        land2: item.land2 ? item.land2 : land2LastDataForCriterion
      }
      if(item.land1) { land1LastDataForCriterion = item.land1 }
      if(item.land2) { land2LastDataForCriterion = item.land2 }
      return updatedItem;
    });
    console.log(landCompareData);
    return (
      <div className='thin-shadow' style={{width: '100%', borderWidth: 1, borderStyle: 'solid', borderColor: '#cccfdd'}}>
        <h2 style={{textAlign: 'center', paddingTop: 20}}>COVID-19 (évolution en { this.props.land })</h2>
        <div style={{width: '100%', height: 530}}>
          <ResponsiveContainer>
            <ComposedChart
              width={'100%'}
              data={this.props.mode === 'find' ? this.props.data[this.props.land] : landCompareData}
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
              { this.props.mode === 'find' && <Area strokeWidth={2} type="monotone" dataKey="Confirmés" stroke="orange" fill='url(#confirmedColor)' activeDot={{ r: 10 }} /> }
              { this.props.mode === 'find' &&
                <Line strokeWidth={2} type="monotone" dataKey="Récupéré" stroke="#82ca9d" dot={false} />
              }
              { this.props.mode === 'find' &&
                <Line strokeWidth={2} type="monotone" dataKey="Morts" stroke="red" dot={false} />
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