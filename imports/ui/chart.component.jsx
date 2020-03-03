import React, { useState, useEffect, PureComponent } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import {
  Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart, ResponsiveContainer
} from 'recharts';

export default class Chart extends PureComponent {
  constructor(props) {
    super(props);
    console.log(this.props.data);
    this.state = {
      selectedData: this.props.data['Mainland China'],
      land: 'Mainland China'
    }
  }

  render() {
    return (
      <div style={{width: '100%', display: 'flex', justifyContent: 'center'}}>
        <div style={{width: '100%', height: 700}}>
          <select
            value={this.state.land}
            style={{height: 36, fontSize: 18, borderRadius: 5}}
            onChange={({ currentTarget: { value } }) => { this.setState({ land: value, selectedData: this.props.data[value] }) }}>
          {
            this.props.lands.map(landKey => (
              <option key={landKey}>{ landKey }</option>
            ))
          }
          </select>
          <h1 style={{textAlign: 'center'}}>COVID-19 (état { this.state.land })</h1>
          <ResponsiveContainer>
            <ComposedChart
              width={'100%'}
              height={700}
              data={this.state.selectedData}
              margin={{
                top: 5, right: 30, left: 20, bottom: 5,
              }}
            >
              <CartesianGrid stroke="#ccc" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="Confirmés" stroke="orange" fill='#efefef' activeDot={{ r: 10 }} />
              <Line type="monotone" dataKey="Récupéré" stroke="#82ca9d" />
              <Line type="monotone" dataKey="Morts" stroke="red" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }
}