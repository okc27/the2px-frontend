import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { ChromePicker } from 'react-color';
import './ImageModal.css';

const ColorPicker = ({ color = '#6c63ff', onChange, onClose }) => {
  const pickerRef = useRef();

  // Handle click outside the color picker to close it
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

  // Predefined color options for quick selection
  const colorOptions = [
    'rgb(208, 2, 27)', 'rgb(245, 166, 35)', 'rgb(248, 231, 28)', 'rgb(139, 87, 42)', 'rgb(126, 211, 33)',
    'rgb(65, 117, 5)', 'rgb(189, 16, 224)', 'rgb(144, 19, 254)', 'rgb(74, 144, 226)', 'rgb(80, 227, 194)', 'rgb(184, 233, 134)', 'rgb(0, 0, 0)', 'rgb(74, 74, 74)', 'rgb(155, 155, 155)', 'rgb(255, 255, 255)'
  ];

  // Handle color selection from the color boxes
  const handleColorSelect = (selectedColor) => {
    // Convert the RGB color to HEX format before passing it to onChange
    const rgbToHex = (rgb) => {
      const result = rgb.match(/\d+/g);
      return `#${((1 << 24) + (parseInt(result[0]) << 16) + (parseInt(result[1]) << 8) + parseInt(result[2])).toString(16).slice(1).toUpperCase()}`;
    };
    onChange({ hex: rgbToHex(selectedColor) });
  };

  return (
    <div className="color-picker-container" ref={pickerRef}>
      {/* Main color picker */}
      <ChromePicker
        color={color}
        onChange={(newColor) => onChange(newColor)}
        disableAlpha
      />

      {/* Color boxes and transparent button */}
      <div className="quick-color-selector">
        {colorOptions.map((colorOption, index) => (
          <div
            key={index}
            className="color-box"
            style={{ backgroundColor: colorOption }}
            onClick={() => handleColorSelect(colorOption)}
          />
        ))}
      </div>
    </div>
  );
};

// Prop types validation
ColorPicker.propTypes = {
  color: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ColorPicker;
