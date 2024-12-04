import React from 'react';
import './Footer.css'; // Ensure you have the CSS file linked

const Footer = () => {
  return (
    <footer className="footer d-flex justify-content-between align-items-center p-2">


      {/* Rights text on the right side */}
      <div className="footer-rights">
        <p>© 2024 the2px.com All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
