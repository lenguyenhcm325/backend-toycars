require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_API_KEY);

async function createProductAndPrice() {
  const product = await stripe.products.create({
    name: "Kong",
  });
  const productId = product.id;

  const price = await stripe.prices.create({
    unit_amount: 2000,
    currency: "eur",

    product: productId,
  });

  const priceId = price.id;
  return priceId;
}

module.exports = createProductAndPrice;
