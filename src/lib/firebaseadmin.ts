import * as firebaseadmin from "firebase-admin";

const firebaseAdminConfig = {
  apiKey: process.env.FIREBASE_ADMIN_API_KEY,
  authDomain: process.env.FIREBASE_ADMIN_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_ADMIN_DATABASE_URL,
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  storageBucket: process.env.FIREBASE_ADMIN_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_ADMIN_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_ADMIN_APP_ID,
  measurementId: process.env.FIREBASE_ADMIN_MEASUREMENT_ID,
  credential: firebaseadmin.credential.cert({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, "\n")
  }),
  databaseAuthVariableOverride: {
    uid: process.env.FIREBASE_ADMIN_AUTH_ID
  }
};

if (!firebaseadmin.apps.length) {
  firebaseadmin.initializeApp(firebaseAdminConfig);
}

export default firebaseadmin;
