import './ComuniRed.css';
import Home from './components/Home';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Search from './components/Search';
import NotFound from './components/NotFound';
import MyProfile from './components/MyProfile';

import UserProfile from './components/UserProfile';
import EditProfile from './components/EditProfile';
import LoggedLayout from './components/layouts/LoggedLayout';
import EditPassword from './components/EditPassword';
import ConfirmSignUp from './components/ConfirmSignUp';
import ResetPassword from './components/ResetPassword';
import Notifications from './components/Notifications';
import ForgotPassword from './components/ForgotPassword';
import ViewPublication from './components/ViewPublication';
import CreatePublication from './components/CreatePublication';
import PreviewPublication from './components/PreviewPublication';
import OAuthCallback from './components/OAuthCallback';
import SetupMFA from './components/SetupMFA';
import VerifyMFA from './components/VerifyMFA';

import { Routes, Route, Navigate } from "react-router-dom";

function ComuniRed() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signUp" element={<SignUp />} />
      <Route path="/search" element={<Search />} />
      <Route path="/profile" element={<UserProfile />} />
      <Route path="/verify-mfa" element={<VerifyMFA />} />

      <Route path="/publication" element={<ViewPublication />} />
      <Route path="/oauth-callback" element={<OAuthCallback />} />
      <Route path="/confirm-signup" element={<ConfirmSignUp />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route path="/not-found" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/not-found" replace />} />

      <Route element={<LoggedLayout />}>
        <Route path="/setup-mfa" element={<SetupMFA />} />
        <Route path="/my-profile" element={<MyProfile />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/edit-password" element={<EditPassword />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/create-publication" element={<CreatePublication />} />
        <Route path="/preview-publication" element={<PreviewPublication />} />
      </Route>
    </Routes>
  );
}

export default ComuniRed;
