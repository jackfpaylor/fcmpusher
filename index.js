/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const {onCall} = require("firebase-functions/v2/https");

const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.sendNotification = functions.https.onCall((data, context) => {
  const category = data.category || 'general'; // Use the provided category, default to "general"

  const apnsPayload = data.isCritical ? {
    payload: {
      aps: {
        'interruption-level': 'critical',
        sound: 'default',
        volume: 1.0,
        critical: 1,
      }
    }
  } : {};

  const message = {
    apns: apnsPayload,
    notification: {
      title: data.title,
      body: data.body
    },
    topic: category, // Send to the selected category
  };

  // Send the message
  return admin.messaging().send(message)
    .then((response) => {
      console.log('Successfully sent message:', response);

      // Create a record of the notification in Firestore
      const notificationRecord = {
        title: data.title,
        body: data.body,
        isCritical: data.isCritical || false,
        timestamp: admin.firestore.FieldValue.serverTimestamp(), // Record the server's timestamp
      };

      // Write the record to a "notifications" collection in Firestore
      return admin.firestore().collection('notifications').add(notificationRecord)
        .then(() => {
          return { success: true };
        });
    })
    .catch((error) => {
      console.log('Error sending message:', error);
      throw new functions.https.HttpsError('internal', 'An internal error occurred while sending the notification.');
    });
});

