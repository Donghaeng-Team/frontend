import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { useLocationStore } from './stores/locationStore'
import { useAuthStore } from './stores/authStore'

// 앱 시작 시 초기화
useLocationStore.getState().initializeLocation();
useAuthStore.getState().initializeAuth();



createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App /> 
  </StrictMode>,
)
