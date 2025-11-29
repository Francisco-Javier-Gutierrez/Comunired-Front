import './ComuniRed.css'
import Home from './components/Home';
import Login from './components/Login'
import SignUp from './components/SignUp';
import Search from './components/Search';
import MyProfile from './components/MyProfile';
import ChooseType from './components/ChooseType';
import UserProfile from './components/UserProfile';
import EditProfile from './components/EditProfile';
import EditPassword from './components/EditPassword';
import CreateReport from './components/CreateReport';
import Notifications from './components/Notifications';
import PreviewReport from './components/PreviewReport';
import ViewPublication from './components/ViewPublication';
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
        <Route path="/search" element={<Search />} />
        <Route path="/choose" element={<ChooseType />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/my-profile" element={<MyProfile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/edit-password" element={<EditPassword />} />
        <Route path="/create-report" element={<CreateReport />} />
        <Route path="/publication" element={<ViewPublication />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/preview-report" element={<PreviewReport />} />
        <Route path="/create-publication" element={<CreatePublication />} />
        <Route path="/preview-publication" element={<PreviewPublication />} />
      </Routes>
    </Router>
  )
}

export default ComuniRed
