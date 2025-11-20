import './ComuniRed.css'
import Home from './components/Home';
import Login from './components/Login'
import SignUp from './components/SignUp';
import Profile from './components/Profile';
import ChooseType from './components/ChooseType';
import EditProfile from './components/EditProfile';
import CreateReport from './components/CreateReport';
import Notifications from './components/Notifications';
import PreviewReport from './components/PreviewReport';
import CreatePublication from './components/CreatePublication';
import PreviewPublication from './components/PreviewPublication';

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
        <Route path="/choose" element={<ChooseType />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/create-report" element={<CreateReport />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/preview-report" element={<PreviewReport />} />
        <Route path="/create-publication" element={<CreatePublication />} />
        <Route path="/preview-publication" element={<PreviewPublication />} />
      </Routes>
    </Router>
  )
}

export default ComuniRed
