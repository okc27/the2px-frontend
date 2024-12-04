import React, { useEffect, useState } from 'react'; 
import PropTypes from 'prop-types';
import { Modal} from 'react-bootstrap';
import ColorPicker from './ColorPicker';
import './ImageModal.css';
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

const ImageModal = ({ show, handleClose, image, title, tags, otherImages, onTagClick, currentCategories, onImageClick }) => {
  const [colors, setColors] = useState([]);
  const [currentColorIndex, setCurrentColorIndex] = useState(null);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [svgContent, setSvgContent] = useState(image);
  const [temporarySvgContent, setTemporarySvgContent] = useState(image);
  const [resolution, setResolution] = useState('original');
  const [modalTitle, setModalTitle] = useState(title); // State for the modal title
  const [currentTags, setCurrentTags] = useState(tags);
  const [currentImage, setCurrentImage] = useState(null);
  const [showMoreColors, setShowMoreColors] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('svg');
  const [isDownloading, setIsDownloading] = useState(false);
  
  const handleImageClick = (img) => {
    // Update the currentImage state when an image is clicked
    setCurrentImage(img.svg_image_file);
  
    // Your existing logic for fetching SVG content
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
    return Array.from(foundColors);
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

  const downloadSvg = () => {
    const websiteComment = `<!-- Downloaded from the2px.com -->\n`;
  
    // Check if svgContent starts with an XML declaration
    const xmlDeclarationMatch = svgContent.match(/^<\?xml.*?\?>\s*/);
    let updatedSvgContent;
  
    if (xmlDeclarationMatch) {
      // If XML declaration is found, insert the comment after the declaration
      const xmlDeclaration = xmlDeclarationMatch[0];
      updatedSvgContent = xmlDeclaration + websiteComment + svgContent.slice(xmlDeclaration.length);
    } else {
      // If no XML declaration, prepend the comment directly to the content
      updatedSvgContent = websiteComment + svgContent;
    }
  
    // Create a blob from the updated SVG content
    const svgBlob = new Blob([updatedSvgContent], { type: 'image/svg+xml;charset=utf-8' });
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

        // Fill background with selected color
        ctx.fillStyle = backgroundColor;
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
      updateColor(currentColorIndex, newColor.hex);
    }
  };

  const handleBgColorChange = (newColor) => {
    setBackgroundColor(newColor.hex);
  };

  const handleResolutionChange = (resolution) => {
    setResolution(resolution);
  };
  
  const handleColorCircleClick = (index, event) => {
    setCurrentColorIndex(index);
    setShowColorPicker(true);
  };

  const handleBgColorClick = (event) => {
    setShowBgColorPicker(true);
  };

  const renderTags = () => {
    if (!currentTags || !Array.isArray(currentTags)) return null; // Return null if no tags or not an array
  
    return currentTags.map((tag, index) => (
      <li key={index} className="tag">
        <a 
          href={`#${tag.trim()}`} // Create a link for the tag, assuming the link points to an anchor or search filter
          onClick={(e) => {
            e.preventDefault(); // Prevent default anchor behavior
            onTagClick(tag.trim()); // Trigger onTagClick with the clicked tag
          }} 
          className="tag-link"
        >
          {tag.trim()} {/* Display the tag name */}
        </a>
      </li>
    ));
  };
  

  const renderColorPickers = () => {
    const visibleColors = showMoreColors ? colors : colors.slice(0, 3); // Show 3 colors initially
  
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
              <div className="color-picker-wrapper" style={{ position: 'absolute', transform: 'translateX(-50%)', zIndex: 1 }}>
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
        {colors.length > 3 && (
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
          width: '100px',
          backgroundImage:
            'linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc)',
          backgroundSize: '10px 10px', // Reduced grid size
          backgroundPosition: '0 0, 5px 5px', // Adjusted position to match smaller grid
        }}
      ></div>
    );
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
      <div 
        className="bg-color-circle" 
        style={{ backgroundColor }} 
        onClick={handleBgColorClick} 
      >
        {selectedFormat !== 'jpeg' && renderTransparentGrid()}
      </div>

      {/* Background color picker logic */}
      {selectedFormat === 'jpeg' ? (
        <div className="color-picker-wrapper" style={{ position: 'absolute', marginTop: '40px', transform: 'translateX(-50%)', zIndex: 1 }}>
          {showBgColorPicker && (
            <ColorPicker
              color={backgroundColor}
              onChange={handleBgColorChange}
              onClose={() => {
                setShowBgColorPicker(false);
              }}
            />
          )}
        </div>
      ) : null} {/* Disable color picker for non-JPEG formats */}
                {/* Separator */}
                <div className="separator"></div>
                
                {/* SVG color picker */}
                <div className="colors">
                {renderColorPickers()} {/* Render initial color pickers */}
                

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
              <li>
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
            </ul>

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
              <ul className="tags-container">
                {renderTags()} {/* Render the tags here */}
              </ul>
            </div>

            <div className="or-spacer">
            </div>

            <div className="other-images-footer">
      <h3>Other SVG Images</h3>
      <OtherImages
        otherImages={otherImages}
        currentImage={currentImage}
        onImageClick={handleImageClick}   
      />
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