import React from 'react';
import ReactDOM from 'react-dom/client';
import { Router } from 'wouter';
import App from './App.tsx';
import './index.css';
import { routerBase } from './lib/routes';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router base={routerBase}>
      <App />
    </Router>
  </React.StrictMode>,
);
