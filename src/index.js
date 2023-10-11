const express = require("express");
const APIRouter = require("./routers/api");
const PaymentRouter = require("./routers/payment");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const logRouteWithMethod = require("./middleware/log-route-with-method");
const Logger = require("./services/winston");
const logger = Logger(__filename);
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(logRouteWithMethod);

app.use("/api", APIRouter);
app.use("/payment", PaymentRouter);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const port = process.env.PORT;
app.listen(port, () => {
  logger.info(`ToyCars backend listening on port ${port}`);
  console.log(`Example app listening on port ${port}`);
});
