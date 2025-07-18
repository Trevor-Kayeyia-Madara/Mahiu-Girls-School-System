import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import router from './routes/index.tsx'
import { AuthProvider } from './contexts/AuthContext'
import { Toaster } from 'react-hot-toast'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
       <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
    <RouterProvider router = {router} />
    </AuthProvider>
  </StrictMode>,
)
