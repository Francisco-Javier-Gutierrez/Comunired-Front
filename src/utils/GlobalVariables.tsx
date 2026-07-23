import { useLocation, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { fetchAuthSession } from "aws-amplify/auth";

const base_url = import.meta.env.VITE_API_BASE_URL || '/api';
export const apiRoutes = {
  delete_account_url: `${base_url}/user/delete`,
  update_user_url: `${base_url}/user/update`,
  update_fcm_token_url: `${base_url}/user/fcm-token/update`,

  push_resouce_url: `${base_url}/presigned/push-resource`,

  read_notification_url: `${base_url}/notification/read`,
  delete_all_notifications_url: `${base_url}/notification/delete-all`,

  search_resources_url: `${base_url}/search/search-resources`,
  search_resources_user_auth_url: `${base_url}/search/search-resources-user-auth`,

  messages_account_url: `${base_url}/account/messages`,

  list_comments_url: `${base_url}/comment/list`,
  comment_publication_url: `${base_url}/comment/create`,
  delete_comment_url: `${base_url}/comment/delete`,
  edit_comment_url: `${base_url}/comment/edit`,
  pin_comment_url: `${base_url}/comment/pin`,

  like_publications_url: `${base_url}/like/create`,
  unlike_publications_url: `${base_url}/like/delete`,
  follow_create_url: `${base_url}/follow/create`,
  follow_delete_url: `${base_url}/follow/delete`,
  followers_list_url: `${base_url}/follow/list-followers`,
  following_list_url: `${base_url}/follow/list-following`,
  block_create_url: `${base_url}/block/create`,
  block_delete_url: `${base_url}/block/delete`,
  mute_create_url: `${base_url}/mute/create`,
  mute_delete_url: `${base_url}/mute/delete`,
  save_create_url: `${base_url}/save/create`,
  save_delete_url: `${base_url}/save/delete`,
  save_list_url: `${base_url}/save/list`,
  reaction_set_url: `${base_url}/reaction/set`,
  reaction_delete_url: `${base_url}/reaction/delete`,
  reaction_list_url: `${base_url}/reaction/list`,
  report_create_url: `${base_url}/report/create`,
  reports_list_url: `${base_url}/admin/reports/list`,
  report_update_url: `${base_url}/admin/reports/update`,
  view_register_url: `${base_url}/view/register`,
  view_register_auth_url: `${base_url}/view/register-auth`,
  poll_vote_url: `${base_url}/poll/vote`,
  event_rsvp_url: `${base_url}/event/rsvp`,

  create_publication_url: `${base_url}/publications/create`,
  delete_publication_url: `${base_url}/publications/delete`,
  edit_publication_url: `${base_url}/publications/edit`,

  list_publication_url: `${base_url}/publications/list-publication`,
  list_publications_url: `${base_url}/publications/list-publications`,
  share_publication_url: `${base_url}/publications/share-publication`,
  list_user_publications_url: `${base_url}/publications/list-user-publications`,
  list_publication_user_auth_url: `${base_url}/publications/list-publication-user-auth`,
  list_publications_user_auth_url: `${base_url}/publications/list-publications-user-auth`,
  list_user_publications_user_auth_url: `${base_url}/publications/list-user-publications-user-auth`,

  make_moderator_url: `${base_url}/admin/make-moderator`,
  remove_moderator_url: `${base_url}/admin/remove-moderator`,
  ban_user_url: `${base_url}/admin/ban-user`,
  unban_user_url: `${base_url}/admin/unban-user`,
  admin_update_user_url: `${base_url}/admin/user/update`,
};

type Paths = {
  currentPath: string;
  showNavBar: boolean;
  showFooter: boolean;
  showSideNav: boolean;
  showLogoOnly: boolean;
};
let pathsData: Paths = {
  currentPath: "/",
  showNavBar: false,
  showFooter: false,
  showSideNav: false,
  showLogoOnly: false
};

export const BanMensaje = "Usted se encuentra baneado. Si requiere asistencia adicional, envÃƒÆ’Ã‚Â­e un correo a [EMAIL_ADDRESS]."

export const PathsInitializer = () => {
  const location = useLocation();

  useEffect(() => {
    const currentPath = location.pathname;

    pathsData = {
      currentPath,

      showNavBar: [
        "/",
        "/my-profile",
        "/edit-profile",
        "/create-publication",
        "/preview-publication",
        "/notifications",
        "/admin/reports",
        "/search",
        "/profile",
        "/login",
        "/signUp",
        "/forgot-password",
        "/reset-password",
        "/publication",
        "/edit-password",
        "/not-found",
        "/verify-mfa",
        "/confirm-signup"
      ].includes(currentPath),

      showFooter: [
        "/",
        "/search",
        "/profile",
        "/my-profile",
        "/publication",
        "/edit-password",
        "/not-found",
        "/notifications",
        "/admin/reports",
        "/create-publication",
        "/preview-publication",
        "/edit-profile"
      ].includes(currentPath),

      showSideNav: [
        "/my-profile",
        "/edit-profile",
        "/create-publication",
        "/notifications",
        "/admin/reports",
        "/login",
        "/signUp",
        "/forgot-password",
        "/reset-password",
        "/search",
        "/",
        "/profile",
        "/publication",
        "/edit-password",
        "/not-found",
        "/verify-mfa",
        "/confirm-signup"
      ].includes(currentPath),

      showLogoOnly: [
        "/login",
        "/signUp",
        "/forgot-password",
        "/reset-password",
        "/verify-mfa",
        "/confirm-signup"
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
  get showNavBar() { return pathsData.showNavBar; },
  get showFooter() { return pathsData.showFooter; },
  get showSideNav() { return pathsData.showSideNav; },
  get showLogoOnly() { return pathsData.showLogoOnly; },
  get currentPath() { return pathsData.currentPath; },
};

export const currentPath = () => pathsData.currentPath;
export const searchParams = useSearchParamsGlobal;

export async function getToken() {
  try {
    const session = await fetchAuthSession();
    return session.tokens?.idToken?.toString() ?? null;
  } catch {
    return null;
  }
}

export async function isUserAuthenticated() {
  try {
    const session = await fetchAuthSession();
    return !!session.tokens?.idToken;
  } catch {
    return false;
  }
}
