import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './store/themeStore'
import { useAuthStore } from './store/authStore'
import './index.css'
import App from './App.tsx'

async function start() {
  await useAuthStore.persist.rehydrate()
  await useAuthStore.getState().bootstrap()

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>,
  )
}

void start()
