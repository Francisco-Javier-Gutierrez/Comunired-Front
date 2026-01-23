import type { NavigateFunction } from "react-router-dom";
import { useLocation, useSearchParams } from "react-router-dom";
import { useEffect } from "react";

const base_url = 'https://nkuohbe6xa.execute-api.us-east-1.amazonaws.com';
export const BackendApi = {

  delete_notification_url: `${base_url}/notifications/delete-notification`,

  search_resources_url: `${base_url}/search/search-resources`,

  create_report_url: `${base_url}/reports/create-report`,
  like_report_url: `${base_url}/reports/like-report`,
  list_report_url: `${base_url}/reports/list-report`,
  comment_report_url: `${base_url}/reports/comment-report`,
  share_report_url: `${base_url}/reports/share-report`,

  signUp_url: `${base_url}/auth/sign-up`,
  login_url: `${base_url}/auth/login`,
  auth_me_url: `${base_url}/auth/auth-me`,
  logout_url: `${base_url}/auth/logout`,

  edit_account_url: `${base_url}/account/edit`,
  delete_account_url: `${base_url}/account/delete`,
  ban_account_url: `${base_url}/account/ban-account`,
  verify_code_url: `${base_url}/account/verify-code`,
  get_account_url: `${base_url}/account/get-account`,
  messages_account_url: `${base_url}/account/messages`,
  edit_password_url: `${base_url}/account/edit-password`,
  reset_password_url: `${base_url}/account/reset-password`,
  forgot_password_url: `${base_url}/account/forgot-password`,

  list_publication_url: `${base_url}/publications/list-publication`,
  like_publications_url: `${base_url}/publications/like-publication`,
  list_publications_url: `${base_url}/publications/list-publications`,
  share_publication_url: `${base_url}/publications/share-publication`,
  create_publication_url: `${base_url}/publications/create-publication`,
  unlike_publications_url: `${base_url}/publications/unlike-publication`,
  comment_publication_url: `${base_url}/publications/comment-publication`,
  list_user_publications_url: `${base_url}/publications/list-user-publications`
};

let navigator: NavigateFunction | null = null;
export const setNavigator = (nav: NavigateFunction) => { navigator = nav; };
export const goTo = (path: string) => {
  if (!navigator) return console.error("Navigator not set! Llama a setNavigator() desde un componente dentro del Router.");
  navigator(path);
};

type Paths = {
  hideNavBar: boolean;
  hideFooter: boolean;
  showSideNav: boolean;
  hideUserInfo: boolean;
  showLogoOnly: boolean;
  currentPath: string;
};
let pathss: Paths = {
  hideNavBar: true,
  hideFooter: true,
  showSideNav: true,
  hideUserInfo: true,
  showLogoOnly: false,
  currentPath: "/"
};

export const BanMessaje = "Usted se encuentra baneado. Si requiere asistencia adicional, envíe un correo a franciscojg.h.051130.com."

export const PathsInitializer = () => {
  const location = useLocation();
  useEffect(() => {
    const currentPath = location.pathname;
    pathss = {
      hideNavBar: !["/my-profile", "/edit-profile", "/choose", "/create-publication", "/create-report", "/preview-report", "/preview-publication", "/notifications"].includes(currentPath),
      hideFooter: !["/signUp", "/edit-profile", "/login", "/choose", "/create-publication", "/create-report", "/preview-report", "/preview-publication", "/forgot-password", "/verify-code", "/reset-password"].includes(currentPath),
      showSideNav: ![""].includes(currentPath),
      hideUserInfo: !["/login", "/signUp", "/forgot-password", "/verify-code", "/reset-password"].includes(currentPath),
      showLogoOnly: ["/login", "/signUp", "/forgot-password", "/verify-code", "/reset-password"].includes(currentPath),
      currentPath
    };
  }, [location]);
  return null;
};

export const useSearchParamsGlobal = () => {
  const [searchParams] = useSearchParams();
  return searchParams;
};

export const formatFecha = (fechaISO: string) =>
  new Date(fechaISO).toLocaleString("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  });

export const paths = {
  get hideNavBar() { return pathss.hideNavBar; },
  get hideFooter() { return pathss.hideFooter; },
  get showSideNav() { return pathss.showSideNav; },
  get hideUserInfo() { return pathss.hideUserInfo; },
  get showLogoOnly() { return pathss.showLogoOnly; },
  get currentPath() { return pathss.currentPath; },
};

let globalState = {};

export const setGlobalState = (data: any) => {
  globalState = { ...globalState, ...data };
};

export const getGlobalState = () => globalState;


export const currentPath = () => pathss.currentPath;
export const searchParams = useSearchParamsGlobal;
