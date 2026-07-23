import { lazy, Suspense } from "react";
import { Flex, Spinner } from "@chakra-ui/react";
import { Routes, Route, Navigate } from "react-router-dom";

const Home = lazy(() => import('./components/Home'));
const Login = lazy(() => import('./components/Login'));
const SignUp = lazy(() => import('./components/SignUp'));
const Search = lazy(() => import('./components/Search'));
const NotFound = lazy(() => import('./components/NotFound'));
const MyProfile = lazy(() => import('./components/MyProfile'));
const UserProfile = lazy(() => import('./components/UserProfile'));
const EditProfile = lazy(() => import('./components/EditProfile'));
const LoggedLayout = lazy(() => import('./components/layouts/LoggedLayout'));
const EditPassword = lazy(() => import('./components/EditPassword'));
const ConfirmSignUp = lazy(() => import('./components/ConfirmSignUp'));
const ResetPassword = lazy(() => import('./components/ResetPassword'));
const Notifications = lazy(() => import('./components/Notifications'));
const ForgotPassword = lazy(() => import('./components/ForgotPassword'));
const ViewPublication = lazy(() => import('./components/ViewPublication'));
const CreatePublication = lazy(() => import('./components/CreatePublication'));
const PreviewPublication = lazy(() => import('./components/PreviewPublication'));
const SetupMFA = lazy(() => import('./components/SetupMFA'));
const VerifyMFA = lazy(() => import('./components/VerifyMFA'));
const AdminReports = lazy(() => import('./components/AdminReports'));

const routeFallback = (
  <Flex minH="60dvh" align="center" justify="center">
    <Spinner color="var(--text-color)" />
  </Flex>
);

function ComuniRed() {
  return (
    <Suspense fallback={routeFallback}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signUp" element={<SignUp />} />
        <Route path="/search" element={<Search />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/verify-mfa" element={<VerifyMFA />} />

        <Route path="/publication" element={<ViewPublication />} />
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
          <Route path="/admin/reports" element={<AdminReports />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default ComuniRed;
