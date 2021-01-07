import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

const SearchSelectInput = ({ onSearch, onSelect, onReset, style }) => {
  const inputRef = useRef(null);
  const [ results, setResults] = useState([]);
  const [ selected, setSelected ] = useState(null);
  const [ blurOccured, setBlurOccured ] = useState(false);

  const [ inputValue, setInputValue ] = useState('');

  console.log(results);

  useEffect(() => {
    if(selected) {
      onSelect(selected);
    }
  }, [ selected ]);

  useEffect(() => {
    if(!selected) {
      inputRef.current.value = '';
      if(blurOccured) {
        if(onReset) onReset();
        setBlurOccured(false);
      }
    }
  });

  const onSelectHandler = (value, label) => {
    setSelected(value);
    setInputValue(label)
  };

  const onChangeHandler = (value) => {
    setInputValue(selected ? '' : value);
    setResults(selected ? [] : onSearch(value));
    if(selected) {
      setSelected(null);
      if(onReset) { onReset() }
    }
  };

  const onBlurHandler = (e) => {
    setResults([]);
    setBlurOccured(true)
    e.currentTarget.removeEventListener('blur', onBlurHandler);
  };

  return (
    <div style={styles.field}>
      <input
        ref={inputRef}
        value={inputValue}
        type="text"
        onChange={({ currentTarget: { value } }) => { onChangeHandler(value) }}
        onFocus={(e) => { e.currentTarget.addEventListener('blur', onBlurHandler) }}
        style={style}
      />
      { results.length > 0 && !selected &&
        <div style={styles.results}>
        {
          results.map(({ value, label }) => (
            <Result key={value}
              style={styles.result}
              onMouseDown={() => onSelectHandler(value, label)}
            > { label }
            </Result>
          ))
        }
        </div>
      }
    </div>
  );
};

const Result = styled.div`
  padding: 5px 10px 5px 10px;
  background-color: #fff;

  &:hover {
    background-color: #6392FF;
    color: white;
  }
`;

const styles = {
  field: {
    position: 'relative',
    width: '100%'
  },
  results: {
    zIndex: 11,
    position: 'absolute',
    marginTop: -1,
    minWidth: '100%',
    borderWidth: 1,
    borderColor: '#bdbdbd',
    borderStyle: 'solid',
    cursor: 'default',
    backgroundColor: 'white'
  }
}

export default SearchSelectInput;