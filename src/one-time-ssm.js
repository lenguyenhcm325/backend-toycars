require("dotenv").config({ path: "../.env" });
// const AWS = require("aws-sdk");
const fs = require("fs");

console.log(process.env.AWS_REGION);

// AWS.config.update({
//   region: process.env.AWS_REGION,
//   credentials: {
//     accessKeyId: process.env.IAM_ACCESS_KEY_ID,
//     secretAccessKey: process.env.IAM_SECRET_ACCESS_KEY,
//   },
// });

// const ssm = new AWS.SSM();

const nameCreator = (name1) => {
  return `/toycars/dev/backend/` + name1.trim();
};

const content = fs.readFileSync("../.env", "utf8");

const lines = content.split("\n");

lines.forEach((line) => {
  let [key, value] = line.split("=");
  console.log(key.trim() + `: /toycars/dev/backend/` + key.trim());
  if (!key || !value) return;
  if (value.includes("\r")) {
    value = value.slice(0, -1);
  }
  // console.log({ [key]: value });

  const params = {
    Name: nameCreator(key),
    Value: value.trim(),
    Type: "String",
    Overwrite: true,
  };
  // ssm.putParameter(params, (err, data) => {
  //   if (err) {
  //     console.error(`failed to upload ${key}`, err);
  //   } else {
  //     console.log(`Uploaded ${key} to SSM Parameter store!`);
  //   }
  // }
  // );
});
