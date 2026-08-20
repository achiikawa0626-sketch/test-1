import React from 'react';
import ReactDOM from 'react-dom/client';
import { Router } from 'wouter';
import { useHashLocation } from 'wouter/use-hash-location';
import App from './App.tsx';
import './index.css';
import { isGitHubPagesBuild, restoreGitHubPagesRoute, routerBase } from './lib/routes';

restoreGitHubPagesRoute();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router base={routerBase} hook={isGitHubPagesBuild ? useHashLocation : undefined}>
      <App />
    </Router>
  </React.StrictMode>,
);
