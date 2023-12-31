const {
  getFirestore,
  collection,
  addDoc,
  doc,
  getDocs,
  setDoc,
  getDoc,
} = require("firebase/firestore");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_API_KEY);
const parsePriceToFloat = require("../utils/parse-price-to-float");
const stringNormalizer = require("../utils/string-normalizer");
const { initializeApp } = require("firebase/app");

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

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

async function generateProductAndPriceId(productInfo) {
  const product = await stripe.products.create({
    name: productInfo.model_brand,
    images: [productInfo.image_url],
    description: productInfo.description,
  });
  const productId = product.id;

  const price = await stripe.prices.create({
    product: productId,
    unit_amount: parseInt(parsePriceToFloat(productInfo.price) * 100),
    currency: "eur",
  });
  const priceId = price.id;
  return {
    productId,
    priceId,
  };
}

const getAllCarModels = async (collectionName) => {
  try {
    let result = [];
    const productsByBrandCollectionRef = collection(db, collectionName);

    const querySnapshot = await getDocs(productsByBrandCollectionRef);
    console.log(querySnapshot);
    querySnapshot.forEach((productsEachBrandDoc) => {
      result.push(productsEachBrandDoc.data());
    });

    return result;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

const getPriceAndProductId = async (flattenNameWithoutSpace) => {
  try {
    const productDocRef = doc(
      db,
      process.env.ALL_PRODUCTS_COLLECTION_NAME,
      flattenNameWithoutSpace
    );
    const productDocSnapshot = await getDoc(productDocRef);
    if (productDocSnapshot.exists()) {
      const productData = productDocSnapshot.data();
      const { stripePriceId, stripeProductId } = productData;

      return { stripePriceId, stripeProductId };
    }

    throw new Error("invalid item");
  } catch (error) {
    console.error(error);
  }
};

const populateWithProductAndPriceId = async () => {
  const allCarModelsByBrand = await getAllCarModels(
    process.env.COLLECTION_NAME
  );
  const allProductsCollectionRef = collection(
    db,
    process.env.ALL_PRODUCTS_COLLECTION_NAME
  );
  for (const modelsEachBrand of allCarModelsByBrand) {
    modelsArray = modelsEachBrand["car_models"];
    for (const modelInfo of modelsArray) {
      const { image_url, model_brand, description, price } = modelInfo;
      const { productId, priceId } = await generateProductAndPriceId(modelInfo);
      await setDoc(
        doc(
          db,
          process.env.ALL_PRODUCTS_COLLECTION_NAME,
          stringNormalizer(model_brand)
        ),
        {
          image_url,
          model_brand,
          description,
          price,
          stripeProductId: productId,
          stripePriceId: priceId,
        }
      );
    }
  }
};

const populateWithShippingAndPriceId = async (shippingArray) => {
  for (const shippingInfo of shippingArray) {
    const { image_url, model_brand, description, price } = shippingInfo;
    const { productId, priceId } = await generateProductAndPriceId(
      shippingInfo
    );
    await setDoc(
      doc(
        db,
        process.env.ALL_PRODUCTS_COLLECTION_NAME,
        stringNormalizer(model_brand)
      ),
      {
        image_url,
        model_brand,
        description,
        price,
        stripeProductId: productId,
        stripePriceId: priceId,
      }
    );
    console.log("done doing for " + model_brand);
  }
  console.log("done adding shippings");
};

const shippingArray = [
  {
    image_url:
      "https://yt3.googleusercontent.com/-GXeJIv-xLmeIh7ENRPQAOlwmz_ru6UOuxaDcpwl74uKiObFf4w2mNelVSeO775keTataf73=s900-c-k-c0x00ffffff-no-rj",
    model_brand: "Standard Delivery",
    description: "Costs $3.99 and takes 3 to 5 business days",
    price: "$3.99",
  },
  {
    image_url:
      "https://yt3.googleusercontent.com/-GXeJIv-xLmeIh7ENRPQAOlwmz_ru6UOuxaDcpwl74uKiObFf4w2mNelVSeO775keTataf73=s900-c-k-c0x00ffffff-no-rj",
    model_brand: "Express Delivery",
    description: "Costs $7.99 and takes 1 business day",
    price: "$7.99",
  },
];

// populateWithShippingAndPriceId(shippingArray);

const existsSessionIdInFS = async (sessionId) => {
  try {
    const sessionDocRef = doc(
      db,
      process.env.PAYMENT_SESSIONS_COLLECTION,
      sessionId
    );
    const sessionDocSnapshot = await getDoc(sessionDocRef);
    if (sessionDocSnapshot.exists()) {
      return true;
    }
    return false;
  } catch (error) {
    console.error(error);
    return true;
  }
};

const addSessionIdToFS = async (sessionId) => {
  try {
    await setDoc(doc(db, process.env.PAYMENT_SESSIONS_COLLECTION, sessionId), {
      flushed: true,
    });
    console.log(
      `has set ${sessionId} into payment session collection on Firestore`
    );
  } catch (error) {
    console.error(error);
  }
};

const createItemsWithPriceId = async (itemsReqBody) => {
  let itemWithPriceIdList = [];
  for (const item of itemsReqBody) {
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

  return itemWithPriceIdList;
};

module.exports = {
  getAllCarModels,
  getPriceAndProductId,
  existsSessionIdInFS,
  addSessionIdToFS,
  createItemsWithPriceId,
};
