const { Auth, Amplify } = require("aws-amplify");
require("dotenv").config();

const frontendEndpoint = process.env.FRONTEND_ENDPOINT;

Amplify.configure({
  Auth: {
    // REQUIRED only for Federated Authentication - Amazon Cognito Identity Pool ID
    identityPoolId: process.env.IDENTITY_POOL_ID,

    // REQUIRED - Amazon Cognito Region
    region: process.env.AWS_REGION,

    // OPTIONAL - Amazon Cognito Federated Identity Pool Region
    // Required only if it's different from Amazon Cognito Region
    identityPoolRegion: process.env.IDENTIY_POOL_REGION,

    // OPTIONAL - Amazon Cognito User Pool ID
    userPoolId: process.env.USER_POOL_ID,

    // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
    userPoolWebClientId: process.env.USER_POOL_WEB_CLIENT_ID,

    // OPTIONAL - Enforce user authentication prior to accessing AWS resources or not
    mandatorySignIn: false,

    // OPTIONAL - This is used when autoSignIn is enabled for Auth.signUp
    // 'code' is used for Auth.confirmSignUp, 'link' is used for email link verification
    signUpVerificationMethod: "code", // 'code' | 'link'

    oauth: {
      domain: process.env.OAUTH_DOMAIN,
      scope: ["given_name", "email", "family_name"],
      redirectSignIn: frontendEndpoint,
      redirectSignOut: frontendEndpoint,
      responseType: "code", // or 'token', note that REFRESH token will only be generated when the responseType is code
    },
  },
});

// You can get the current config object
const currentConfig = Auth.configure();

module.exports = Auth;
