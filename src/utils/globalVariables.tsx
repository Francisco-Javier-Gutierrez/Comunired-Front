const base_url = 'https://nkuohbe6xa.execute-api.us-east-1.amazonaws.com';
export const BackendApi = {
  signUp_url: `${base_url}/auth/sign-up`,
  login_url: `${base_url}/auth/login`,
  logout_url: `${base_url}/auth/logout`,
  delete_url: `${base_url}/account/delete`
};


const currentPath = window.location.pathname;
export const paths = {
  hideNavBar: !["/profile", "/report", "/publication", "/choose", "/create-publication"].includes(currentPath),
  hideFooter: !["/report", "/publication", "/choose", "/create-publication"].includes(currentPath),
  showSideNav: !["/report", "/publication"].includes(currentPath),
  showLogoOnly: ["/login", "/signUp"].includes(currentPath),
  currentPath: window.location.pathname
};

export const goTo = (path: string) => {
  window.location.href = path;
};
