const express = require("express");
const Logger = require("../services/winston");
const logger = Logger(__filename);

const logRouteWithMethod = (req, res, next) => {
  logger.info(`${req.method.toUpperCase()} ${req.url}`);
  next();
};

module.exports = logRouteWithMethod;
