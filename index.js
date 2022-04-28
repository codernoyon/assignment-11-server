const express = require('express');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5001;
const app = express();


// middleware
app.use(cors());
app.use(express.json());






// testing root server
app.get('/', (req, res) => {
    res.send("Warehouse Server is running!");
});

app.listen(port, () => {
    console.log("Listening to port", port);
});