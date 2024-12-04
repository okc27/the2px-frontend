import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { ChromePicker } from 'react-color';
import './ImageModal.css';

const ColorPickerb = ({ color = '#6c63ff', onChange, onClose }) => {
  const pickerRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const colorOptions = [
    '#6c63ff', '#ff6c63', '#63ff6c', '#63cfff', '#ffdc63',
    '#ff5733', '#33ff57', '#57ffdc', '#dc33ff', 'transparent'
  ];

  const handleColorSelect = (selectedColor) => {
    if (selectedColor === 'transparent') {
      onChange({ hex: 'transparent' });
    } else {
      onChange({ hex: selectedColor });
    }
  };

  return (
    <div className="color-picker-container" ref={pickerRef}>
      <ChromePicker
        color={color}
        onChange={(newColor) => onChange(newColor)}
        disableAlpha
      />
      <div className="quick-color-selector">
        {colorOptions.map((colorOption, index) => (
          <div
            key={index}
            className={`color-box ${colorOption === 'transparent' ? 'transparent' : ''}`}
            style={{
              backgroundColor: colorOption === 'transparent' ? 'transparent' : colorOption,
              border: colorOption === 'transparent' ? '1px solid #ccc' : 'none',
            }}
            onClick={() => handleColorSelect(colorOption)}
          />
        ))}
      </div>
    </div>
  );
};

ColorPickerb.propTypes = {
  color: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ColorPickerb;
