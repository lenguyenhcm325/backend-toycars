const { MongoClient } = require("mongodb");
const { getFirestore, collection, addDoc, doc } = require("firebase/firestore");
const { initializeApp } = require("firebase/app");
require("dotenv").config();
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

const MongoDBURI = process.env.MONGODB_URI;
const client = new MongoClient(MongoDBURI);
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

async function connect() {
  try {
    await client.connect();
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
}

async function getAllEntries(databaseName, collectionName) {
  try {
    result = [];
    const database = client.db(databaseName);
    const brandCollection = database.collection(collectionName);
    const cursor = brandCollection.find({});

    for await (const productsByBrandDoc of cursor) {
      result.push(productsByBrandDoc);
      delete productsByBrandDoc._id;

      const brandDocRef = await addDoc(collection(db, "ProductsByBrand"), {
        ...productsByBrandDoc,
      });
      console.log("Document written with ID: ", brandDocRef.id);
    }
  } catch (error) {
    console.log("Error retrieving data: ", error);
  } finally {
    await client.close();
  }
}

async function doWork(databaseName, collectionName) {
  await connect();
  await getAllEntries(databaseName, collectionName);
}

doWork("dev-toycars", "toycars-info");
