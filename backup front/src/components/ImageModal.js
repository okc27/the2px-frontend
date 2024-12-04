import React, { useEffect, useState } from 'react'; 
import PropTypes from 'prop-types';
import { Modal} from 'react-bootstrap';
import ColorPicker from './ColorPicker';
import ColorPickerb from './ColorPickerb';
import './ImageModal.css';
import './OtherImages.css';
import OtherImages from './OtherImages';


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

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [svgContent, setSvgContent] = useState(image);
  const [temporarySvgContent, setTemporarySvgContent] = useState(image);
  const [resolution, setResolution] = useState('original');
  const [modalTitle, setModalTitle] = useState(title); // State for the modal title
  const [currentTags, setCurrentTags] = useState(tags);
  const [showMoreColors, setShowMoreColors] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('svg');
  const [isDownloading, setIsDownloading] = useState(false);
  const [rotated, setRotated] = useState(false);
  const [imageChanged, setImageChanged] = useState(false); // Track image change
  const [showAllTags, setShowAllTags] = useState(false); // State to track whether to show all tags or not
  const [visibleCount, setVisibleCount] = useState(7); // Default to 7 colors
  const [customHeight, setCustomHeight] = useState(''); // Custom height input
  const [customWidth, setCustomWidth] = useState(''); // Custom width input
  


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
    return `the2px-${title}-${date}.${format}`;
  };

  const scaleSvg = (svgContent, resolution) => {
    const svgDoc = new DOMParser().parseFromString(svgContent, 'image/svg+xml');
    const svgElement = svgDoc.querySelector('svg');
  
    if (svgElement) {
      // Set the width and height attributes based on the resolution
      if (resolution === '500') {
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
  
  const downloadSvg = () => {
    const websiteComment = '<!-- Downloaded from the2px.com -->\n';
  
    // Scale SVG content based on the selected resolution
    const updatedSvgContent = scaleSvg(svgContent, resolution);
  
    // Check if updatedSvgContent starts with an XML declaration
    const xmlDeclarationMatch = updatedSvgContent.match(/^<\?xml.*?\?>\s*/);
    let finalSvgContent;
  
    if (xmlDeclarationMatch) {
      // If XML declaration is found, insert the comment after the declaration
      const xmlDeclaration = xmlDeclarationMatch[0];
      finalSvgContent = xmlDeclaration + websiteComment + updatedSvgContent.slice(xmlDeclaration.length);
    } else {
      // If no XML declaration, prepend the comment directly to the content
      finalSvgContent = websiteComment + updatedSvgContent;
    }
  
    // Create a blob from the updated SVG content
    const svgBlob = new Blob([finalSvgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
  
    // Create a download link and trigger the download
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', getDownloadFileName('svg')); // Assuming getDownloadFileName returns the appropriate name
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  
    // Revoke the object URL after download
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
        // Wider than tall
        ctx.drawImage(img, 0, (height - (width / aspectRatio)) / 2, width, width / aspectRatio);
      } else {
        // Taller than wide
        ctx.drawImage(img, (width - (height * aspectRatio)) / 2, 0, height * aspectRatio, height);
      }
  
      const pngUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = pngUrl;
      a.download = getDownloadFileName('png');
      a.click();
    };
  
    img.src = `data:image/svg+xml;base64,${btoa(temporarySvgContent)}`;
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
            // Wider than tall
            ctx.drawImage(img, 0, (height - (width / aspectRatio)) / 2, width, width / aspectRatio);
        } else {
            // Taller than wide
            ctx.drawImage(img, (width - (height * aspectRatio)) / 2, 0, height * aspectRatio, height);
        }

        const jpegUrl = canvas.toDataURL('image/jpeg', 1.0);
        const a = document.createElement('a');
        a.href = jpegUrl;
        a.download = getDownloadFileName('jpeg');
        a.click();
    };
    img.src = `data:image/svg+xml;base64,${btoa(temporarySvgContent)}`;
};


  useEffect(() => {
    if (show) {
      const extractedColors = extractColors(image);
      setColors(extractedColors);
      setSvgContent(image);
      setTemporarySvgContent(image);
    }
  }, [show, image]);

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




  const handleResolutionChange = (resolution) => {
    setResolution(resolution);
  };

  const handleCustomResolutionSubmit = () => {
    if (customHeight.trim() !== '' && customWidth.trim() !== '') {
      const customResolution = `${customWidth} x ${customHeight}`;
      setResolution(customResolution); // Set the custom resolution
    }
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
      setMaxTags(2);
    } else if (screenWidth <= 1000) {
      setMaxTags(2);
    } else if (screenWidth <= 1200) {
      setMaxTags(4);
    } else {
      setMaxTags(5); // Default for larger screens
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

    const tagsToDisplay = showAllTags ? currentTags : currentTags.slice(0, maxTags);

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
        {currentTags.length > maxTags && !showAllTags && (
          <li className="see-more">
            <a 
              href="#tags-section" 
              onClick={() => setShowAllTags(true)} 
              className="see-more-btn"
            >
              <img
                src="https://the2px.com/wp-content/uploads/2024/12/dropdown-svgrepo-com.svg"
                alt="See More"
                className="arrow-icon"
              />
              See More
            </a>
        </li>
      )}
      {showAllTags && currentTags.length > maxTags && (
        <li className="see-more">
          <a href="#tags-section" onClick={() => setShowAllTags(false)} className="see-more-btn">
            <img
              src="https://the2px.com/wp-content/uploads/2024/12/dropdown-svgrepo-com.svg"
              alt="See Less"
              className="arrow-icon inverted"
            />
            See Less
          </a>
        </li>
        )}
      </>
    );
  };

  const handleImageClick = (img) => {
    fetch(img.svg_image_file)
      .then((response) => response.text())
      .then((svgContent) => {
        setTemporarySvgContent(svgContent);
        setModalTitle(
          `${
            img.svg_file_categorie && Array.isArray(img.svg_file_categorie)
              ? img.svg_file_categorie.slice(0, 2).join(' / ')
              : 'All'
          } / ${img.title.rendered}`
        );
        setCurrentTags(img.tags || []);
        setColors(extractColors(svgContent));
      })
      .catch((error) => console.error('Error fetching SVG:', error));
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
    const initialColors = extractColors(image); // Re-extract original colors from the SVG
    setColors(initialColors);
    setTemporarySvgContent(image); // Reset temporary SVG content to the original
    setSvgContent(image); // Reset actual SVG content to the original
    setBackgroundColor('transparent'); // Reset background color to transparent
    setCurrentColorIndex(null); // Reset the selected color index
  
    setRotated(true); // Start rotation animation
  
    // After rotation ends, show the tick
    setTimeout(() => {
        setRotated(false); // Stop the rotation
        setImageChanged(true); // Change the arrow to a tick
  
        // Show the tick for 0.5 seconds
        setTimeout(() => {
            setImageChanged(false); // Hide the tick
        }, 400); // 0.5 seconds for tick display
    }, 600); // Matches the rotation animation duration
  };

  
  return (
    <Modal show={show} onHide={handleClose} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>{modalTitle}</Modal.Title> {/* Update title display */}
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
            <div className="content-section">
              <h3>Customize Color </h3>
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
                  <button className="reset-btn" onClick={resetChanges}>
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
              <h3 style={{ paddingLeft: '5%'}}>
                <span>Resolution</span>
              </h3>
              <div className='b-35'>
  <ul className="b-352">
    <li>
      <a
        href="#500"
        className={`button-35 ${resolution === '500' ? 'active' : ''}`}
        onClick={(e) => {
          e.preventDefault();
          handleResolutionChange('500');
        }}
      >
        500 x 500
      </a>
    </li>
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
    <li id='lst-r'>
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
    {/* Add manual height and width inputs */}
  </ul>
  <li>
      <div className='ok' style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
        <button
          className="button-35"
          onClick={(e) => {
            e.preventDefault();
            handleCustomResolutionSubmit();
          }}
          style={{
            padding: '5px 10px',
            background: '#007BFF',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Apply
        </button>
      </div>
    </li>
            </div>
            </div>
          </div>
            
            <div className="download-section">
            <button className="button-29" onClick={handleDownload}>
              Download
              <img
                src={isDownloading ? "https://the2px.com/wp-content/uploads/2024/10/save-1.svg" : "https://the2px.com/wp-content/uploads/2024/10/download-svgrepo-com.svg"}
                alt={isDownloading ? "Save Icon" : "Download Icon"}
                style={{
                  marginLeft: '10px',
                  height: '20px',
                  width: '20px',
                  filter: isDownloading ? 'invert(100%)' : 'invert(100%)' // This will ensure the first icon is also white
                }}
              />
            </button>

          </div>
            <div className="or-spacer">
            </div>

            <div className='tag-sec'>
              <h3>Tags:</h3>
              <div className='tags'>
                <ul className="tags-container">
                  {renderTags()} {/* Render the tags here */}
                </ul>
              </div>
            </div>
            <div className="or-spacer">
            </div>

            <div className="other-images-footer">
              <h3>Other SVG Images</h3>
              <div className="slider-container" style={{ display: 'flex', alignItems: 'center' }}>
                <OtherImages
                  otherImages={otherImages}
                  currentImage={image}
                  onImageClick={handleImageClick}
                />

                </div>
             </div>
          </div>
      </Modal.Body>
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