const express = require("express");
const path = require("path");

require("dotenv").config();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { getAllCarModels } = require("../services/firebase");
const cognitoAuth = require("../services/cognito");
const { brandPriceFilterSort } = require("../services/elasticsearch");
const { appCheckMiddleware } = require("../services/firebase-app-check");
const api = express.Router();
const Logger = require("../services/winston.js");
const logger = Logger(__filename);

api.get("/cars", async function (req, res, next) {
  try {
    const result = await getAllCarModels(process.env.COLLECTION_NAME);
    logger.info(
      `getAllCarModels - with params ${process.env.COLLECTION_NAME} invoked and fetched`
    );
    logger.info(JSON.stringify(result));
    res.status(200).json(result);
  } catch (error) {
    //TODO status code really depends on which error happened.
    logger.error(JSON.stringify(error));
    res.status(400).json("bad request ");
  }
});
module.exports = api;

api.post("/signup", async (req, res) => {
  const { username, password, email, given_name, family_name } = req.body;

  try {
    await cognitoAuth.createUserWithUsernameAndPasswordAmplify({
      username,
      password,
      email,
      given_name,
      family_name,
    });
    res.json({ message: "OK!" });
    logger.info(
      "cognitoAuth.createUserWithUsernameAndPasswordAmplify is called"
    );
  } catch (error) {
    res.status(400).json({ error: err });
    logger.error(JSON.stringify(error));
  }
});

// NOT IN USE
api.post("/confirm-signup", async function (req, res, next) {
  const { confirmationCode, username } = req.body;

  try {
    await cognitoAuth.confirmUserRegistrationAmplify({
      confirmationCode,
      username,
    });
  } catch (err) {
    console.log("hi");
  }
});

// NOT IN USE
// api.post("/set-cookie", (req, res) => {
//   const { accessKeyId, secretAccessKey, sessionToken } = req.body;
//   res.cookie("accessKeyId", accessKeyId, {
//     httpOnly: true,
//     expires: new Date(Date.now() + 3600000),
//   });
//   res.cookie("secretAccessKey", secretAccessKey, {
//     httpOnly: true,
//     expires: new Date(Date.now() + 3600000),
//   });
//   res.cookie("sessionToken", sessionToken, {
//     httpOnly: true,
//     expires: new Date(Date.now() + 3600000),
//   });

//   res.status(200).send("Token is now HttpOnly cookie.");
// });

// NOT IN USE
// api.get("/test-route", (req, res) => {
//   console.log("Request Headers:", req.headers);
//   const accessKeyIdCookie = req.cookies.accessKeyId;
//   const secretAccessKeyCookie = req.cookies.secretAccessKey;
//   const sessionTokenCookie = req.cookies.sessionToken;
//   res.status(200).send({
//     message: "good",
//     accessKeyIdCookie: req.cookies.accessKeyId,
//     secretAccessKeyCookie: req.cookies.secretAccessKey,
//     sessionTokenCookie: req.cookies.sessionToken,
//   });
// });

api.get("/search", async (req, res) => {
  let minPrice = undefined;
  let maxPrice = undefined;
  let brand = undefined;
  let searchQuery = undefined;
  let sortOrder = "asc";
  // brandPriceFilterSort({
  //   searchQuery: "fun",
  //   minPrice: 0,
  //   maxPrice: 30,
  //   brand: undefined,
  //   sortOrder: "asc",
  // });
  if (req.query.priceRange && req.query.priceRange !== "") {
    const priceRange = req.query.priceRange;
    const priceParts = priceRange.split("-");
    minPrice = parseInt(priceParts[0], 10);
    maxPrice = parseInt(priceParts[1], 10);
  }

  if (req.query.brand && req.query.brand !== "") {
    brand = req.query.brand;
  }
  if (
    req.query.searchQuery &&
    req.query.searchQuery !== "" &&
    req.query.searchQuery !== "undefined"
  ) {
    searchQuery = req.query.searchQuery;
  }
  try {
    const result = await brandPriceFilterSort({
      searchQuery,
      minPrice,
      maxPrice,
      brand,
      sortOrder,
    });
    logger.info(
      `called brandPriceFilterSort - with params ${{
        searchQuery,
        minPrice,
        maxPrice,
        brand,
        sortOrder,
      }}`
    );
    logger.info(JSON.stringify(result));
    res.status(200).json(result);
  } catch (error) {
    res.status(400).send("your request can't be proceeded");
    logger.error(JSON.stringify(error));
  }
});
