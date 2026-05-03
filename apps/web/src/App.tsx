import { BrowserRouter, createBrowserRouter, RouterProvider } from 'react-router-dom';

import { AppRoutes } from './routes/AppRoutes';
import { useAuthStore } from './stores/auth.store';
import { useEffect } from 'react';
import { useTokenRefresh } from './hooks/useTokenRefresh';

const router = createBrowserRouter([
  {
    path: "*",
    element: <AppRoutes />
  }
]);

export default function App() {
  const initializeBroadCaster = useAuthStore((s) => s.initializeBroadcaster);

  useEffect(() => {
    initializeBroadCaster();
  }, [initializeBroadCaster]);

  //refresh logic
  useTokenRefresh();
  return <RouterProvider router={router} /> 
}