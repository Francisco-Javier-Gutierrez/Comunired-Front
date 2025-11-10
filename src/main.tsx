import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Footer from './components/Footer.tsx'
import NavBar from './components/NavBar.tsx'
import SideNav from './components/SideNav.tsx'
import ComuniRed from './ComuniRed.tsx'

const currentPath = window.location.pathname;
const blockPaths = ["/login", "/signUp"].includes(currentPath);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div className="d-md-none">
      <NavBar />
      <ComuniRed />
      <Footer />
    </div>

    <div className={`d-none ${blockPaths ? "d-md-block" : "d-md-flex"}`}>
      <SideNav />
      <div className="flex-grow-1">
        <ComuniRed />
      </div>
    </div>
  </StrictMode>
)
