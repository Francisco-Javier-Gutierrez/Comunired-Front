const base_url = 'https://nkuohbe6xa.execute-api.us-east-1.amazonaws.com';
export const BackendApi = {
  signUp_url: `${base_url}/auth/sign-up`,
  login_url: `${base_url}/auth/login`,
  auth_me_url: `${base_url}/auth/auth-me`,
  logout_url: `${base_url}/auth/logout`,

  delete_account_url: `${base_url}/account/delete`,
  edit_account_url: `${base_url}/account/edit`,
  edit_password_url: `${base_url}/account/edit-password`,
  get_account_url: `${base_url}/account/get-account`,

  list_publication_url: `${base_url}/publications/list-publication`,
  like_publications_url: `${base_url}/publications/like-publication`,
  list_publications_url: `${base_url}/publications/list-publications`,
  share_publication_url: `${base_url}/publications/share-publication`,
  create_publication_url: `${base_url}/publications/create-publication`,
  comment_publication_url: `${base_url}/publications/comment-publication`,
  list_user_publications_url: `${base_url}/publications/list-user-publications`

};

const currentPath = window.location.pathname;
export const paths = {
  hideNavBar: !["/profile", "/report", "/edit-profile", "/choose", "/create-publication", "/create-report", "/preview-report", "/preview-publication"].includes(currentPath),
  hideFooter: !["/report", "/signUp", "/edit-profile", "/login", "/choose", "/create-publication", "/create-report", "/preview-report", "/preview-publication"].includes(currentPath),
  showSideNav: !["/report"].includes(currentPath),
  showLogoOnly: ["/login", "/signUp"].includes(currentPath),
  currentPath: window.location.pathname
};

export const goTo = (path: string) => {
  window.location.href = path;
};


export const formatFecha = (fechaISO: string) =>
  new Date(fechaISO).toLocaleString("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  });

