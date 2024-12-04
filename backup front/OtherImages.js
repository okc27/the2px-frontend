import React, { useEffect, useState } from 'react';
import './OtherImages.css'; // Import the CSS for styling

const OtherImages = ({ otherImages, currentImage, onImageClick }) => {
  const [visibleImagesCount, setVisibleImagesCount] = useState(4); // Default to 4 images per row
  const [imagesToShow, setImagesToShow] = useState(window.innerWidth < 440 ? 3 : 4);

  useEffect(() => {
    const handleResize = () => {
      setImagesToShow(window.innerWidth < 440 ? 3 : 4); // Adjust images per row based on screen width
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Filter out the current image from the other images
  const filteredOtherImages = Array.isArray(otherImages)
    ? otherImages.filter((img) => img.svg_image_file !== currentImage)
    : [];

  // Only show images that fit in a single row
  const imagesToDisplay = filteredOtherImages.slice(0, imagesToShow);

  // Handle "See More" click to show more images (if needed)
  const handleSeeMoreClick = () => {
    setVisibleImagesCount(visibleImagesCount + imagesToShow);
  };

  return (
    <div>
      <div className="other-images-container">
        {imagesToDisplay.map((img, index) => (
          <div
            key={index}
            className="other-image-container"
            onClick={() => onImageClick(img)}
          >
            <img
              src={img.svg_image_file}
              alt={`SVG Preview ${index}`}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
        ))}
      </div>

      {/* "See More" link */}
      {filteredOtherImages.length > imagesToShow && (
        <div className="see-more-container">
          <a href="#!" onClick={handleSeeMoreClick} className="see-more-link">
            See More
          </a>
        </div>
      )}
    </div>
  );
};

export default OtherImages;
