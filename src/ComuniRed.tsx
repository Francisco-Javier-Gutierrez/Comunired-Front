import './ComuniRed.css'
import Home from './components/Home';
import Login from './components/Login'
import SignUp from './components/SignUp';
import Profile from './components/Profile';
import Preview from './components/Preview';
import ChooseType from './components/ChooseType';
import CreatePublication from './components/CreatePublication';

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

function ComuniRed() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signUp" element={<SignUp />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/preview" element={<Preview />} />
        <Route path="/choose" element={<ChooseType />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/create-publication" element={<CreatePublication />} />
      </Routes>
    </Router>
  )
}

export default ComuniRed
