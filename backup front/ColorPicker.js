import React, { useEffect, useRef } from 'react';
import { SketchPicker } from 'react-color';
import PropTypes from 'prop-types';
import './ImageModal.css';

const ColorPicker = ({ color, onChange, onClose}) => {
  const pickerRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        onClose();
      }
    };

    // Listen for clicks outside the color picker
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className="color-picker-container" ref={pickerRef}>
      <SketchPicker color={color} onChangeComplete={onChange} />
    </div>
  );
};

ColorPicker.propTypes = {
  color: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,

};

export default ColorPicker;
