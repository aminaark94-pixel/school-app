import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {OwnerStudioGate} from './components/owner/OwnerStudio.tsx';
import {AuthProvider} from './lib/authContext.tsx';
import {AuthGate} from './components/auth/AuthGate.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <AuthGate>
        <App />
      </AuthGate>
      <OwnerStudioGate />
    </AuthProvider>
  </StrictMode>,
);
