// // const {createLogger, format} = require("winston");
// const winston = require("winston");
const WinstonCloudWatch = require("winston-cloudwatch");
const crypto = require("crypto");
require("dotenv").config();

// // TODO: handling exception in winston
// // TODO: error does not include stack trace by default

let startTime = new Date().toISOString();

// const logger = winston.createLogger({
//   level: "debug",
//   transports: [
//     new winston.transports.Console(),
//     new WinstonCloudWatch({
//       level: "debug",
//       ensureLogGroup: true,
//       logGroupName: "toycars-loggroup",
//       logStreamName: function () {
//         let date = new Date().toISOString().split("T")[0];
//         return (
//           "toycars-" +
//           date +
//           "-" +
//           crypto.createHash("md5").update(startTime).digest("hex")
//         );
//       },
//       awsOptions: {
//         credentials: {
//           accessKeyId: "AKIAURNPQOHOLOVFHXVF",
//           secretAccessKey: "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",
//         },
//         region: "eu-central-1",
//       },
//     }),
//   ],
// });

// // logger.info("This is an info message1.");
// // logger.debug("This is a debug message1.");
// // logger.warn("This is a warning message1.");
// // logger.error("This is an error message1.");
// // console.log("hello");
// module.exports = logger;

const winston = require("winston");
const { resolve } = require("path");
const { fileURLToPath } = require("url");

const { format, transports, createLogger } = winston;
const { combine, timestamp, printf } = format;

module.exports = (meta_url) => {
  const root = resolve("./");
  const file_path = meta_url.replace(root, "");

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
            accessKeyId: "AKIAURNPQOHOLOVFHXVF",
            secretAccessKey: "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",
          },
          region: "eu-central-1",
        },
      }),
    ],
  });

  // Log also to console if not in production

  return loggerInstance;
};
