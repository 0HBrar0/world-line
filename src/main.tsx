import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { startAnalytics } from './app/analytics';
import { App } from './app/App';
import './styles/tokens.css';
import './styles/app.css';
import './styles/components.css';
import './styles/polish.css';
import './styles/uplink.css';

startAnalytics();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
