import express from "express";
import { MongoClient } from "mongodb";
import cors from "cors";

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);
let collection;

async function connectToDatabase() {
    try {
        await client.connect();
        const database = client.db("BuildUp");
        collection = database.collection("requests");
    } catch(error) {
        console.error("Error when trying to connect to DB:", error.message);
        await connectToDatabase();
    }
}

const app = express();
const port = process.env.PORT || 10000;

app.use(express.json());
app.use(cors({
    allowedHeaders: "Content-Type",
    methods: ["POST", "GET"],
    origin: "*"
}));

app.post("/requests/create", async function(req, res) {
    await connectToDatabase();

    try {
        await collection.insertOne(req.body);

        res.status(200).send("Request added to database.");
    } catch(error) {
        console.error("Error when creating new request:", error.message);

        res.status(500).send("Request failed to be added to database.");
    } finally {
        await client.close();
    }
});

app.listen(port, function() {
    console.log(`Listening on ${port}`);
});