const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();


// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ee7hj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {

    try {
        await client.connect();
        const questionCollection = client.db('arredoWarehouse').collection('question');
        const furnitureCollection = client.db('arredoWarehouse').collection('furniture');

        // get all questions
        app.get('/questions', async (req, res) => {
            const query = req.query;
            const cursor = questionCollection.find(query);
            const questions = await cursor.toArray();
            res.send(questions);
        });

        // get all products
        app.get('/product', async (req, res) => {
            const limit = parseInt(req.query.limit);
            const pageNumber = parseInt(req.query.pageNumber);
            const query = {};
            const cursor = furnitureCollection.find(query);
            const products = await cursor.skip(limit * pageNumber).limit(limit).toArray();
            const count = await furnitureCollection.estimatedDocumentCount();
            if (!products.length) {
                return res.send({ success: false, error: "No product found" })
            }

            res.send({ success: true, data: products, count: count })

        });

        // get product full details
        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await furnitureCollection.findOne(query);
            res.send(product);
        });


        // add new product 
        app.post('/product', async (req, res) => {
            const newProduct = req.body;
            if (!newProduct.userEmail) {
                return res.send({ success: false, error: "Please provide use full details" })
            }
            const result = await furnitureCollection.insertOne(newProduct);
            res.send({ success: true, message: "Succesfully Added", result });
        });

        // delete single product

        app.delete('/product/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await furnitureCollection.deleteOne(query);
            res.send({success: true, message: "Deleted Succesfully", result});

        });

        // get my items
        app.get('/myItem', async (req, res) => {
            const userEmail = req.query.email;
            const limit = parseInt(req.query.limit);
            const pageNumber = parseInt(req.query.pageNumber);
            const query = {userEmail};
            const cursor = furnitureCollection.find(query);
            const muItems = await cursor.skip(limit * pageNumber).limit(limit).toArray();
            const count = await furnitureCollection.estimatedDocumentCount();
            if (!muItems.length) {
                return res.send({ success: false, error: "No product found" })
            }

            res.send({ success: true, data: muItems, count: count })
        });
    }
    finally {
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