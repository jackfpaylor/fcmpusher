# Firebase Push Notifications Backend
A lightweight js Firebase CloudFunction for sending iOS push notifications via a frontend form

## Info:
The category for the notification can be fed directly from the frontend. If no category is selected (frontend defaults to general), it will automatically send it to all users as a safeguard `const category = data.category || 'general';`.

## Archival of notifications:
You can easily archive notifications by adjusting the following to match your target Firestore database:
```
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
```
