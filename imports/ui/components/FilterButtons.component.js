import React from 'react';
import styled from 'styled-components';

const FilterButtons = ({
    buttons, selectedButtons, onSwitch, style, shape, buttonBorder, buttonBackgroundColor, buttonBorderColor,
    roundedRadius, squaredRadius, borderWidth
  }) => {
  return (
    <div className='switchButtons' style={{...styles.switchButtons, ...style, }}>
      {
        buttons.map(button => {
          return (
            <FilterButton key={button.value}
              shapeRadius={shape === 'squared' ? squaredRadius : roundedRadius}
              borderWidth={borderWidth}
              buttonBackgroundColor={buttonBackgroundColor}
              buttonBorderColor={buttonBorderColor}
              style={{display: 'flex', alignItems: 'center', ...(() => {
                if(typeof selectedButtons !== 'undefined') {
                  if(Array.isArray(selectedButtons)) {
                    if(selectedButtons.includes(button.value)) {
                      return styles.selected;
                    } else { return {} }
                  } else if(selectedButtons === button.value) {
                    return styles.selected;
                  } else { return {} }
                } else { return {} }
              })()}}
                onClick={() => { onSwitch(button.value) }}
              >
                <div style={{width: '100%', textAlign: 'center'}}>{ button.label }</div>
            </FilterButton>
          );
        })
      }
    </div>
  );
};

const FilterButton = styled.div`
flex: 1;
padding: 0 7px 0 7px;
background-color: ${({buttonBackgroundColor}) => buttonBackgroundColor};
border-style: solid;
border-width: ${({borderWidth}) => `${borderWidth}px 0 ${borderWidth}px ${borderWidth}px`};
border-color: ${({buttonBorderColor}) => buttonBorderColor};
transition: all .3s ease;
cursor: default;

&:first-child {
  padding-left: 14px;
  border-radius: ${({shapeRadius}) => shapeRadius}px 0 0 ${({shapeRadius}) => shapeRadius}px;
}

&:last-child {
  padding-right: 14px;
  border-right: ${({borderWidth}) => borderWidth}px solid #bbb;
  border-radius: 0 ${({shapeRadius}) => shapeRadius}px ${({shapeRadius}) => shapeRadius}px 0;
}
`;

const styles = {
  switchButtons: {
    display: 'flex',
  },
  selected: {
    backgroundColor: '#6C757D',
    color: 'white',
    textShadow: 'none'
  }
}

FilterButtons.defaultProps = {
  shape: 'rounded',
  roundedRadius: 18,
  squaredRadius: 5,
  borderWidth: 1,
  buttonBackgroundColor: '#ddd',
  buttonBorderColor: '#bbb',
  style: {}
}

export default FilterButtons;