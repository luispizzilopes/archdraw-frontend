import '@xyflow/react/dist/style.css';
import { createRoot } from 'react-dom/client';
import { App } from '@/App';
import { settingsService } from '@/services/settingsService';

settingsService.applyTheme(settingsService.get().theme);

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
    <App />
  // </StrictMode>,
);
