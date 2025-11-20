const base_url = 'https://nkuohbe6xa.execute-api.us-east-1.amazonaws.com';
export const BackendApi = {
  signUp_url: `${base_url}/auth/sign-up`,
  login_url: `${base_url}/auth/login`,
  logout_url: `${base_url}/auth/logout`,
  delete_account_url: `${base_url}/account/delete`,
  edit_account_url: `${base_url}/account/edit`,
  get_account_url: `${base_url}/account/get-account`,
  create_publication_url: `${base_url}/publications/create-publication`,
};

const currentPath = window.location.pathname;
export const paths = {
  hideNavBar: !["/profile", "/report", "/edit-profile", "/publication", "/choose", "/create-publication", "/create-report", "/preview-report", "/preview-publication"].includes(currentPath),
  hideFooter: !["/report", "/signUp", "/edit-profile", "/publication", "/login", "/choose", "/create-publication", "/create-report", "/preview-report", "/preview-publication"].includes(currentPath),
  showSideNav: !["/report", "/publication"].includes(currentPath),
  showLogoOnly: ["/login", "/signUp"].includes(currentPath),
  currentPath: window.location.pathname
};

export const goTo = (path: string) => {
  window.location.href = path;
};


export const formatFecha = (fechaISO: string) => new Date(fechaISO).toLocaleDateString("es-MX");


