import React from 'react';

const WorldDataPannel = ({ worldDataObj, pointedDate, tr, formatNumber, getYesterdayDateISO }) => {
  if(!pointedDate) {
    pointedDate = getYesterdayDateISO();
  }
  return(
    <React.Fragment>
      { worldDataObj && pointedDate <= getYesterdayDateISO() &&
        <div style={styles.container} className='thin-shadow'>
          <div style={{marginBottom: 10, color: '#444'}}><b>{ tr('Dans le Monde') } ({ pointedDate })</b></div>
          <div>
            <span style={{display: 'inline-block', width: 80}}>{ tr('Total') }</span>
            <span style={{display: 'inline-block', width: 80, textAlign: 'right'}}>{ formatNumber(worldDataObj[pointedDate]['Confirmés']) }</span>
          </div>
          <div>
            <span style={{display: 'inline-block', width: 80}}>{ tr('Rétablis') }</span>
            <span style={{display: 'inline-block', width: 80, textAlign: 'right'}}>{ formatNumber(worldDataObj[pointedDate]['Rétablis']) }</span>
          </div>
          <div>
            <span style={{display: 'inline-block', width: 80}}>{ tr('Décédés') }</span>
            <span style={{display: 'inline-block', width: 80, textAlign: 'right'}}>{ formatNumber(worldDataObj[pointedDate]['Décédés']) }</span>
          </div>
          <div>
            <span style={{display: 'inline-block', width: 80}}>{ tr('Existants') }</span>
            <span style={{display: 'inline-block', width: 80, textAlign: 'right'}}>{ formatNumber(worldDataObj[pointedDate]['Existants']) }</span>
          </div>
        </div>
      }
    </React.Fragment>
  );
};

const styles = {
  container: {
    display: 'block',
    position: 'absolute',
    left: 100,
    top: 120,
    padding: 10,
    backgroundColor: '#F4F5F9',
    border: '1px solid #cccfdd',
    zIndex: 10,
    lineHeight: '22px'
  }
}

export default WorldDataPannel;