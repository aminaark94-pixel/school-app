import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {OwnerStudioGate} from './components/owner/OwnerStudio.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <OwnerStudioGate />
  </StrictMode>,
);
