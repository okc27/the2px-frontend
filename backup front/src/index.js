import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';  // This line is now valid after creating index.css
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';

  // You can comment or remove this line if not using it

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


