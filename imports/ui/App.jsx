import React, {useState, useEffect} from 'react';
import Chart from './chart.component';

const App = () => {
  const [ data, setData ] = useState(null);
  const [ landsNames, setLandsNames ] = useState([]);

  useEffect(() => {
    Meteor.call('getData', (err, resData) => {
      var landsNames_arr = [];
      Object.keys(resData).forEach(key => {
        landsNames_arr.push(key);
      });
      setData(resData);
      setLandsNames(landsNames_arr.sort((a, b) => a < b ? -1 : 1));
    });
  }, []);

  return(
    <div>
      {
        data &&
        <Chart data={data} lands={landsNames} />
      }
      
    </div>
  );
};

export default App;

