const express = require("express");
const Logger = require("../services/winston.js");
const logger = Logger(__filename);
require("dotenv").config();
const {
  createOrderConfirmationHTML,
} = require("../services/confirmation-email");
const stripeAPI = require("../services/stripe");
const {
  existsSessionIdInFS,
  addSessionIdToFS,
  createItemsWithPriceId,
} = require("../services/firebase");
const payment = express.Router();
const SES = require("../services/ses");
const stripe = require("stripe")(process.env.STRIPE_API_KEY);

const YOUR_DOMAIN = process.env.FRONTEND_ENDPOINT;
payment.post("/create-checkout-session", async (req, res) => {
  const checkoutItemsReqBody = req.body;
  logger.info(`checkoutItemsReqBody ${JSON.stringify(checkoutItemsReqBody)}`);
  let itemWithPriceIdList = await createItemsWithPriceId(checkoutItemsReqBody);
  logger.info(`checkoutItemsReqBody ${JSON.stringify(checkoutItemsReqBody)}`);
  try {
    const session = await stripe.checkout.sessions.create({
      line_items: itemWithPriceIdList,
      mode: "payment",
      success_url: `${YOUR_DOMAIN}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${YOUR_DOMAIN}/`,
      invoice_creation: {
        enabled: true,
      },
    });
    logger.info("checkout session created successfully");
    logger.info(`session ${JSON.stringify(session)}`);
    logger.info("url returned " + session.url);
    res.json({ url: session.url });
  } catch (error) {
    logger.error(JSON.stringify(error));
  }
});

payment.get("/verify-session", async (req, res) => {
  logger.info("hit this verify-session");
  const sessionId = req.query.session_id;
  if (!sessionId) {
    return res.sendStatus(404);
  }
  try {
    logger.info("proceed with checking if the sessionId is valid");
    const session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch (error) {
    logger.info("Seems like the session is invalid");
    logger.error(JSON.stringify(error));
    return res.sendStatus(404);
  }
  let sessionIdExists = false;
  sessionIdExists = await existsSessionIdInFS(sessionId);

  if (sessionIdExists) {
    logger.info("session id already in firestore");
    return res.sendStatus(404);
  } else if (!sessionIdExists) {
    logger.info(
      "session id not already in firestore, proceed with adding it to firestore"
    );
    await addSessionIdToFS(sessionId);
    logger.info("added successfully");
    return res.sendStatus(200);
  }
});

payment.post("/webhook", (req, res) => {
  const event = req.body;

  // Handle the event
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      const { receipt_email, payment_method, amount } = paymentIntent;
      logger.info("payment_intent.succeeded - payment");
      // not everyone can view this kind of info!
      // Then define and call a method to handle the successful payment intent.
      // handlePaymentIntentSucceeded(paymentIntent);
      break;
    default:
      logger.warn(`Unhandled event type ${event.type}`);
  }

  // Return a response to acknowledge the receipt of the event
  logger.info(JSON.stringify({ received: true }));
  res.json({ received: true });
});

module.exports = payment;

payment.post("/payment-received", async (req, res) => {
  res.status(200).json("Your request is being processed");
  // the stripeAPI needs some time so that the payment intents
  // are registered in their database, 3s seem to be a sweet interval
  setTimeout(async () => {
    try {
      // return 3 PaymentIntent entries
      const results = await stripeAPI.listPaymentIntents();
      logger.info(`return 3 PaymentIntent ${JSON.stringify(results)} `);
      results.data.forEach(async (paymentIntent) => {
        let totalPrice;
        if (paymentIntent.metadata.alreadySentMail) {
        } else {
          logger.info(
            `this should be shown only once per request - this order need to be confirmed via email `
          );
          logger.info(`paymentIntent object: ${JSON.stringify(paymentIntent)}`);
          totalPrice = (paymentIntent.amount / 100).toFixed(2);
          await stripe.paymentIntents.update(paymentIntent.id, {
            metadata: {
              alreadySentMail: true,
            },
          });
          let productsBought = [];
          const { id } = paymentIntent;
          const { checkoutEmail, checkoutSessionID } =
            await stripeAPI.getCheckoutEmailAndID(id);
          logger.info(`getCheckoutEmailAndID with param ${id} invoked`);
          await stripe.checkout.sessions.listLineItems(
            checkoutSessionID,
            {
              limit: 10,
            },
            function (err, lineItems) {
              if (err) {
                console.error(err);
              } else {
                lineItems.data.forEach((lineItem) => {
                  const modelBrand = lineItem.description;
                  // at first the price is in cent(s)
                  const price = (lineItem.price.unit_amount / 100).toFixed(2);
                  const quantity = lineItem.quantity;
                  productsBought.push({
                    modelBrand,
                    price,
                    quantity,
                  });
                });
                logger.info(productsBought);
                logger.info(`productsBought ${JSON.stringify(productsBought)}`);
                if (productsBought.length !== 0) {
                  logger.info(
                    "productsBought.length is larger than 0, proceed with sending email"
                  );
                  const emailHTML = createOrderConfirmationHTML(
                    productsBought,
                    totalPrice
                  );
                  SES.sendEmail({
                    receiver: [checkoutEmail],
                    subject: "Order confirmation",
                    emailHTML: emailHTML,
                  });
                  logger.info(
                    "order confirmation email sent with SES, visit SES with the timestamp of this log line to view more info"
                  );
                }
              }
            }
          );
          logger.info(
            `listLineItems for the session with id ${checkoutSessionID} invoked`
          );
        }
      });
    } catch (error) {
      logger.error(JSON.stringify(error));
    }
  }, 3000);
});
