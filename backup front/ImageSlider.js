import React, { useState } from 'react';

const ImageSlider = ({ otherImages, image, setTemporarySvgContent, setModalTitle, setCurrentTags, setColors, extractColors }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(2); // Center image index

  // Filter out the current image and handle null/undefined cases
  const filteredOtherImages = Array.isArray(otherImages) ? otherImages.filter(img => img.svg_image_file !== image) : [];
  
  const imagesToShow = window.innerWidth < 400 ? 3 : 5;

  const handleLeftArrowClick = () => {
    setSelectedImageIndex(2); // Reset selected image to center
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(filteredOtherImages.length - imagesToShow);
    }
  };

  const handleRightArrowClick = () => {
    setSelectedImageIndex(2); // Reset selected image to center
    if (currentIndex < filteredOtherImages.length - imagesToShow) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const renderOtherImages = () => {
    const isSmallScreen = window.innerWidth < 400;
    
    const baseContainerSizes = isSmallScreen
      ? [
          { width: '75%', height: '75%', zIndex: 2 },
          { width: '90%', height: '90%', zIndex: 4 },
          { width: '75%', height: '75%', zIndex: 2 }
        ]
      : [
          { width: '65%', height: '65%', zIndex: 1 },
          { width: '80%', height: '80%', zIndex: 2 },
          { width: '100%', height: '100%', zIndex: 4 },
          { width: '80%', height: '80%', zIndex: 2 },
          { width: '65%', height: '65%', zIndex: 1 }
        ];

    // Get images to display based on screen size
    const imagesToDisplay = isSmallScreen
      ? filteredOtherImages.slice(currentIndex, currentIndex + 3)
      : filteredOtherImages.slice(currentIndex, currentIndex + imagesToShow);

    // Modify container sizes based on selected image
    const containerSizes = baseContainerSizes.map((size, i) => {
      if (i === selectedImageIndex) {
        return { width: '100%', height: '100%', zIndex: 4 };
      }
      return size;
    });

    return (
      <div className="other-images-container" style={{ 
        display: 'flex', 
        overflow: 'hidden', 
        justifyContent: 'center', 
        alignItems: 'center',
        height: '100%'
      }}>
        {imagesToDisplay.map((img, index) => (
          <div 
            key={index} 
            className="other-image-container" 
            style={{ 
              marginLeft: index === 0 ? '0' : '-10%',
              width: containerSizes[index % containerSizes.length].width,
              height: containerSizes[index % containerSizes.length].height,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
              zIndex: containerSizes[index % containerSizes.length].zIndex,
              transition: 'all 0.3s ease-in-out' // Smooth transition for size changes
            }}
          >
            <img
              src={img.svg_image_file}
              alt={`SVG Preview ${currentIndex + index}`}
              style={{ 
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                cursor: 'pointer'
              }}
              onClick={() => {
                setSelectedImageIndex(index);
                fetch(img.svg_image_file)
                  .then(response => response.text())
                  .then(svgContent => {
                    setTemporarySvgContent(svgContent);
                    setModalTitle(`${(img.svg_file_categorie && Array.isArray(img.svg_file_categorie) ? img.svg_file_categorie.slice(0, 2).join(' / ') : 'All')} / ${img.title.rendered}`);
                    setCurrentTags(img.tags || []);
                    setColors(extractColors(svgContent));
                  })
                  .catch(error => console.error('Error fetching SVG:', error));
              }}
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="other-images-footer">
      <h3>Other SVG Images</h3>
      <div className="slider-container" style={{ display: 'flex', alignItems: 'center' }}>
        <button className="arrow left-arrow" onClick={handleLeftArrowClick}>&#10094;</button>
        {renderOtherImages()}
        <button className="arrow right-arrow" onClick={handleRightArrowClick}>&#10095;</button>
      </div>
    </div>
  );
};

export default ImageSlider;