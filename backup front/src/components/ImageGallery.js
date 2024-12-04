import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import ImageCard from './ImageCard';

const ImageGallery = ({ bgColor, searchInput, setSearchInput }) => {
  const [images, setImages] = useState([]);
  const [selectedCategory] = useState('all');
  const noImageFoundUrl = "http://localhost/headlesswp/the2px/wp-content/uploads/2024/10/image-not-found-1.svg";

  useEffect(() => {
    // Preload the "no images found" image
    const preloadImage = new Image();
    preloadImage.src = noImageFoundUrl;

    const fetchImages = async () => {
      try {
        let allImages = [];
        let page = 1;
        let totalPages;

        do {
          const response = await fetch(`http://localhost/headlesswp/the2px/wp-json/wp/v2/svg_images?per_page=100&page=${page}`);
          if (!response.ok) {
            throw new Error(`Error fetching images: ${response.statusText}`);
          }

          const data = await response.json();
          allImages = allImages.concat(data);
          totalPages = response.headers.get('X-WP-TotalPages');
          page++;
        } while (page <= totalPages);

        const otherImages = allImages.map(image => {
          const fileUrl = image.svg_image_file || '';
          return {
            ...image,
            file: fileUrl.startsWith('http') ? fileUrl : `http://localhost/headlesswp/the2px/${fileUrl}`,
            tags: image.svg_image_tags ? image.svg_image_tags.split(',') : [],
          };
        });

        setImages(otherImages);
      } catch (error) {
        console.error('Error fetching images:', error);
      }
    };

    fetchImages();
  }, []);

  const filteredImages = images.filter(image => {
    const searchValue = searchInput.toLowerCase();
    const tags = image.tags ? image.tags.join(' ') : '';
    const categories = Array.isArray(image.svg_file_categorie)
      ? image.svg_file_categorie.map(cat => cat.toLowerCase())
      : [];

    // Category filter based on the selected category
    const categoryMatches = selectedCategory === 'all' || categories.includes(selectedCategory);

    return (
      categoryMatches && // Ensure the image matches the selected category
      (tags.toLowerCase().includes(searchValue) ||
      categories.some(category => category.includes(searchValue)) ||
      (image.title.rendered && image.title.rendered.toLowerCase().includes(searchValue)))
    );
  });

  
  // Function to handle tag received from modal and trigger download of the first image
  const handleTagFromModal = (tagName) => {
    setSearchInput(tagName); // Set the search input to the tag name
  };


  return (
    <div className="image-gallery container">
      <div className="row">
        {filteredImages.length > 0 ? (
          filteredImages.map((image) => (
            <div className="col-4 mb-4" key={image.id}>
              <ImageCard
                title={image.title.rendered}
                description={image.description}
                svgUrl={image.file}
                tags={image.tags}
                backgroundColor={bgColor}
                otherImages={images}
                ids={image.id}
                categories={image.svg_file_categorie} // Add this line to pass categories
                onTagClick={handleTagFromModal} // Pass the callback to ImageCard.
              />
            </div>
          ))
        ) : (
          searchInput && (
            <div className="col-12 d-flex flex-column align-items-center justify-content-center" style={{ height: '60vh' }}>
              <img
                src={noImageFoundUrl}
                alt="No images found logo"
                style={{ width: '50%', marginBottom: '15px' }}
              />
              <h5>It seems we can’t find what you’re looking for.</h5>
            </div>
          )
        )}
      </div>
    </div>
  );
};

ImageGallery.propTypes = {
  bgColor: PropTypes.string,
  searchInput: PropTypes.string.isRequired,
  setSearchInput: PropTypes.func.isRequired, // New prop for setting search input
};

export default ImageGallery;
