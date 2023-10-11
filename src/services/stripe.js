const stripe = require("stripe")(
  "sk_test_51MoA4lBGR5DYC28pDCRG8b01cH1ZPp6EYDqkcqH1WrktuCmSQ68G1a3kpjrVy23ke96zJeASGqYE1fT4micUpsCk00wwigqNcn"
);

async function listPaymentIntents() {
  const paymentIntents = await stripe.paymentIntents.list({
    limit: 3,
  });
  console.log(paymentIntents);
  return paymentIntents;
}

// listPaymentIntents();

async function getCheckoutEmailAndID(paymentIntentID) {
  const sessions = await stripe.checkout.sessions.list({
    limit: 1,
    payment_intent: paymentIntentID,
  });

  const checkoutEmail = sessions.data[0].customer_details.email;
  const checkoutSessionID = sessions.data[0].id;
  // console.log(sessions.data[0].customer_details.email);
  // return sessions.data[0].customer_details.email;
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

// getLineItemsOfCheckoutSession(
//   "cs_test_b1uv4yEzIuDbfQTXBZ2wpPjxGMoWEJupi134WjsC0CXnNUTXFRkQZFqWBl"
// );
//   pi_3Nqw0uBGR5DYC28p1I8qSD3G
// listPaymentIntents();
// getCheckoutEmail("pi_3Nqw0uBGR5DYC28p1I8qSD3G");
module.exports = {
  listPaymentIntents,
  getCheckoutEmailAndID,
};
