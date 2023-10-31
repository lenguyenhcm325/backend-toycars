const { SESv2Client, SendEmailCommand } = require("@aws-sdk/client-sesv2");
require("dotenv").config();
const config = {
  credentials: {
    accessKeyId: process.env.IAM_ACCESS_KEY_ID,
    secretAccessKey: process.env.IAM_SECRET_ACCESS_KEY,
  },
  region: "eu-central-1",
};

const htmlData = `
<!DOCTYPE html>
<html>
<head>
    <title>Test Email</title>
</head>
<body>
    <div style="font-family: Arial, sans-serif; background-color: #f2f2f2; padding: 20px;">
        <h1 style="color: #333; text-align: center;">Welcome to Our Newsletter</h1>
        <p style="color: #666;">Dear Subscriber,</p>
        <p style="color: #666;">Thank you for subscribing to our newsletter. We're excited to have you on board!</p>
        <p style="color: #666;">In each newsletter, you'll find the latest updates, news, and special offers.</p>
        <p style="color: #666;">Stay tuned and enjoy our content!</p>
        <a href="https://www.example.com" style="display: inline-block; background-color: #007BFF; color: #fff; text-decoration: none; padding: 10px 20px; margin-top: 20px; border-radius: 5px; text-align: center;">Read More</a>
    </div>
</body>
</html>
`;

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
