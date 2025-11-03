import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Footer from './components/Footer.tsx'
import NavBar from './components/NavBar.tsx'
import ComuniRed from './ComuniRed.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <NavBar />
    <ComuniRed />
    <Footer />
  </StrictMode>,
)
