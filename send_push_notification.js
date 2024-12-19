const https = require("https");
const { google } = require("googleapis");
const fs = require("fs");

const serviceAccount = require("/Users/nepalivlog/Documents/nepali-pulse-3586c217f2cd.json");

const PROJECT_ID = "nepali-pulse";
const HOST = "fcm.googleapis.com";
const PATH = "/v1/projects/" + PROJECT_ID + "/messages:send";
const MESSAGING_SCOPE = "https://www.googleapis.com/auth/firebase.messaging";
const SCOPES = [MESSAGING_SCOPE];

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
  getAccessToken().then(function (accessToken) {
    const options = {
      hostname: HOST,
      path: PATH,
      method: "POST",
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    };

    const request = https.request(options, function (resp) {
      resp.setEncoding("utf8");
      resp.on("data", function (data) {
        const logMessage = `Push notification sent successfully for ${
          data["name"]
        }: ${JSON.stringify(data)}`;
        fs.appendFileSync("notification.log", logMessage + "\n");
      });
    });

    request.on("error", function (err) {
      const errorMessage = `Error sending push notification for ${data["name"]}: ${err}`;
      fs.appendFileSync("notification.log", errorMessage + "\n");
    });

    const commonMessage = buildCommonMessage();

    request.write(JSON.stringify(commonMessage));
    request.end();
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

function buildCommonMessage() {
  return {
    message: {
      topic: "announcement",
      notification: {
        title: data["title"] ?? "Data Change Notification",
        body: data["message"] ?? "Click to Check out the latest update!!",
      },
    },
  };
}

sendPushNotification();
