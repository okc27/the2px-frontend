import React, { useEffect, useState } from 'react'; 
import PropTypes from 'prop-types';
import { Modal} from 'react-bootstrap';
import ColorPicker from './ColorPicker';
import ColorPickerb from './ColorPickerb';
import './ImageModal.css';


const throttle = (func, limit) => {
  let lastFunc;
  let lastRan;


  return (...args) => {
    if (!lastRan) {
      func(...args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if ((Date.now() - lastRan) >= limit) {
          func(...args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
};

const ImageModal = ({ show, handleClose, image, title, tags, otherImages, onTagClick }) => {
  const [colors, setColors] = useState([]);
  const [currentColorIndex, setCurrentColorIndex] = useState(null);
  const [backgroundColor, setBackgroundColor] = useState('transparent');  // Default to transparent
  const [svgimages, setImage] = useState(image); 
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [svgContent, setSvgContent] = useState(image);
  const [temporarySvgContent, setTemporarySvgContent] = useState(svgimages);
  const [resolution, setResolution] = useState('original');
  const [modalTitle, setModalTitle] = useState(title);
  const [currentTags, setCurrentTags] = useState(tags);
  const [showMoreColors, setShowMoreColors] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('svg');
  const [isDownloading, setIsDownloading] = useState(false);
  const [rotated, setRotated] = useState(false);
  const [imageChanged, setImageChanged] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);
  const [visibleCount, setVisibleCount] = useState(7);
  const [customHeight, setCustomHeight] = useState('');
  const [customWidth, setCustomWidth] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(2);
  const [showCustomInputs, setShowCustomInputs] = useState(false);
  const [svgUrl, setSvgUrl] = useState('');
  const [imageTitle, setImageTitle] = useState(title); 
 


  const filteredOtherImages = Array.isArray(otherImages)
  ? otherImages.filter((img) => img.svg_image_file !== image)
  : [];

// Function to handle left click
const handleLeftClick = () => {
  const nextIndex =
    currentIndex > 0 ? currentIndex - 1 : filteredOtherImages.length - 1;
  updateModalContent(nextIndex, image);  
};

// Function to handle right click
const handleRightClick = () => {
  const nextIndex =
    currentIndex < filteredOtherImages.length - 1 ? currentIndex + 1 : 0;
  updateModalContent(nextIndex , image);
};

const updateModalContent = async (index , image) => {
  
  const nextImage = filteredOtherImages[index];
  setCurrentIndex(index);

  // Update modal title and other states
  setModalTitle(
    `${nextImage.svg_file_categorie?.slice(0, 2).join(' / ') || 'All'} / ${
      nextImage.svg_image_name
    }`
  );
  setImageTitle(nextImage.svg_image_name);
  setCurrentTags(nextImage.tags);
  setSvgUrl(nextImage.svg_image_file); // Update the SVG URL directly

  // Fetch SVG content when svgUrl changes (directly in the function)
  if (nextImage.svg_image_file) {
    try {
      const response = await fetch(nextImage.svg_image_file);
      if (!response.ok) {
        throw new Error(`Failed to fetch SVG: ${response.statusText}`);
      }
      const content = await response.text();
      setTemporarySvgContent(content);
      setSvgContent(content);
      setImage(content);
      const extractedColors = extractColors(content);
      setColors(extractedColors);
    } catch (error) {
      console.error('Error fetching SVG:', error.message);
    }
  }
};

// Initial state setup for modal when component mounts or changes
useEffect(() => {
  if (image) {
    setSvgContent(image);
    setTemporarySvgContent(image);
    setImage(image);
  }
  if (title) {
    setModalTitle(title);
  }
  if (tags) {
    setCurrentTags(tags);
  }
  if (show) {
    const extractedColors = extractColors(image);
    setColors(extractedColors);
    setSvgContent(image);
    setTemporarySvgContent(image);
  }
}, [show, image, title, tags]);

const handleResolutionChange = (newResolution) => {
  setResolution(newResolution);
  setShowCustomInputs(false); // Hide custom inputs when another resolution is selected
};


  useEffect(() => {
    const preloadImages = () => {
      const images = [
        "https://the2px.com/wp-content/uploads/2024/10/download-svgrepo-com.svg",
        "https://the2px.com/wp-content/uploads/2024/10/save-1.svg",
      ];
      images.forEach((src) => {
        const img = new Image();
        img.src = src;
      });
    };

    preloadImages();
  }, []);
  
 
  
  const extractColors = (svgString) => {
    const colorRegex = /#([0-9A-Fa-f]{3,6})\b/g;
    const foundColors = new Set(svgString.match(colorRegex));
  
    // Convert hex to luminance for sorting
    const hexToLuminance = (hex) => {
      // Expand shorthand hex (e.g., #abc) to full (e.g., #aabbcc)
      if (hex.length === 4) {
        hex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
      }
      // Convert hex to RGB
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;
  
      // Calculate relative luminance (formula from WCAG)
      const lum = (c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
      return 0.2126 * lum(r) + 0.7152 * lum(g) + 0.0722 * lum(b);
    };
  
    // Convert Set to Array, then sort by luminance
    return Array.from(foundColors).sort((a, b) => hexToLuminance(a) - hexToLuminance(b));
  };
  
  const updateColor = throttle((index, newColor) => {
    const updatedColors = [...colors];
    updatedColors[index] = newColor;
    setColors(updatedColors);

    const oldColor = colors[index];
    const updatedSvg = temporarySvgContent.replace(new RegExp(oldColor, 'g'), newColor);
    setTemporarySvgContent(updatedSvg);
  }, 50);

  const applyChangesToOriginal = () => {
    setSvgContent(temporarySvgContent);
  };

  
  // Format date as YYYYMMDD without dashes
  const getFormattedDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  };

  // Get download file name in the required format
  const getDownloadFileName = (format) => {
    const date = getFormattedDate();
    return `the2px-${imageTitle}-${date}.${format}`;
  };

  const scaleSvg = (svgContent, resolution, customWidth = null, customHeight = null) => {
    const svgDoc = new DOMParser().parseFromString(svgContent, 'image/svg+xml');
    const svgElement = svgDoc.querySelector('svg');
  
    if (svgElement) {
      if (resolution === 'custom' && customWidth && customHeight) {
        // Set custom resolution provided by user
        svgElement.setAttribute('width', customWidth);
        svgElement.setAttribute('height', customHeight);
      } else if (resolution === '500') {
        svgElement.setAttribute('width', '500');
        svgElement.setAttribute('height', '500');
      } else if (resolution === '1000') {
        svgElement.setAttribute('width', '1000');
        svgElement.setAttribute('height', '1000');
      } else if (resolution === '2000') {
        svgElement.setAttribute('width', '2000');
        svgElement.setAttribute('height', '2000');
      } else if (resolution === 'original') {
        svgElement.removeAttribute('width');
        svgElement.removeAttribute('height');
      }
    }
  
    return new XMLSerializer().serializeToString(svgDoc);
  };
  
  const handleDownload = () => {
    try {
      if (selectedFormat === 'svg') {
        downloadSvg();
      } else if (selectedFormat === 'png') {
        convertSvgToPng();
      } else if (selectedFormat === 'jpeg') {
        convertSvgToJpeg();
      }
      setIsDownloading(true);
  
      // Timeout to revert download state
      const timer = setTimeout(() => {
        setIsDownloading(false);
      }, 2000);
  
      // Cleanup timer if needed
      return () => clearTimeout(timer);
    } catch (error) {
      console.error("Download error:", error);
      setIsDownloading(false); // Reset state in case of failure
    }
  };
  
  const downloadSvg = () => {
    const websiteComment = '<!-- Downloaded from the2px.com -->\n';
  
    // If custom resolution is set, pass customWidth and customHeight to scaleSvg
    const updatedSvgContent = scaleSvg(svgContent, resolution, customWidth, customHeight);
  
    // Check if updatedSvgContent starts with an XML declaration
    const xmlDeclarationMatch = updatedSvgContent.match(/^<\?xml.*?\?>\s*/);
    let finalSvgContent;
  
    if (xmlDeclarationMatch) {
      const xmlDeclaration = xmlDeclarationMatch[0];
      finalSvgContent = xmlDeclaration + websiteComment + updatedSvgContent.slice(xmlDeclaration.length);
    } else {
      finalSvgContent = websiteComment + updatedSvgContent;
    }
  
    const svgBlob = new Blob([finalSvgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
  
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', getDownloadFileName('svg')); // Ensure this function returns the appropriate name
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  
    URL.revokeObjectURL(url);
  };
  
  const convertSvgToPng = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
  
    const img = new Image();
    img.onload = () => {
      let width, height;
  
      if (resolution === 'original') {
        const svgElement = new DOMParser().parseFromString(svgContent, "image/svg+xml").documentElement;
        width = svgElement.getAttribute('width') ? parseInt(svgElement.getAttribute('width'), 10) : 500; // Default width
        height = svgElement.getAttribute('height') ? parseInt(svgElement.getAttribute('height'), 10) : 500; // Default height
      } else if (resolution === 'custom' && customWidth && customHeight) {
        width = customWidth;
        height = customHeight;
      } else {
        const size = parseInt(resolution, 10);
        width = height = size; // For fixed resolutions, width and height will be the same
      }
  
      // Set canvas width and height
      canvas.width = width;
      canvas.height = height;
  
      // Add background color if one is selected
      if (backgroundColor !== 'transparent' && selectedFormat === 'png') {
        ctx.fillStyle = backgroundColor; // Use the selected background color
        ctx.fillRect(0, 0, width, height); // Fill the entire canvas with the background color
      }
  
      // Calculate aspect ratio
      const aspectRatio = img.width / img.height;
  
      // Adjusting the drawImage parameters to keep aspect ratio
      if (aspectRatio > 1) {
        ctx.drawImage(img, 0, (height - (width / aspectRatio)) / 2, width, width / aspectRatio);
      } else {
        ctx.drawImage(img, (width - (height * aspectRatio)) / 2, 0, height * aspectRatio, height);
      }
  
      const pngUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = pngUrl;
      a.download = getDownloadFileName('png');
      a.click();
    };
  
    img.onerror = () => {
      console.error("Image failed to load for PNG conversion.");
    };
  
    img.src = `data:image/svg+xml;base64,${btoa(svgContent)}`;
  };
  
  const convertSvgToJpeg = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
  
    const img = new Image();
    img.onload = () => {
      let width, height;
  
      if (resolution === 'original') {
        const svgElement = new DOMParser().parseFromString(svgContent, "image/svg+xml").documentElement;
        width = svgElement.getAttribute('width') ? parseInt(svgElement.getAttribute('width'), 10) : 500; // Default width
        height = svgElement.getAttribute('height') ? parseInt(svgElement.getAttribute('height'), 10) : 500; // Default height
      } else if (resolution === 'custom' && customWidth && customHeight) {
        width = customWidth;
        height = customHeight;
      } else {
        const size = parseInt(resolution, 10);
        width = height = size; // For fixed resolutions, width and height will be the same
      }
  
      // Set canvas width and height
      canvas.width = width;
      canvas.height = height;
  
      // If background color is transparent, use white instead
      const effectiveBackgroundColor = backgroundColor === 'transparent' ? 'white' : backgroundColor;
  
      // Fill background with selected or white color if transparent
      ctx.fillStyle = effectiveBackgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
  
      // Calculate aspect ratio
      const aspectRatio = img.width / img.height;
  
      // Adjusting the drawImage parameters to keep aspect ratio
      if (aspectRatio > 1) {
        ctx.drawImage(img, 0, (height - (width / aspectRatio)) / 2, width, width / aspectRatio);
      } else {
        ctx.drawImage(img, (width - (height * aspectRatio)) / 2, 0, height * aspectRatio, height);
      }
  
      const jpegUrl = canvas.toDataURL('image/jpeg', 1.0);
      const a = document.createElement('a');
      a.href = jpegUrl;
      a.download = getDownloadFileName('jpeg');
      a.click();
    };
  
    img.onerror = () => {
      console.error("Image failed to load for JPEG conversion.");
    };
  
    img.src = `data:image/svg+xml;base64,${btoa(svgContent)}`;
  };

  const handleColorChange = (newColor) => {
    if (currentColorIndex !== null) {
      // Update the color
      updateColor(currentColorIndex, newColor.hex);
  
      // Mark that the image has changed
      setImageChanged(true);
    }
  };

  
  const handleBgColorChange = (color) => {
    setBackgroundColor(color.hex || color);  // Set the selected color (from the color picker)
    setImageChanged(true); // Mark that the image has changed
  };




  
  const handleColorCircleClick = (index, event) => {
    setCurrentColorIndex(index);
    setShowColorPicker(true);
  };

  const handleBgColorClick = (event) => {
    setShowBgColorPicker(true);
  };

  
  const [maxTags, setMaxTags] = useState(4); // Default maximum tags to display

  // Function to update the maximum number of tags based on screen size
  const updateMaxTags = () => {
    const screenWidth = window.innerWidth;
    if (screenWidth <= 500) {
      setMaxTags(3);
    } else if (screenWidth <= 1000) {
      setMaxTags(4);
    } else if (screenWidth <= 1200) {
      setMaxTags(5);
    } else {
      setMaxTags(7); // Default for larger screens
    }
  };

  // Set up a resize listener to dynamically adjust maxTags
  useEffect(() => {
    updateMaxTags(); // Call initially to set the correct maxTags
    window.addEventListener('resize', updateMaxTags); // Add listener for screen resizing

    return () => {
      window.removeEventListener('resize', updateMaxTags); // Clean up listener
    };
  }, []);

// Render tags dynamically based on currentTags and maxTags
const renderTags = () => {
  if (!currentTags || !Array.isArray(currentTags)) return null;

  // Sort tags alphabetically
  const sortedTags = currentTags.slice().sort((a, b) => a.trim().localeCompare(b.trim()));

  const tagsToDisplay = showAllTags ? sortedTags : sortedTags.slice(0, maxTags);

  return (
    <>
      {tagsToDisplay.map((tag, index) => (
        <li key={index} className="tag">
          <a
            href={`#${tag.trim()}`}
            onClick={(e) => {
              e.preventDefault();
              onTagClick(tag.trim());
            }}
            className="tag-link"
          >
            {tag.trim()}
          </a>
        </li>
      ))}
      {sortedTags.length > maxTags && !showAllTags && (
        <li className="see-more">
          <a 
            href="#tags-section" 
            onClick={(e) => {
              e.preventDefault(); // Prevent the default navigation
              setShowAllTags(true);
            }} 
            className="see-more-btn"
          >
            See More
          </a>
        </li>
      )}
      {showAllTags && sortedTags.length > maxTags && (
        <li className="see-more">
          <a 
            href="#tags-section" 
            onClick={(e) => {
              e.preventDefault(); // Prevent the default navigation
              setShowAllTags(false);
            }}  
            className="see-more-btn"
          >
            See Less
          </a>
        </li>
      )}
    </>
  );
};


  // Update visibleCount based on screen size
  useEffect(() => {
    const updateVisibleCount = () => {
      if (window.innerWidth < 360) {
        setVisibleCount(2);
      } else if (window.innerWidth < 500) {
        setVisibleCount(3);
      } else if (window.innerWidth < 786) {
        setVisibleCount(4);
      } else if (window.innerWidth < 1200) {
        setVisibleCount(5);
      } else {
        setVisibleCount(7);
      }
    };

    updateVisibleCount(); // Run initially
    window.addEventListener('resize', updateVisibleCount); // Listen for resize events

    // Cleanup listener on component unmount
    return () => window.removeEventListener('resize', updateVisibleCount);
  }, []);

  const renderColorPickers = () => {
    const visibleColors = showMoreColors ? colors : colors.slice(0, visibleCount);

    return (
      <div className="colors">
        {visibleColors.map((color, index) => (
          <div
            key={index}
            className="color-circle-wrapper"
            style={{ position: 'relative' }}
          >
            <div
              className="color-circle"
              style={{ backgroundColor: color }}
              onClick={(event) => handleColorCircleClick(index, event)}
            />
            {/* Conditionally render ColorPicker next to the clicked color circle */}
            {showColorPicker && currentColorIndex === index && (
              <div
                className="color-picker-wrapper"
                style={{ position: 'absolute', transform: 'translateX(-50%)', zIndex: 1 }}
              >
                <ColorPicker
                  color={colors[currentColorIndex]}
                  onChange={handleColorChange}
                  onClose={() => {
                    applyChangesToOriginal();
                    setShowColorPicker(false);
                    setCurrentColorIndex(null);
                  }}
                />
              </div>
            )}
          </div>
        ))}
        {/* Show More/Less Button */}
        {colors.length > visibleCount && (
          <button
            className="edit-more-colors"
            onClick={() => setShowMoreColors(!showMoreColors)}
            style={{
              background: 'none',
              border: 'none',
              color: 'blue',
              textDecoration: 'underline',
              cursor: 'pointer',
              marginTop: '7px', // Add some margin for better spacing
            }}
          >
            {showMoreColors ? 'Show Less' : 'Edit More Colors'}
          </button>
        )}
      </div>
    );
  };
  
  const renderTransparentGrid = () => {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: 'white', // Set the background color to black
          backgroundImage:
            'linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc)',
          backgroundSize: '10px 10px', // Adjust grid size as needed
          backgroundPosition: '0 0, 5px 5px', // Position the grid properly
        }}
      >   
      </div>
    );
  };
  
  const resetChanges = () => { 
    try {
        // Step 1: Extract original colors from the SVG
        const initialColors = extractColors(svgimages); 
        setColors(initialColors);

        // Step 2: Reset SVG content to the original image
        setTemporarySvgContent(svgimages); // Temporary SVG reset
        setSvgContent(svgimages);          // Main SVG reset

        // Step 3: Reset background color to transparent
        setBackgroundColor('transparent');

        // Step 4: Clear the selected color index
        setCurrentColorIndex(null);

        // Step 5: Trigger rotation animation
        setRotated(true);

        // Animation logic with tick display
        setTimeout(() => {
            setRotated(false);        // Stop rotation animation
            setImageChanged(true);    // Show tick mark

            setTimeout(() => {
                setImageChanged(false); // Hide tick mark after 0.5s
            }, 500);
        }, 600); // Duration for rotation animation

        // Debugging logs
    } catch (error) {
        console.error('Error during resetChanges:', error);
    }
};

  return (

      <Modal show={show} onHide={handleClose} size="xl" centered>
      <div className="modal-content1">
{/* Left Button */}
<button className="modal-nav-button left" onClick={() => { handleLeftClick()}}>
<img
  className="arrow-icon left"
  src="http://localhost/headlesswp/the2px/wp-content/uploads/2024/12/right-arrow-next-svgrepo-com.svg"
  alt="Left Arrow"
/>

</button>

{/* Right Button */}
<button className="modal-nav-button right" onClick={() => { handleRightClick()}}>
  <img className="arrow-icon right" src="http://localhost/headlesswp/the2px/wp-content/uploads/2024/12/right-arrow-next-svgrepo-com.svg" alt="Right Arrow" />
</button>


        <Modal.Header closeButton>
          <Modal.Title>
            {modalTitle &&
              modalTitle
                .toLowerCase()
                .split(' ')
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="image-modal-container">
            <div className="image-preview-container" style={{ width: '75%', height: '75%', marginRight: '3%' }}>
              <div
                className="image-preview"
                style={{ height: 'auto', overflow: 'hidden', backgroundColor, borderRadius: '15px' }}
                dangerouslySetInnerHTML={{ __html: temporarySvgContent }}
              />
            </div>
            <div className="or-spacer">
            </div>
              <div className="content-section">
                <h3> Color's </h3>
                <div className='bg-col'>
                <div className="color-picker-row">
                <div className="bg-color-circle" 
                    style={{ 
                      backgroundColor: selectedFormat !== 'jpeg' && backgroundColor === 'transparent' ? 'none' : backgroundColor 
                    }} 
                    onClick={handleBgColorClick} 
                  >
                    {/* Render transparent grid only when backgroundColor is 'transparent' */}
                    {selectedFormat !== 'jpeg' && backgroundColor === 'transparent' && renderTransparentGrid()}
                  </div>

                  {/* Background color picker logic */}
                  <div className="color-picker-wrapper" style={{ position: 'absolute', marginTop: '40px', transform: 'translateX(-50%)', zIndex: 1 }}>
                    {showBgColorPicker && (
                      <ColorPickerb
                        color={backgroundColor === 'transparent' ? '#ffffff' : backgroundColor}
                        onChange={handleBgColorChange}
                        onClose={() => setShowBgColorPicker(false)}
                      />
                    )}
                  </div>

                  {/* Separator */}
                  <div className="separator"></div>
                  
                  {/* SVG color picker */}
                  <div className="colors">
                  {renderColorPickers()} {/* Render initial color pickers */}

                </div>
                <div className="reset-div" style={{ display: imageChanged ? 'block' : 'none' }}>
                <button className="reset-btn" onClick={() => {resetChanges()}}>
                  
                      <img 
                        src="https://the2px.com/wp-content/uploads/2024/11/reset-svgrepo-com.svg" 
                        alt="Reset Arrow"
                        style={{ width: '20px', height: '20px' }}
                        className={rotated ? 'rotate-img' : ''}
                      />
                    </button>
                  </div>

                </div>        
                </div>
              </div>
    
              <div className="or-spacer">
              </div>
              <div className='main-con'>
              <div className="selection-container">
              <div className="res-sec">
              <h3 style={{ paddingLeft: '5%' }}>
                  <span>Format</span>
                  </h3>
                  <div className="b-35">
                    <ul className='b-35l'>
                    <li>
                      <a 
                        href="#svg" 
                        className={`button-35 ${selectedFormat === 'svg' ? 'active' : ''}`} 
                        onClick={(e) => {
                          e.preventDefault();
                          setSelectedFormat('svg');
                        }}
                      >
                        SVG
                      </a>
                    </li>
                    <li>
                      <a 
                        href="#png" 
                        className={`button-35 ${selectedFormat === 'png' ? 'active' : ''}`} 
                        onClick={(e) => {
                          e.preventDefault();
                          setSelectedFormat('png');
                        }}
                      >
                        PNG
                      </a>
                    </li>
                    <li>
                      <a 
                        href="#jpeg" 
                        className={`button-35 ${selectedFormat === 'jpeg' ? 'active' : ''}`} 
                        onClick={(e) => {
                          e.preventDefault();
                          setSelectedFormat('jpeg');
                        }}
                      >
                        JPEG
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="format-selection">
                <h3 style={{ paddingLeft: '5%' }}>
                  <span>Resolution</span>
                </h3>
                <div className="b-35">
                  <ul className="b-352">
                    <li>
                      <a
                        href="#1000"
                        className={`button-35 ${resolution === '1000' ? 'active' : ''}`}
                        onClick={(e) => {
                          e.preventDefault();
                          handleResolutionChange('1000');
                        }}
                      >
                        1000 x 1000
                      </a>
                    </li>
                    <li>
                      <a
                        href="#original"
                        className={`button-35 ${resolution === 'original' ? 'active' : ''}`}
                        onClick={(e) => {
                          e.preventDefault();
                          handleResolutionChange('original');
                        }}
                      >
                        1920 x 1356
                      </a>
                    </li>
                    <li id="lst-r">
                      <a
                        href="#2000"
                        className={`button-35 ${resolution === '2000' ? 'active' : ''}`}
                        onClick={(e) => {
                          e.preventDefault();
                          handleResolutionChange('2000');
                        }}
                      >
                        2000 x 2000
                      </a>
                    </li>
                    <li>
                      <a
                        href="#custom"
                        className={`button-35 ${resolution.includes('x') ? 'active' : ''}`}
                        onClick={(e) => {
                          e.preventDefault();
                          setCustomWidth(''); // Clear previous inputs
                          setCustomHeight('');
                          setResolution('custom');
                        }}
                        style={resolution === 'custom' ? { border: '1px solid #c1272d' } : {}}
                      >
                        Custom
                      </a>
                    </li>
                  </ul>

                  {resolution === 'custom' && (
                    <div
                      className="res-change"
                      style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                    >
                      <input
                        type="number"
                        placeholder="Width"
                        value={customWidth}
                        onChange={(e) => setCustomWidth(e.target.value)}
                        style={{
                          padding: '5px',
                          width: '80px',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                        }}
                      />
                      <span style={{ fontSize: '1rem' }}>x</span>
                      <input
                        type="number"
                        placeholder="Height"
                        value={customHeight}
                        onChange={(e) => setCustomHeight(e.target.value)}
                        style={{
                          padding: '5px',
                          width: '80px',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                        }}
                      />
                    </div>
                  )}
                </div>
                <div className="download-section">
                  <button className="button-29" onClick={handleDownload}>
                    Download
                    <img
                      src={
                        isDownloading
                          ? 'https://the2px.com/wp-content/uploads/2024/10/save-1.svg'
                          : 'https://the2px.com/wp-content/uploads/2024/10/download-svgrepo-com.svg'
                      }
                      alt={isDownloading ? 'Save Icon' : 'Download Icon'}
                      style={{
                        marginLeft: '10px',
                        height: '20px',
                        width: '20px',
                        filter: 'invert(100%)',
                      }}
                    />
                  </button>
                </div>
              </div>
              </div>
              <div className="separator2">
              </div>
              <div className="or-spacer" style={{
                  display:'none',
                }}>
              </div>
              <div className='tag-sec'>
                <h3>Tags</h3>
                <div className='tags'>
                  <ul className="tags-container">
                    {renderTags()} {/* Render the tags here */}
                  </ul>
                </div>
              </div>
            </div>

            </div>
            
          </Modal.Body>
          </div>
        </Modal>
      

  );
}

ImageModal.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  image: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  tags: PropTypes.arrayOf(PropTypes.string),
  otherImages: PropTypes.arrayOf(PropTypes.shape({
    svg_image_file: PropTypes.string.isRequired
  })),
};

export default ImageModal;