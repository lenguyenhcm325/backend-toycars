const { MongoClient } = require("mongodb");
require("dotenv").config();

const MongoDBURI = process.env.MONGODB_URI;
const client = new MongoClient(MongoDBURI);
async function run() {
  try {
    await client.connect();
    const database = client.db("dev-toycars");
    const toyCars = database.collection("toycars-info");
    // Query for a movie that has the title 'Back to the Future'
    const query = { brand_name: "UrbanX" };
    const toyCar = await toyCars.findOne(query);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

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
    const collection = database.collection(collectionName);
    const cursor = collection.find({});

    for await (const doc of cursor) {
      result.push(doc);
    }
    return result;
  } catch (error) {
    console.log("Error retrieving data: ", error);
  } finally {
    await client.close();
  }
}

async function getAllCarModels(databaseName, collectionName) {
  await connect();
  return await getAllEntries(databaseName, collectionName);
}

module.exports = {
  getAllCarModels,
};
