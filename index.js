const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("CRUD Server is running");
});

app.listen(port, () => {
  console.log(`CRUD Server is running ${port}`);
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.buwy59t.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const itemCollection = client.db("artcraftDB").collection("item");
    const subCategoryCollection = client.db("artcraftDB").collection("subcategories");

    app.get("/items", async (req, res) => {
      const cursor = itemCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });


    app.get("/items/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await itemCollection.findOne(query);
      res.send(result);
    });


    app.get("/itemsByEmail/:email/:filter", async (req, res) => {
      const email = req.params.email;
      const filter = req.params.filter;
      let query;
      if(filter==="All")
      {
        query = { userEmail: email };
      }
      else if(filter==="Yes" || filter==="No")
      {
        query = { userEmail: email , customization: filter};
      }
     
      
      const cursor = itemCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });


    app.get("/itemsBySubcategory/:subcategoryName", async (req, res) => {
      const subcategoryName = req.params.subcategoryName;
      const query = { subcategory_Name: subcategoryName };  
      const cursor = itemCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });


    app.get("/subcategories", async (req, res) => {
      const cursor = subCategoryCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    

    app.post("/items", async (req, res) => {
      const newItem = req.body;
      const result = await itemCollection.insertOne(newItem);
      res.send(result);
    });

    app.put("/update/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedItem = req.body;
      const updateDoc = {
        $set: {
          image: updatedItem.image,
          item_name: updatedItem.item_name,

          subcategory_Name: updatedItem.subcategory_Name,

          short_description: updatedItem.short_description,

          price: updatedItem.price,

          rating: updatedItem.rating,

          customization: updatedItem.customization,

          processing_time: updatedItem.processing_time,

          stockStatus: updatedItem.stockStatus,
        },
      };

      const result = await itemCollection.updateOne(filter,updateDoc,options);
      res.send(result);
    });


    app.delete("/items/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await itemCollection.deleteOne(query);
      res.send(result);
    });



    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
