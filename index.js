const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();


// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ee7hj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    
    try{
        await client.connect();
        const furnitureCollection = client.db('arredoWarehouse').collection('furniture');


        app.get('/furnitures', async(req, res) => {
            const query = req.query;
            const cursor = furnitureCollection.find(query);
            const furnitures = await cursor.toArray();
            res.send(furnitures);
        });

        app.post('/furniture', async(req, res) => {
            const newFurniture = req.body;
            const result = await furnitureCollection.insertOne(newFurniture);
            res.send(result);
        })
    }
    finally{
        // await client.close();
    }
    

}

run().catch(console.dir);


// testing root server
app.get('/', (req, res) => {
    res.send("Warehouse Server is running!");
});

// listening the port
app.listen(port, () => {
    console.log("Listening to port", port);
});