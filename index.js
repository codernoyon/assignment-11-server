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
        const popularBlogCollection = client.db('arredoWarehouse').collection('popularBlog');

        // get all questions
        app.get('/question', async (req, res) => {
            const query = req.query;
            const cursor = questionCollection.find(query);
            const questions = await cursor.toArray();
            if(!questions.length){
                return res.send({success: false, error: "No data found"});
                }
            res.send({success: true, data: questions,});
        });

        // get all popular blogs
        app.get('/popularBlog', async(req, res) => {
            const query = req.query;
            const cursor = popularBlogCollection.find();
            const popularBlogs = await cursor.toArray();
            if(!popularBlogs.length){
            return res.send({success: false, error: "No data found"});
            }
            res.send({success: true, data: popularBlogs});
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

        // update product 
        app.put('/product/:id', async(req, res) => {
            const id = req.params.id;
            const updatedQuantity = req.body.quantity;
            const filter = {_id: ObjectId(id)};
            const options = {upsert: true};
            const updatedProduct = {
                $set: {
                    quantity: updatedQuantity,
                }
            };
            const result = await furnitureCollection.updateOne(filter, updatedProduct, options);
            res.send({success: true, message: 'Updated Succesfully', result});
        })

        // get my items
        app.get('/myItem', async (req, res) => {
            const userEmail = req.query.email;
            const limit = parseInt(req.query.limit);
            const pageNumber = parseInt(req.query.pageNumber);
            const query = {userEmail};
            const cursor = furnitureCollection.find(query);
            const myItems = await cursor.skip(limit * pageNumber).limit(limit).toArray();
            const count = await myItems.length;
            if (!myItems.length) {
                return res.send({ success: false, error: "No product found" })
            }

            res.send({ success: true, data: myItems, count: count })
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