import type { NavigateFunction } from "react-router-dom";
import { useLocation, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { fetchAuthSession } from "aws-amplify/auth";

const base_url = 'https://nkuohbe6xa.execute-api.us-east-1.amazonaws.com';
export const BackendApi = {
  create_user_url: `${base_url}/user/create-user`,

  delete_account_url: `${base_url}/user/delete-user`,

  push_resouce_url: `${base_url}/presigned/push-resource`,

  read_notification_url: `${base_url}/notifications/read-notification`,

  search_resources_url: `${base_url}/search/search-resources`,
  search_resources_user_auth_url: `${base_url}/search/search-resources-user-auth`,

  edit_account_url: `${base_url}/account/edit`,
  verify_code_url: `${base_url}/account/verify-code`,
  get_account_url: `${base_url}/account/get-account`,
  messages_account_url: `${base_url}/account/messages`,

  list_publication_url: `${base_url}/publications/list-publication`,
  like_publications_url: `${base_url}/publications/like-publication`,
  list_publications_url: `${base_url}/publications/list-publications`,
  share_publication_url: `${base_url}/publications/share-publication`,
  create_publication_url: `${base_url}/publications/create-publication`,
  unlike_publications_url: `${base_url}/publications/unlike-publication`,
  comment_publication_url: `${base_url}/publications/comment-publication`,
  list_user_publications_url: `${base_url}/publications/list-user-publications`,
  list_publication_user_auth_url: `${base_url}/publications/list-publication-user-auth`,
  list_publications_user_auth_url: `${base_url}/publications/list-publications-user-auth`,
  list_user_publications_user_auth_url: `${base_url}/publications/list-user-publications-user-auth`,
};

let navigator: NavigateFunction | null = null;
export const setNavigator = (nav: NavigateFunction) => { navigator = nav; };
export const goTo = (path: string) => {
  if (!navigator) return console.error("Navigator not set! Llama a setNavigator() desde un componente dentro del Router.");
  navigator(path);
};

type Paths = {
  currentPath: string;
  showNavBar: boolean;
  showFooter: boolean;
  showSideNav: boolean;
  showUserInfo: boolean;
  showLogoOnly: boolean;
};
let pathss: Paths = {
  currentPath: "/",
  showNavBar: false,
  showFooter: false,
  showSideNav: false,
  showUserInfo: false,
  showLogoOnly: false
};

export const BanMessaje = "Usted se encuentra baneado. Si requiere asistencia adicional, envíe un correo a franciscojg.h.051130.com."

export const PathsInitializer = () => {
  const location = useLocation();

  useEffect(() => {
    const currentPath = location.pathname;

    pathss = {
      currentPath,

      showNavBar: [
        "/",
        "/my-profile",
        "/edit-profile",
        "/choose",
        "/create-publication",
        "/create-report",
        "/preview-report",
        "/preview-publication",
        "/notifications",
        "/search",
        "/profile",
        "/login",
        "/signUp",
        "/forgot-password",
        "/verify-code",
        "/reset-password",
      ].includes(currentPath),

      showFooter: [
        "/",
        "/view-publication",
        "/search",
        "/profile",
        "/my-profile"
      ].includes(currentPath),

      showSideNav: [
        "/my-profile",
        "/edit-profile",
        "/choose",
        "/create-publication",
        "/notifications",
        "/login",
        "/signUp",
        "/forgot-password",
        "/verify-code",
        "/reset-password",
        "/search",
        "/",
        "/profile"
      ].includes(currentPath),

      showUserInfo: [
        "/my-profile",
        "/edit-profile",
        "/notifications",
        "/create-publication",
        "/choose",
        "/search",
        "/"
      ].includes(currentPath),

      showLogoOnly: [
        "/login",
        "/signUp",
        "/forgot-password",
        "/verify-code",
        "/reset-password"
      ].includes(currentPath)
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
  get showNavBar() { return pathss.showNavBar; },
  get showFooter() { return pathss.showFooter; },
  get showSideNav() { return pathss.showSideNav; },
  get showUserInfo() { return pathss.showUserInfo; },
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

export async function getToken() {
  const session = await fetchAuthSession();
  return session.tokens?.idToken?.toString() ?? null;
}

export async function isUserAuthenticated() {
  try {
    const session = await fetchAuthSession();
    return !!session.tokens?.idToken;
  } catch {
    return false;
  }
}
