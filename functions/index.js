// Import Firebase Functions SDK
const functions = require("firebase-functions");

// A basic HTTP Cloud Function
exports.helloWorld = functions.https.onRequest((request, response) => {
  response.send("👋 Hello from Quizmint Cloud Function!");
});
