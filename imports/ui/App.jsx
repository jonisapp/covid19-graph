import React, {useState, useEffect} from 'react';
import Chart from './chart.component';
import styled from 'styled-components';
import FilterButtons from './components/FilterButtons.component';

const App = () => {
  const [ data, setData ] = useState(null);
  const [ landsNames, setLandsNames ] = useState([]);
  const [ mode, setMode ] = useState('find');
  const [ selectedLand, setSelectedLand ] = useState('Mainland China');
  const [ selectedLand2, setSelectedLand2 ] = useState('Switzerland');
  const [ compareCriterion, setCompareCriterion ] = useState('Confirmés');

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
    <div style={styles.body}>
      <div style={{height: 40}} />
      <Toolbar style={{width: 1400, marginLeft: 'auto', marginRight: 'auto', marginBottom: 40}}>
        <FilterButtons
          shape='squared'
          style={{width: 250}}
          buttons={[
            {value: 'find', label: 'Trouver'},
            {value: 'compare', label: 'Comparer'}
          ]}
          selectedButtons={mode}
          onSwitch={(value) => {
            setMode(value);
          }}
        />
        {
          mode === 'compare' &&
            <FilterButtons
              style={{width: 400}}
              buttons={[
                {value: 'Confirmés', label: 'Confirmés'},
                {value: 'Récupéré', label: 'Récupéré'},
                {value: 'Morts', label: 'Morts'}
              ]}
              selectedButtons={compareCriterion}
              onSwitch={(value) => {
                setCompareCriterion(value);
              }}
            />
        }
        <select
          value={selectedLand}
          style={{height: 36, fontSize: 18, borderRadius: 5}}
          onChange={({ currentTarget: { value } }) => { setSelectedLand(value) }}
        >
          {
            landsNames.map(landKey => (
              <option key={landKey}>{ landKey }</option>
            ))
          }
        </select>
        {
          mode === 'compare' &&
          <select
            value={selectedLand2}
            style={{height: 36, fontSize: 18, borderRadius: 5}}
            onChange={({ currentTarget: { value } }) => { setSelectedLand2(value) }}
          >
            {
              landsNames.map(landKey => (
                <option key={landKey}>{ landKey }</option>
              ))
            }
          </select>
        }
      </Toolbar>
      <div style={styles.container}>
        {
          data &&
          <Chart data={data} lands={landsNames} land={selectedLand} land2={selectedLand2} mode={mode} criterion={compareCriterion} />
        }
      </div>
      <div style={{marginTop: 40, paddingBottom: 40, textAlign: 'center'}}>
        Les données proviennent de l'<b>OMS</b> (Organisation mondiale de la Santé) - Certaines statistiques sont susceptible d'être inexactes voire absentes.<br /><br />Avez-vous besoin d'un développeur ?
        <a style={{marginLeft: 10}} href='mailto:zappala.jonathan@gmail.com'>zappala.jonathan@gmail.com</a>&nbsp;-&nbsp;
        <a href="https://www.linkedin.com/in/jonathan-zappala-575a8b14b/">Profil LinkedIn</a>
      </div>
    </div>
  );
};

const styles = {
  body: {
    backgroundColor: '#f4f5f9',
    height: '100%'
  },
  container: {
    width: 1400,
    marginLeft: 'auto',
    marginRight: 'auto',
    backgroundColor: 'white'
  },
  button: {
    height: 36,
    outline: 'none',
    borderStyle: 'solid',
    borderColor: '#b4b2c1',
    borderWidth: 1,
    backgroundColor: '#D0CEE0',
    color: '#313172',
    opacity: 1,
    textShadow: '0px 1px 2px #f5f4f9'
  }
};

const Toolbar = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  background-color: transparent;

  select {
    background-color: white;
    outline: none;
    min-width: 300px;
  }
`;

export default App;

