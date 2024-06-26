const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("The server is running");
});

app.listen(port, () => {
  console.log(`The server is running on` + port);
});

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.rqebvmt.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    /**
     * Collections
     */
    const restaurantCollection = client
      .db("Checkout")
      .collection("restaurants");
    const menuCollection = client.db("Checkout").collection("foodmenu");

    const socialMedia = client.db("Checkout").collection("social");

    const usersCollection = client.db("Checkout").collection("users");

    /**
     * API's
     */
    app.get("/allrestaurants", async (req, res) => {
      const query = {};
      const cursor = restaurantCollection.find(query);
      const restaurants = await cursor.toArray();
      res.send(restaurants);
    });

    app.get("/restaurents", async (req, res) => {
      const query = {
        location: "Mohammedpur",
        lowestPrice: { $lte: 200 },
        highestPrice: { $gte: 1000 },
        mainFoods: { $in: ["Fries"] },
      };
      const cursor = restaurantCollection.find(query);
      const restaurants = await cursor.toArray();
      res.send(restaurants);
    });

    /*Getting the resturants depending on User defined query */
    app.post("/getRestaurents", async (req, res) => {
      if (!req.body) {
        return res.send("No request body found");
      }

      const { foodKeys, location, startingPrice, highestPrice } = req.body;

      const query = {
        location: location,
        lowestPrice: { $lte: startingPrice },
        highestPrice: { $gte: highestPrice },
        mainFoods: { $in: foodKeys },
      };
      const limit = 10;
      const cursor = restaurantCollection.find(query).limit(limit);
      const restaurants = await cursor.toArray();
      res.send(restaurants);
    });

    app.get("/restaurentDetails", async (req, res) => {
      const id = req.query.id;
      const query = { _id: new ObjectId(id) };
      const rest_details = await restaurantCollection.findOne(query);
      res.send(rest_details);
    });

    /**
     * Add New Restaurant API
     */
    app.post("/addrestaurant", async (req, res) => {
      const newRest = req.body;
      const add_rest_to_db = await restaurantCollection.insertOne(newRest);
      res.send(add_rest_to_db);
    });

    app.post("/addfoodmenu", async (req, res) => {
      const newMenu = req.body;
      const add_food_menu_db = await menuCollection.insertOne(newMenu);
      res.send(add_food_menu_db);
    });

    app.post("/addsocial", async (req, res) => {
      const newSocial = req.body;
      const add_social_info_db = await socialMedia.insertOne(newSocial);
      res.send(add_social_info_db);
    });
    /**
     * Admin Side
     * Add New User(agent/admin)
     */
    app.post("/adduser", async (req, res) => {
      const newUser = req.body;
      const add_new_user = await usersCollection.insertOne(newUser);
      res.send(add_new_user);
    });

    app.get("/getuser-type", async (req, res) => {
      const query_email = req.query.email;
      const query_type = req.query.type;
      const query = { email: query_email, user_type: query_type };
      const get_user = await usersCollection
        .find(query)
        .project({ user_type: 1 })
        .toArray();
      res.send(get_user);
    });

    app.get("/get-all-users", async (req, res) => {
      const query = {};
      const show_data = {
        inital_pass: 0,
      };
      const get_all_users = await usersCollection
        .find(query)
        .project(show_data)
        .toArray();
      res.send(get_all_users);
    });
  } finally {
  }
}
run().catch(console.dir);
