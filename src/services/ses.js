/*
For how email's HTML is dynamically populated please view the file
./src/services/confirmation-email.js
*/

const { SESv2Client, SendEmailCommand } = require("@aws-sdk/client-sesv2");
require("dotenv").config();
const config = {
  credentials: {
    accessKeyId: process.env.IAM_ACCESS_KEY_ID,
    secretAccessKey: process.env.IAM_SECRET_ACCESS_KEY,
  },
  region: "eu-central-1",
};

const client = new SESv2Client(config);

const sendEmail = async ({ receiver, emailHTML, subject }) => {
  const input = {
    // SendEmailRequests
    FromEmailAddress: process.env.SES_FROM_EMAIL,
    FromEmailAddressIdentityArn: process.env.SES_FROM_EMAIL_ARN,
    Destination: {
      // Destination
      ToAddresses: receiver,
    },
    ReplyToAddresses: [process.env.SES_REPLY_TO_EMAIL],
    Content: {
      // EmailContent
      Simple: {
        // Message
        Subject: {
          // Content
          Data: subject, // required
          Charset: "UTF-8",
        },
        Body: {
          // Body
          Text: {
            Data: "you do not have html, poor you", // required
            Charset: "UTF-8",
          },
          Html: {
            Data: emailHTML, // required
            Charset: "UTF-8",
          },
        },
      },
    },
  };
  const command = new SendEmailCommand(input);
  const response = await client.send(command);
  console.log(response);
  return response;
};

module.exports = {
  sendEmail,
};
