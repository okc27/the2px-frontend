import React, { useState } from 'react';
import Navbar from './components/navbar';
import ImageGallery from './components/ImageGallery';
import Footer from './components/Footer';
import ImageModal from './components/ImageModal'; // Import the ImageModal component
import './App.css';

const App = () => {
  const [bgColor, setBgColor] = useState('#fdfdfd'); // Default background color
  const [searchInput, setSearchInput] = useState(''); // State for search input
  const [showModal, setShowModal] = useState(false); // State to control modal visibility
  const [selectedImage, setSelectedImage] = useState({ src: '', name: '' }); // State for selected image data

  // Function to open the modal with the selected image
  const openModal = (imageSrc, imageName) => {
    setSelectedImage({ src: imageSrc, name: imageName });
    setShowModal(true);
  };

  // Function to close the modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedImage({ src: '', name: '' }); // Reset selected image
  };

  // Dummy functions for download options (replace with actual functionality)
  const downloadSvg = () => {
    console.log("Downloading SVG...");
  };

  const convertSvgToPng = () => {
    console.log("Converting SVG to PNG...");
  };

  const convertSvgToJpeg = () => {
    console.log("Converting SVG to JPEG...");
  };

  return (
    <div className="app"> {/* Add class for flex styling */}
      <Navbar
        bgColor={bgColor}
        setBgColor={setBgColor}
        searchInput={searchInput} // Pass search input to Navbar
        setSearchInput={setSearchInput} // Pass search input setter to Navbar
      />
      <main className="content">
        <ImageGallery 
          bgColor={bgColor} 
          searchInput={searchInput} 
          setSearchInput={setSearchInput} // Pass setSearchInput to 
          openModal={openModal} // Pass openModal function to ImageGallery
        />
      </main>
      <Footer /> {/* Add Footer at the bottom */}
      
      {/* Include the ImageModal component */}
      <ImageModal
        show={showModal} // Corrected prop name
        handleClose={closeModal} // Corrected function
        image={selectedImage.src} // Corrected prop name
        title={selectedImage.name} // Corrected prop name
        downloadSvg={downloadSvg} // Passed downloadSvg function
        convertSvgToPng={convertSvgToPng} // Passed convertSvgToPng function
        convertSvgToJpeg={convertSvgToJpeg} // Passed convertSvgToJpeg function
      />
    </div>
  );
};

export default App;