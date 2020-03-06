import React, {useState, useEffect} from 'react';
import Chart from './chart.component';
import styled from 'styled-components';
import FilterButtons from './components/FilterButtons.component';

import { isMobile } from 'react-device-detect';

const App = () => {
  const [ data, setData ] = useState(null);
  const [ landsNames, setLandsNames ] = useState([]);
  const [ mode, setMode ] = useState('find');
  const [ selectedLand, setSelectedLand ] = useState('Mainland China');
  const [ selectedLand2, setSelectedLand2 ] = useState('Switzerland');
  const [ compareCriterion, setCompareCriterion ] = useState('Confirmés');
  const [ showSourcesList, setShowSourcesList ] = useState(false);
  const [ displayedCriterions, setDisplayedCriterions ] = useState(['Confirmés', 'Existants'])

  useEffect(() => {
    Meteor.call('getData', (err, resData) => {
      var landsNames_arr = [];
      Object.keys(resData).forEach(key => {
        landsNames_arr.push(key);
      });
      console.log(resData);
      setData(resData);
      setLandsNames(landsNames_arr.sort((a, b) => a < b ? -1 : 1));
    });
  }, []);

  const toggleSourcesListHandler = () => {
    setShowSourcesList(!showSourcesList);
  }

  if(isMobile) {
    return(
      <div style={{...styles.body, paddingBottom: '2rem'}}>
        <div style={styles.mobileContainer}>
          {
            data &&
            <Chart
              data={data}
              lands={landsNames}
              land={selectedLand}
              land2={selectedLand2}
              mode={mode}
              criterion={compareCriterion}
              displayedCriterions={displayedCriterions}
            />
          }
        </div>
        <Toolbar style={{width: '100%', marginBottom: 40, justifyContent: 'center'}}>
          <FilterButtons
            shape='squared'
            squaredRadius={10}
            borderWidth={2}
            style={{marginTop: 50, width: '50%', height: '7rem', fontSize: '2.5rem'}}
            buttons={[
              {value: 'find', label: 'Trouver'},
              {value: 'compare', label: 'Comparer'}
            ]}
            selectedButtons={mode}
            onSwitch={(value) => {
              setMode(value);
            }}
          />
        </Toolbar>
        <Toolbar style={{width: '100%', marginBottom: 40, justifyContent: 'center'}}>
          <select
            value={selectedLand}
            style={{width: '70%', height: '7rem', fontSize: '2.5rem', borderRadius: 5, padding: '0.5rem'}}
            onChange={({ currentTarget: { value } }) => { setSelectedLand(value) }}
          >
            {
              landsNames.map(landKey => (
                <option key={landKey}>{ landKey }</option>
              ))
            }
          </select>
        </Toolbar>
        {
          mode === 'compare' &&
            <Toolbar style={{width: '100%', marginBottom: 40, justifyContent: 'center'}}>
              <select
                value={selectedLand2}
                style={{width: '70%', height: '7rem', fontSize: '2.5rem', borderRadius: 5, padding: '0.5rem'}}
                onChange={({ currentTarget: { value } }) => { setSelectedLand2(value) }}
              >
                {
                  landsNames.map(landKey => (
                    <option key={landKey}>{ landKey }</option>
                  ))
                }
              </select>
            </Toolbar>
        }
        {
          mode === 'find' &&
            <Toolbar style={{width: '100%', marginBottom: 40, justifyContent: 'center'}}>
              <FilterButtons
                roundedRadius={50}
                borderWidth={2}
                style={{width: '90%', fontSize: '2.5rem', height: '7rem'}}
                buttons={[
                  {value: 'Confirmés', label: 'Confirmés'},
                  {value: 'Rétablis', label: 'Rétablis'},
                  {value: 'Décédés', label: 'Décédés'},
                  {value: 'Existants', label: 'Existants'}
                ]}
                selectedButtons={displayedCriterions}
                onSwitch={(value) => {
                  if(displayedCriterions.includes(value)) {
                    if(displayedCriterions.length > 1) {
                      setDisplayedCriterions(displayedCriterions.filter(buttonValue => buttonValue !== value));
                    }
                  } else {
                    setDisplayedCriterions([...displayedCriterions, value]);
                  }
                }}
              />
            </Toolbar>
        }
        {
          mode === 'compare' &&
            <Toolbar style={{width: '100%', marginBottom: 40, justifyContent: 'center'}}>
              <FilterButtons
                roundedRadius={50}
                borderWidth={2}
                style={{width: '90%', fontSize: '2.5rem', height: '7rem'}}
                buttons={[
                  {value: 'Confirmés', label: 'Confirmés'},
                  {value: 'Rétablis', label: 'Rétablis'},
                  {value: 'Décédés', label: 'Décédés'}
                ]}
                selectedButtons={compareCriterion}
                onSwitch={(value) => {
                  setCompareCriterion(value);
                }}
              />
            </Toolbar>
        }
      </div>
    );
  }

  return(
    <React.Fragment>
      <div style={styles.body}>
        <div style={{height: 40}} />
        <Toolbar style={{width: 1100, marginLeft: 'auto', marginRight: 'auto', marginBottom: 40}}>
          <FilterButtons
            shape='squared'
            style={{width: 200}}
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
            mode === 'find' &&
              <FilterButtons
                style={{width: 400}}
                buttons={[
                  {value: 'Confirmés', label: 'Confirmés'},
                  {value: 'Rétablis', label: 'Rétablis'},
                  {value: 'Décédés', label: 'Décédés'},
                  {value: 'Existants', label: 'Existants'}
                ]}
                selectedButtons={displayedCriterions}
                onSwitch={(value) => {
                  if(displayedCriterions.includes(value)) {
                    if(displayedCriterions.length > 1) {
                      setDisplayedCriterions(displayedCriterions.filter(buttonValue => buttonValue !== value));
                    }
                  } else {
                    setDisplayedCriterions([...displayedCriterions, value]);
                  }
                }}
              />
          }
          {
            mode === 'compare' &&
              <FilterButtons
                style={{width: 300}}
                buttons={[
                  {value: 'Confirmés', label: 'Confirmés'},
                  {value: 'Rétablis', label: 'Rétablis'},
                  {value: 'Décédés', label: 'Décédés'}
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
            data
            ?
              <Chart
                data={data}
                lands={landsNames}
                land={selectedLand}
                land2={selectedLand2}
                mode={mode}
                criterion={compareCriterion}
                displayedCriterions={displayedCriterions}
              />
            : 
            <div style={{width: '100%', height: 530, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
              <img src="/spinner.svg" alt="spinner"/>
            </div>
          }
        </div>
      </div>
      <div style={{marginTop: 40, textAlign: 'center', color: '#e3e5ef'}}>
        Les données proviennent de Johns Hopkins University CSSE <a href='#' style={styles.link} onClick={toggleSourcesListHandler}>(liste des sources)</a> - Certaines statistiques sont susceptibles d'être inexactes (sources multiples) voire absentes.<br />
        { showSourcesList &&
          <div style={styles.sourcesList}> 
            <ul>
              <li>World Health Organization (WHO)</li>
              <li>DXY.cn. Pneumonia. 2020</li>
              <li>BNO News</li>
              <li>National Health Commission of the People’s Republic of China</li>
              <li>China CDC (CCDC)</li>
              <li>Hong Kong Department of Health</li>
              <li>Macau Government</li>
              <li>Taiwan CDC</li>
              <li>US CDC</li>
              <li>Government of Canada</li>
              <li>Australia Government Department of Health</li>
              <li>European Centre for Disease Prevention and Control (ECDC)</li>
              <li>Ministry of Health Singapore (MOH)</li>
              <li>Italy Ministry of Health</li>
            </ul>
          </div>
        }
        <br />Avez-vous besoin d'un développeur polyvalent ? (web, mobile, server)
        <a style={{marginLeft: 10, color: '#c6fff7'}} href='mailto:zappala.jonathan@gmail.com'>zappala.jonathan@gmail.com</a>&nbsp;-&nbsp;
        <a style={styles.link} href="https://www.linkedin.com/in/jonathan-zappala-575a8b14b/">LinkedIn</a>&nbsp;-&nbsp;
        <a style={styles.link} href='https://www.malt.fr/profile/jonathanzappala'>Malt</a>&nbsp;-&nbsp;
        <a style={styles.link} href='https://www.facebook.com/jonathan.zappala.9'>Facebook</a>
      </div>
    </React.Fragment>
  );
};

const styles = {
  body: {
    backgroundColor: '#f4f5f9',
    height: '100%',
    paddingBottom: 60,
    borderRadius: 10
  },
  container: {
    width: 1100,
    marginLeft: 'auto',
    marginRight: 'auto',
    backgroundColor: 'white'
  },
  mobileContainer: {
    width: '100%',
    marginLeft: 'auto',
    marginRight: 'auto',
    backgroundColor: 'white',
    overflowX: 'scroll'
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
  },
  sourcesList: {
    marginLeft: 'auto',
    marginRight: 'auto',
    textAlign: 'left',
    width: 450,
    marginTop: 20,
    marginBottom: 0,
    borderStyle: 'solid',
    borderColor: '#cccfdd',
    borderWidth: 1,
    backgroundColor: '#F4F5F9',
    color: '#444'
  },
  link: {
    color: '#c6fff7'
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
    min-width: 200px;
  }
`;

export default App;

