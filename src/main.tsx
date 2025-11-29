import './index.css'
import { StrictMode } from 'react'
import ComuniRed from './ComuniRed.tsx'
import { createRoot } from 'react-dom/client'
import Footer from './components/Footer.tsx'
import NavBar from './components/NavBar.tsx'
import SideNav from './components/SideNav.tsx'
import UserInfo from './components/UserInfo.tsx'
import { paths } from './utils/globalVariables.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div className="d-md-none">
      <NavBar />
      <UserInfo />
      <ComuniRed />
      <Footer />
    </div>
    <div className={`d-none ${paths.showLogoOnly ? "d-md-block" : "d-md-flex"}`}>
      <SideNav />
      <div className="flex-grow-1">
        <UserInfo />
        <ComuniRed />
      </div>
    </div>
  </StrictMode>
)
