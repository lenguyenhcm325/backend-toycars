const { initializeApp } = require("firebase-admin/app");
const { getAppCheck } = require("firebase-admin/app-check");
require("dotenv").config();
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

const appCheckMiddleware = async (req, res, next) => {
  const appCheckToken = req.header("X-Firebase-AppCheck");

  console.log(appCheckToken);

  if (!appCheckToken) {
    res.status(401);
    return next("Unauthorized");
  }

  try {
    const appCheckClaims = await getAppCheck().verifyToken(appCheckToken);

    // If verifyToken() succeeds, continue with the next middleware
    // function in the stack.
    return next();
  } catch (err) {
    res.status(401);
    return next("Unauthorized");
  }
};

// expressApp.get("/yourApiEndpoint", [appCheckMiddleware], (req, res) => {
//   // Handle request.
// });

module.exports = {
  appCheckMiddleware,
};
