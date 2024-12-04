import React, { useEffect, useState } from 'react';
import './OtherImages.css'; // Import the CSS file

const OtherImages = ({ otherImages, currentImage, onImageClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imagesToShow, setImagesToShow] = useState(getInitialImagesToShow());
  const [clickedImage, setClickedImage] = useState(null);

  function getInitialImagesToShow() {
    if (window.innerWidth < 786) {
      return 3;
    } else if (window.innerWidth < 1000) {
      return 4;
    } else {
      return 5;
    }
  }

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 400) {
        setImagesToShow(2);
      } else if (window.innerWidth < 786) {
        setImagesToShow(3);
      } else if (window.innerWidth < 1000) {
        setImagesToShow(4);
      } else {
        setImagesToShow(5);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filteredOtherImages = Array.isArray(otherImages)
    ? otherImages.filter((img) => img.svg_image_file !== currentImage)
    : [];

  const imagesToDisplay = filteredOtherImages.slice(currentIndex, currentIndex + imagesToShow);

  const handleImageClick = (img) => {
    setClickedImage(img.svg_image_file);
    onImageClick(img);
  };

  const handleLeftClick = () => {
    setCurrentIndex((prevIndex) => Math.max(0, prevIndex - 1));
  };

  const handleRightClick = () => {
    setCurrentIndex((prevIndex) =>
      Math.min(prevIndex + 1, filteredOtherImages.length - imagesToShow)
    );
  };

  return (
    <div className="slider-container">
      {/* Left arrow */}
      <div
        onClick={handleLeftClick}
        className={`circle-button left-button ${currentIndex === 0 ? 'disabled' : ''}`}
      >
        <img
          src="https://the2px.com/wp-content/uploads/2024/12/the2px-All-_-pp-20241202-3.svg"
          alt="Left Arrow"
          className="arrow-icon"
          style={{ transform: 'rotate(180deg)' }} // Rotates the arrow for left direction
        />
      </div>

      {/* Image slider */}
      <div className="other-images-container">
        {imagesToDisplay.map((img, index) => (
          <div
            key={index}
            className={`other-image-container ${
              img.svg_image_file === clickedImage ? 'clicked' : ''
            }`}
            onClick={() => handleImageClick(img)}
          >
            <img
              src={img.svg_image_file}
              alt={`SVG Preview ${currentIndex + index}`}
              className="image-preview"
            />
          </div>
        ))}
      </div>

      {/* Right arrow */}
      <div
        onClick={handleRightClick}
        className={`circle-button right-button ${
          currentIndex + imagesToShow >= filteredOtherImages.length ? 'disabled' : ''
        }`}
      >
        <img
          src="https://the2px.com/wp-content/uploads/2024/12/the2px-All-_-pp-20241202-3.svg"
          alt="Right Arrow"
          className="arrow-icon"
        />
      </div>
    </div>
  );
};

export default OtherImages;
