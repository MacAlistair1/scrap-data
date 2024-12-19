const admin = require("firebase-admin");
const fs = require("fs");
const https = require('https');

const serviceAccount = require("/Users/nepalivlog/Documents/nepali-pulse-3586c217f2cd.json"); 

const PROJECT_ID = '<YOUR-PROJECT-ID>';
const HOST = 'fcm.googleapis.com';
const PATH = '/v1/projects/' + PROJECT_ID + '/messages:send';
const MESSAGING_SCOPE = 'https://www.googleapis.com/auth/firebase.messaging';
const SCOPES = [MESSAGING_SCOPE];



admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

// Get command-line arguments passed to the script
const args = process.argv.slice(2);

// Parse and process the command-line arguments
const data = {};
args.forEach((arg) => {
  const [key, value] = arg.split("=");
  data[key] = value;
});

// Function to send push notification
function sendPushNotification() {

  getAccessToken().then(function(accessToken) {
    const options = {
      hostname: HOST,
      path: PATH,
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + accessToken
      }
    };



  // Prepare the notification payload
  const payload = {
    notification: {
      title: data["title"] ?? "Data Change Notification",
      body: data["message"] ?? "Click to Check out the latest update!!",
    },
  };

  // Specify the topic to which the notification should be sent
  const topic = "announcement";

  // Send the notification to the topic
  admin
    .messaging()
    .sendToTopic(topic, payload)
    .then((response) => {
      const logMessage = `Push notification sent successfully for ${
        data["name"]
      }: ${JSON.stringify(response)}`;
      // console.log(logMessage);

      // Write the log message to a file
      fs.appendFileSync("notification.log", logMessage + "\n");
    })
    .catch((error) => {
      const errorMessage = `Error sending push notification for ${data["name"]}: ${error}`;

      // console.error(errorMessage);

      // Write the error message to a file
      fs.appendFileSync("notification.log", errorMessage + "\n");
    });
}

function getAccessToken() {
  return new Promise(function (resolve, reject) {
    const key = serviceAccount;
    const jwtClient = new google.auth.JWT(
      key.client_email,
      null,
      key.private_key,
      SCOPES,
      null
    );
    jwtClient.authorize(function (err, tokens) {
      if (err) {
        reject(err);
        return;
      }
      resolve(tokens.access_token);
    });
  });
}

sendPushNotification();
