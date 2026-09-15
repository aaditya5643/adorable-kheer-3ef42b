const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let serviceAccount;
const keyPath = path.resolve(__dirname, 'serviceAccountKey.json');

if (fs.existsSync(keyPath)) {
  serviceAccount = require(keyPath);
} else {
  console.warn('⚠️ Firebase service account key not found at:', keyPath);
}

if (!admin.apps.length && serviceAccount) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id,
      storageBucket: `${serviceAccount.project_id}.firebasestorage.app`
    });
    console.log(`🔥 Firebase Admin SDK initialized for project: ${serviceAccount.project_id}`);
  } catch (err) {
    console.error('Failed to initialize Firebase Admin SDK:', err.message);
  }
}

const firestore = admin.apps.length ? admin.firestore() : null;
const auth = admin.apps.length ? admin.auth() : null;
const storage = admin.apps.length ? admin.storage() : null;

module.exports = {
  admin,
  firestore,
  auth,
  storage,
  isConfigured: !!admin.apps.length
};
