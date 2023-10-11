const express = require("express");
const Logger = require("../services/winston.js");
const logger = Logger(__filename);
const createProductAndPrice = require("../services/one-time-stripe");
require("dotenv").config();
const {
  createOrderConfirmationHTML,
} = require("../services/confirmation-email");
const stripeAPI = require("../services/stripe");
const { getPriceAndProductId } = require("../services/firebase");
const payment = express.Router();
const SES = require("../services/ses");
const stripe = require("stripe")(process.env.STRIPE_API_KEY);

const YOUR_DOMAIN = "http://localhost:5173";
payment.post("/create-checkout-session", async (req, res) => {
  const checkoutItemsReqBody = req.body;
  logger.info(`checkoutItemsReqBody ${JSON.stringify(checkoutItemsReqBody)}`);
  let itemWithPriceIdList = [];

  for (const item of checkoutItemsReqBody) {
    const flattenNameWithoutSpace = Object.keys(item)[0];
    const quantity = item[flattenNameWithoutSpace];
    const { stripePriceId } = await getPriceAndProductId(
      flattenNameWithoutSpace
    );
    itemWithPriceIdList.push({
      price: stripePriceId,
      quantity: quantity,
    });
  }
  logger.info(`checkoutItemsReqBody ${JSON.stringify(checkoutItemsReqBody)}`);
  // const priceId = await createProductAndPrice();
  try {
    const session = await stripe.checkout.sessions.create({
      line_items: itemWithPriceIdList,
      mode: "payment",
      success_url: `${YOUR_DOMAIN}/payment-success`,
      cancel_url: `${YOUR_DOMAIN}/`,
      invoice_creation: {
        enabled: true,
      },
    });
    logger.info("checkout session created successfully");
    logger.info(`session ${JSON.stringify(session)}`);
    logger.info("url returned " + session.url);
  } catch (error) {
    logger.error(JSON.stringify(error));
  }
  res.json({ url: session.url });
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
  // the stripeAPI needs some time so that the payment intents
  // are registered in their database, 3s seem to be a sweet interval
  setTimeout(async () => {
    try {
      let totalPrice;
      // return 3 PaymentIntent entries
      const results = await stripeAPI.listPaymentIntents();
      logger.info(`return 3 PaymentIntent ${JSON.stringify(results)} `);
      results.data.forEach(async (paymentIntent) => {
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
                console.log(productsBought);
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

      res.status(200).json("Your request was proceeded");
    } catch (error) {
      logger.error(JSON.stringify(error));

      res
        .status(500)
        .json("Sorry but there is an error" + JSON.stringify(error));
    }
  }, 3000);
});
