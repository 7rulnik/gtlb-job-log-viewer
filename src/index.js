import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

const reactRoot = document.createElement('div')
document.body.appendChild(reactRoot)

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  reactRoot, () => {
    document.body.style.display = "block";
  }
);