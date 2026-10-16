import { RouterProvider } from 'react-router-dom';
import { GlobalStyle } from '@/globalStyle';
import { ToastProvider } from '@/components/ui/Toast';
import { AuthProvider } from '@/contexts/AuthContext';
import { router } from '@/routes/router';

export function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <GlobalStyle />
        <RouterProvider router={router} />
      </ToastProvider>
    </AuthProvider>
  );
}
