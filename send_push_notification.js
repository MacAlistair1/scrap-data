const admin = require('firebase-admin');
const fs = require('fs');
const serviceAccount = require('./nepali-pulse-521d50ee6d97.json'); // Path to your service account JSON file

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});


// Get command-line arguments passed to the script
const args = process.argv.slice(2);

// Parse and process the command-line arguments
const data = {};
args.forEach((arg) => {
  const [key, value] = arg.split('=');
  data[key] = value;
});



// Function to send push notification
function sendPushNotification() {
  // Prepare the notification payload
  const payload = {
    notification: {
      title: 'Data Change Notification',
      body: `The ${data['name']} file has been modified.`,
    },
  };

 // Specify the topic to which the notification should be sent
 const topic = 'announcement';

 // Send the notification to the topic
 admin.messaging().sendToTopic(topic, payload)
 .then((response) => {
   const logMessage = `Push notification sent successfully: ${JSON.stringify(response)}`;
   console.log(logMessage);

   // Write the log message to a file
   fs.appendFileSync('notification.log', logMessage + '\n');
 })
 .catch((error) => {
   const errorMessage = `Error sending push notification: ${error}`;

   console.error(errorMessage);

   // Write the error message to a file
   fs.appendFileSync('notification.log', errorMessage + '\n');
 });
}


sendPushNotification();