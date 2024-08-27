import express from "express";
import { MongoClient } from "mongodb";
import cors from "cors";
import emailjs from "@emailjs/browser";

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);
let collection;

async function connectToDatabase() {
    try {
        await client.connect();
        const database = client.db("BuildUp");
        console.log("Connected to database!");

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

emailjs.init({ privateKey: process.env.PRIVATE_KEY, publicKey: process.env.PUBLIC_KEY });

await connectToDatabase();

app.post("/requests/create", async function(req, res) {
    try {
        const newRequest = req.body;

        await collection.insertOne(newRequest);
        res.send("Request added to database.");

        const emailParams = {
            email: newRequest.email,
            first_name: newRequest.firstName,
            last_name: newRequest.lastName,
            address: newRequest.address,
            phone_no: newRequest.phoneNo,
            design_id: newRequest.designID
        };

        await emailjs.send("service_9yknyip", "template_baqrpdl", emailParams);
    } catch(error) {
        console.error("Error when creating new request:", error.message);

        res.send("Request failed to be added to database.");
    }
});

app.listen(port, function() {
    console.log(`Listening on ${port}`);
});

client.on('connectionClosed', async function(event) {
    console.log("Database connection closed. Attempting to reconnect...");
    await connectToDatabase();
});

client.on('error', async function(error) {
    console.error("Database connection error:", error.message);
    await connectToDatabase();
});

process.on('SIGINT', async () => {
    console.log('Closing database connection.');
    await client.close();
    process.exit(0);
});