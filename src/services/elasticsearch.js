const { Client, HttpConnection } = require("@elastic/elasticsearch");
const fs = require("fs");
require("dotenv").config();

if (!process.env.ELASTIC_CLOUD_ID) {
  throw new Error("elastic cloud id does not exist!");
}

const { getAllCarModels } = require("./firebase");
const client = new Client({
  cloud: {
    id: process.env.ELASTIC_CLOUD_ID,
  },
  auth: {
    username: process.env.ELASTIC_CLOUD_USERNAME,
    password: process.env.ELASTIC_CLOUD_PASSWORD,
  },
});

const fetchDataFromFirestore = async () => {
  const allCarsData = await getAllCarModels(process.env.COLLECTION_NAME);
  let allCarsDataFlatten = [];
  allCarsData.map((CarsByBrand) => {
    const brandName = CarsByBrand.brand_name;
    CarsByBrand.car_models.map((carInfo) => {
      allCarsDataFlatten.push({
        ...carInfo,
        brand_name: brandName,
      });
    });
  });
  allCarsDataFlatten.forEach((item) => {
    // prices fetched from firebase format "$19.99", now convert
    // to float
    item.price = parseFloat(item.price.substring(1)).toFixed(2);
  });

  return allCarsDataFlatten;
};

// create an index
// DON'T FORGET AWAIT KEYWORD

const initializeIndex = async () =>
  await client.indices.create({
    index: "car-models",
    body: {
      settings: {
        number_of_shards: 3,
        number_of_replicas: 0,
      },
      mappings: {
        properties: {
          price: {
            type: "float",
          },
        },
      },
    },
  });

createDataInIndex = async (data) => {
  const result = await client.helpers.bulk({
    datasource: data,
    onDocument(doc) {
      return {
        create: { _index: "car-models" },
      };
    },
    onDrop(doc) {
      console.log("cant index this ", doc);
    },
    wait: 3200,
  });
};

const createIndexElasticSearch = async () => {
  const datasource = await fetchDataFromFirestore();
  await initializeIndex();
  await createDataInIndex(datasource);
};

// createIndexElasticSearch();

const doStuff = async () => {
  const result = await client.search({
    query: {
      range: {
        price: {
          gte: 10,
          lte: 40,
        },
      },
    },
  });

  return result;
};

// doStuff();

const brandPriceFilterSort = async ({
  searchQuery,
  minPrice,
  maxPrice,
  brand,
  sortOrder,
}) => {
  const queryES = {
    bool: {
      must: [
        // Common conditions (e.g., price range, sorting)
      ],
    },
  };

  if (searchQuery) {
    queryES.bool.must.push({
      bool: {
        minimum_should_match: 1,
        should: [
          {
            match: {
              description: {
                query: searchQuery,
                fuzziness: "AUTO",
              },
            },
          },
          {
            match: {
              model_brand: {
                query: searchQuery,
                fuzziness: "AUTO",
              },
            },
          },
        ],
        filter: {
          range: {
            price: {
              gte: minPrice,
              lte: maxPrice,
            },
          },
        },
      },
    });
  }

  if (brand) {
    queryES.bool.must.push({
      match: {
        brand_name: brand,
      },
    });
  }

  if (minPrice >= 0 && maxPrice) {
    queryES.bool.filter = {
      range: {
        price: {
          gte: minPrice,
          lte: maxPrice,
        },
      },
    };
  }

  const result = await client.search({
    size: 40,
    query: queryES,
    sort: [
      {
        price: {
          order: sortOrder,
        },
      },
    ],
  });
  return result.hits.hits;
};

// brandPriceFilterSort({
//   searchQuery: "fun",
//   minPrice: 0,
//   maxPrice: 30,
//   brand: undefined,
//   sortOrder: "asc",
// });

module.exports = {
  brandPriceFilterSort,
};

// old QUERY
// const result = await client.search({
//   query: {
//     bool: {
//       must: [
//         {
//           bool: {
//             minimum_should_match: 1,
//             should: [
//               {
//                 match: {
//                   description: {
//                     query: searchQuery,
//                     fuzziness: "AUTO",
//                   },
//                 },
//               },
//               {
//                 match: {
//                   model_brand: {
//                     query: searchQuery,
//                     fuzziness: "AUTO",
//                   },
//                 },
//               },
//             ],
//             filter: {
//               range: {
//                 price: {
//                   gte: minPrice,
//                   lte: maxPrice,
//                 },
//               },
//             },
//           },
//         },
//         {
//           match: {
//             brand_name: brand,
//           },
//         },
//       ],
//     },
//   },
//   sort: [
//     {
//       price: {
//         order: sortOrder,
//       },
//     },
//   ],
// });
