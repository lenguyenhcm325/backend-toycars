require("dotenv").config({ path: "../.env" });
const fs = require("fs");

console.log(process.env.AWS_REGION);

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
  const params = {
    Name: nameCreator(key),
    Value: value.trim(),
    Type: "String",
    Overwrite: true,
  };
});
