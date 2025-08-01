// firebaseAdmin.js
const admin = require("firebase-admin");
const serviceAccount = require("../path/to/serviceAccountKey.json"); // download from Firebase

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
