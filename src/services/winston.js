const WinstonCloudWatch = require("winston-cloudwatch");
const crypto = require("crypto");
require("dotenv").config();

// // TODO: handling exception in winston
// // TODO: error does not include stack trace by default

let startTime = new Date().toISOString();

const winston = require("winston");
const { resolve } = require("path");
const { fileURLToPath } = require("url");

const { format, transports, createLogger } = winston;
const { combine, timestamp, printf } = format;

module.exports = (meta_url) => {
  const root = resolve("./");
  const file_path = meta_url.replace(root, "");

  // Log both the level and file path for enhanced debugging in case of error
  const customFormat = printf(({ level, message, timestamp, stack }) => {
    return ` [${level}] ${file_path}: ${stack || message}`;
  });

  const loggerInstance = createLogger({
    level: "info",
    format: combine(
      timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      format.splat(),
      format.errors({ stack: true }),
      customFormat
    ),
    transports: [
      new winston.transports.Console(),
      new WinstonCloudWatch({
        messageFormatter: function ({ level, message, stack }) {
          return ` [${level}] ${file_path}: ${stack || message}`;
        },
        level: "debug",
        ensureLogGroup: true,
        logGroupName: "toycars-loggroup",
        logStreamName: function () {
          let date = new Date().toISOString().split("T")[0];
          return (
            "toycars-" +
            date +
            "-" +
            crypto.createHash("md5").update(startTime).digest("hex")
          );
        },
        awsOptions: {
          credentials: {
            accessKeyId: process.env.IAM_ACCESS_KEY_ID,
            secretAccessKey: process.env.IAM_SECRET_ACCESS_KEY,
          },
          region: "eu-central-1",
        },
      }),
    ],
  });

  //TODO Log also to console if not in production

  return loggerInstance;
};
