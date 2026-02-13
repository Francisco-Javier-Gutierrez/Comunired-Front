import { Amplify } from "aws-amplify";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: "us-east-1_ONMK5lddC",
      userPoolClientId: "3g9u29c5kol8tgdmcj1jccv9do",

      loginWith: {
        oauth: {
          domain: "us-east-1onmk5lddc.auth.us-east-1.amazoncognito.com",
          scopes: ["openid", "email", "profile"],
          redirectSignIn: ["https://comuni-red.com/oauth-callback"],
          redirectSignOut: ["https://comuni-red.com/"],
          responseType: "code",
        },
      },
    },
  },
});
