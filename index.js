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
    
    try{
        await client.connect();
        const furnitureCollection = client.db('arredoWarehouse').collection('furniture');
        const questionCollection = client.db('arredoWarehouse').collection('question');
        
        app.get('/questions', async(req, res) => {
            const query = req.query;
            const cursor = questionCollection.find(query);
            const questions = await cursor.toArray();
            res.send(questions);
        });

        app.get('/product', async(req, res) => {
            const size = parseInt(req.query.size);
            const query = {};
            const cursor = furnitureCollection.find(query);
            let products;
            if(size){
                products = await cursor.limit(size).toArray();
            }else{
                products = await cursor.toArray();
                
            }
            res.send(products); 
            
        });

        app.get('/product/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const product = await furnitureCollection.findOne(query);
            res.send(product);
        })

        app.post('/product', async(req, res) => {
            const newProduct = req.body;
            if(!newProduct.name){
                return res.send({success: false, error: 'Please Provide all data'})
            }
            const result = await furnitureCollection.insertOne(newProduct);
            res.send({success: true, message: 'Succesfully inserted', result});
        });
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