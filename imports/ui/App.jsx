import React, {useState, useEffect} from 'react';
import Chart from './chart.component';
import styled from 'styled-components';
import FilterButtons from './components/FilterButtons.component';

import { isMobile } from 'react-device-detect';
import SearchSelectInput from './components/SearchSelectInput.component';

const App = () => {
  const [ data, setData ] = useState(null);
  const [ landsNames, setLandsNames ] = useState([]);
  const [ mode, setMode ] = useState('find');
  const [ selectionMode, setSelectionMode ] = useState('search');
  const [ selectedLand, setSelectedLand ] = useState('Mainland China');
  const [ selectedLand2, setSelectedLand2 ] = useState('Switzerland');
  const [ compareCriterion, setCompareCriterion ] = useState('Confirmés');
  const [ showSourcesList, setShowSourcesList ] = useState(false);
  const [ displayedCriterions, setDisplayedCriterions ] = useState(['Confirmés', 'Existants']);

  useEffect(() => {
    Meteor.call('getData', (err, resData) => {
      var landsNames_arr = [];
      Object.keys(resData).forEach(key => {
        landsNames_arr.push(key);
      });
      console.log(resData);
      setData(resData);
      console.log(landsNames_arr);
      const c = landsNames_arr[0];
      console.log(c)
      setLandsNames(landsNames_arr.sort((a, b) => resData[a][resData[a].length-1]['Confirmés'] < resData[b][resData[b].length-1]['Confirmés'] ? 1 : -1));
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
                style={{width: 370}}
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
            mode === 'find' &&
              <FilterButtons
                style={{width: 200}}
                buttons={[
                  {value: 'search', label: 'Recherche'},
                  {value: 'list', label: 'Liste'},
                ]}
                selectedButtons={selectionMode}
                onSwitch={(value) => {
                  setSelectionMode(value)
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
          { selectionMode === 'list' || mode === 'compare'
          ?
            <select
              value={selectedLand}
              style={styles.input}
              onChange={({ currentTarget: { value } }) => { setSelectedLand(value) }}
            >
              {
                landsNames.map(landKey => (
                  <option key={landKey} value={landKey}>{ landKey } ({ data[landKey][data[landKey].length-1]['Confirmés'] })</option>
                ))
              }
            </select>
          :
            <div>
              <SearchSelectInput
                style={styles.input}
                onSearch={(text) => {
                  if(text !== '') {
                    const regex = new RegExp(`${text}`, 'i');
                    return Object.keys(data).filter(key => regex.test(key))
                    .map(key => {
                      return {
                        value: key,
                        label: key
                      }
                    })
                    .slice(0, 15);
                  } else { return [] }
                }}
                onSelect={(key) => {
                  setSelectedLand(key);
                }}
              />
            </div>
          }
          {
            mode === 'compare' &&
            <React.Fragment>
              <select
                value={selectedLand2}
                style={{height: 36, fontSize: 18, borderRadius: 5}}
                onChange={({ currentTarget: { value } }) => { setSelectedLand2(value) }}
              >
                {
                  landsNames.map(landKey => (
                    <option key={landKey} value={landKey}>{ landKey } ({ data[landKey][data[landKey].length-1]['Confirmés'] })</option>
                  ))
                }
              </select>
            </React.Fragment>
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
              <img style={{color: 'green'}} src="/spinner.svg" alt="spinner"/>
            </div>
          }
        </div>
      </div>
      <div style={{marginTop: 40, textAlign: 'center', color: '#e3e5ef'}}>
        Les données proviennent de Johns Hopkins University CSSE (
        <a id='source' href='#source' style={styles.link} onClick={toggleSourcesListHandler}>sources</a>,&nbsp;
        <a style={styles.link} href='https://github.com/CSSEGISandData/COVID-19/tree/master/csse_covid_19_data/csse_covid_19_daily_reports'>données</a>) - Certaines statistiques sont susceptibles d'être inexactes (sources multiples) voire absentes.<br />
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
        <br />Vous êtes à la recherche d'un développeur ? (web, mobile, server)
        <a style={{marginLeft: 10, color: '#c6fff7'}} href='mailto:zappala.jonathan@gmail.com'>zappala.jonathan@gmail.com</a>&nbsp;-&nbsp;
        <a style={styles.link} href="https://www.linkedin.com/in/jonathan-zappala-575a8b14b/">LinkedIn</a>&nbsp;-&nbsp;
        <a style={styles.link} href='https://www.malt.fr/profile/jonathanzappala'>Malt</a>&nbsp;-&nbsp;
        <a style={styles.link} href='https://www.facebook.com/jonathan.zappala.9'>Facebook</a>
        <div style={{marginTop: 50, width: 640, textAlign: 'left', marginLeft: 'auto', marginRight: 'auto'}}>
        <h4 style={{textAlign: 'center'}}>Informations concernant l'utilisation de cette application</h4>
        Les données présentées ici appartiennent au domaine public et sont fournies sans garantie d'aucune sorte.
        L'exploitation de ces informations par l'intermédiaire de cette application est strictement réservé à un usage éducatif et à la recherche.
        Un usage dans un cadre médical ou à des fins commerciales est strictement interdit.
        La licence exposée ci-dessous concerne l'application à proprement parler (code et fonctionnalités), en aucun cas les données présentées.
        </div>
        <div style={{padding: 20, marginTop: 50, textAlign: 'justify', backgroundColor: 'rgba(0, 0, 0, 0.25)', border: '1px solid #576068', color: '#e3e5ef'}}>
          <div style={{textAlign: 'center'}}>Covid19-graph application MIT License © 2020 Jonathan Zappalà</div>
          <br />
          Permission is hereby granted, free of charge, to any person obtaining a copy
          of this software and associated documentation files (the "Software"), to deal
          in the Software without restriction, including without limitation the rights
          to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
          copies of the Software, and to permit persons to whom the Software is
          furnished to do so, subject to the following conditions:

          The above copyright notice and this permission notice shall be included in all
          copies or substantial portions of the Software.

          THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
          IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
          FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
          AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
          LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
          OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
          SOFTWARE.
        </div>
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
  input: {
    boxSizing: 'border-box',
    height: 36,
    fontSize: 18,
    borderRadius: 5,
    outline: 'none',
    width: 230
  },
  // button: {
  //   height: 36,
  //   outline: 'none',
  //   borderStyle: 'solid',
  //   borderColor: '#b4b2c1',
  //   borderWidth: 1,
  //   backgroundColor: '#D0CEE0',
  //   color: '#313172',
  //   opacity: 1,
  //   textShadow: '0px 1px 2px #f5f4f9'
  // },
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

