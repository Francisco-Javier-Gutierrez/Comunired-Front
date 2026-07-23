import { Amplify } from "aws-amplify";

const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID || "us-east-1_Tib3xMk2L";
const userPoolClientId = import.meta.env.VITE_COGNITO_USER_POOL_CLIENT_ID || "4geq8qheqvrapneafq5pqgga1f";
const cognitoDomain = import.meta.env.VITE_COGNITO_DOMAIN || "comunired-auth-prod.auth.us-east-1.amazoncognito.com";
const appUrl = (import.meta.env.VITE_APP_URL || "https://comuni-red.com").replace(/\/+$/, "");

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId,
      userPoolClientId,

      loginWith: {
        oauth: {
          domain: cognitoDomain,
          scopes: ["openid", "email", "profile"],
          redirectSignIn: [`${appUrl}/oauth-callback`],
          redirectSignOut: [`${appUrl}/`],
          responseType: "code",
        },
      },
    },
  },
});
