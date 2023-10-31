require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_API_KEY);

async function listPaymentIntents() {
  const paymentIntents = await stripe.paymentIntents.list({
    limit: 3,
  });
  console.log(paymentIntents);
  return paymentIntents;
}

async function getCheckoutEmailAndID(paymentIntentID) {
  const sessions = await stripe.checkout.sessions.list({
    limit: 1,
    payment_intent: paymentIntentID,
  });

  const checkoutEmail = sessions.data[0].customer_details.email;
  const checkoutSessionID = sessions.data[0].id;

  return { checkoutEmail, checkoutSessionID };
}

async function getLineItemsOfCheckoutSession(checkoutSessionID) {
  await stripe.checkout.sessions.listLineItems(
    checkoutSessionID,
    {
      limit: 10,
    },
    function (err, lineItems) {
      if (err) {
        console.error(err);
      } else {
        console.log("below line item");
        console.log(lineItems.data);
      }
    }
  );
}
module.exports = {
  listPaymentIntents,
  getCheckoutEmailAndID,
};
