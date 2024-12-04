import React, { useEffect, useState } from 'react';
import './ImageCard.css';
import ImageModal from './ImageModal';

const ImageCard = ({ title, svgUrl, tags, backgroundColor, otherImages, ids, categories, onTagClick }) => {
  const [svgContent, setSvgContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [downloadsLeft, setDownloadsLeft] = useState(3); // Limit to 3 downloads per day

  // Check if the download limit has been reached
  const checkDownloadLimit = () => {
    const today = new Date().toISOString().slice(0, 10); // Get current date (yyyy-mm-dd)
    const lastDownloadDate = localStorage.getItem('lastDownloadDate');
    const downloadCount = parseInt(localStorage.getItem('downloadCount') || '0', 10);

    if (lastDownloadDate !== today) {
      // Reset the count if the date has changed
      localStorage.setItem('lastDownloadDate', today);
      localStorage.setItem('downloadCount', '0');
      setDownloadsLeft(3); // Reset to 3
    } else {
      setDownloadsLeft(3 - downloadCount);
    }
  };

  useEffect(() => {
    checkDownloadLimit();

    const fetchSvgContent = async () => {
      try {
        const response = await fetch(svgUrl);
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        let content = await response.text();
        setSvgContent(content);
        setHasError(false);
      } catch (error) {
        console.error('Error fetching SVG:', error.message);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSvgContent();
  }, [svgUrl, otherImages]);

  const getFileName = (extension) => {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    return `the2px-${title}-${date}.${extension}`;
  };

  const handleTagClick = (tagName) => {
    console.log('Clicked tag:', tagName);
    onTagClick(tagName); // Send the tag to ImageGallery
    handleCloseModal(); // Close the modal after clicking the tag
  };

  const handleDownload = (format) => {
    if (downloadsLeft <= 0) {
      alert("You have reached the download limit for today.");
      return;
    }

    // Decrease download count after successful download
    localStorage.setItem('downloadCount', (parseInt(localStorage.getItem('downloadCount') || '0', 10) + 1).toString());
    setDownloadsLeft(3 - parseInt(localStorage.getItem('downloadCount')));

    if (format === 'svg') downloadSvg();
    if (format === 'png') convertSvgToPng();
    if (format === 'jpeg') convertSvgToJpeg();
  };

  const downloadSvg = () => {
    const websiteComment = `<!-- Downloaded from the2px.com -->\n`;

    const xmlDeclarationMatch = svgContent.match(/^<\?xml.*?\?>\s*/);
    let updatedSvgContent;

    if (xmlDeclarationMatch) {
      const xmlDeclaration = xmlDeclarationMatch[0];
      updatedSvgContent = xmlDeclaration + websiteComment + svgContent.slice(xmlDeclaration.length);
    } else {
      updatedSvgContent = websiteComment + svgContent;
    }

    const svgBlob = new Blob([updatedSvgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', getFileName('svg'));
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const convertSvgToPng = () => {
    if (!svgContent) {
      console.error('No SVG content available for conversion.');
      return;
    }

    const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      canvas.toBlob((blob) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = getFileName('png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, 'image/png');
    };

    img.onerror = (error) => {
      console.error('Error loading SVG as image for PNG conversion:', error);
    };

    img.src = url;
  };

  const convertSvgToJpeg = () => {
    if (!svgContent) {
      console.error('No SVG content available for conversion.');
      return;
    }

    const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = backgroundColor || '#fdfdfd';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      canvas.toBlob((blob) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = getFileName('jpeg');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, 'image/jpeg');
    };

    img.onerror = (error) => {
      console.error('Error loading SVG as image for JPEG conversion:', error);
    };

    img.src = url;
  };

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  return (
    <>
      <div className="image-card card p-3 text-center">
        <h3 className="card-title display-5">{title}</h3>
        <div
          className="image-preview"
          style={{ backgroundColor }}
          dangerouslySetInnerHTML={{ __html: svgContent }} 
          onClick={handleOpenModal}
        />

        {isLoading && <p>Loading SVG...</p>}
        {hasError && <p className="text-danger">Failed to load SVG.</p>}
        
        <div className="download-buttons mt-3 btn-group" role="group">
          <button className="btn btn-primary" onClick={() => handleDownload('svg')} disabled={isLoading || downloadsLeft <= 0}>
            SVG
          </button>
          <button className="btn btn-success" onClick={() => handleDownload('png')} disabled={isLoading || !svgContent || downloadsLeft <= 0}>
            PNG
          </button>
          <button className="btn btn-warning" onClick={() => handleDownload('jpeg')} disabled={isLoading || downloadsLeft <= 0}>
            JPEG
          </button>
        </div>
        {downloadsLeft <= 0 && <p className="text-danger mt-3">You have reached your download limit for today.</p>}
      </div>

      <ImageModal 
        show={showModal} 
        handleClose={handleCloseModal} 
        title={`${categories && categories.length > 0 ? categories.slice(0, 2).join(' / ') : 'All'} / ${title}`}
        image={svgContent}
        downloadSvg={downloadSvg} 
        convertSvgToPng={convertSvgToPng} 
        tags={tags}
        convertSvgToJpeg={convertSvgToJpeg} 
        otherImages={otherImages}
        handleTagClick={handleTagClick}
      />
    </>
  );
};

export default ImageCard;
