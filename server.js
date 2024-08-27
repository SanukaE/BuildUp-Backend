import express from "express";
import { MongoClient } from "mongodb";
import cors from "cors";
import fs from "fs";
import nodemailer from "nodemailer";
import handlebars from "handlebars";

//Setting up Database (MongoDB)
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

//Setting up express
const app = express();
const port = process.env.PORT || 10000;

app.use(express.json());
app.use(cors({
    allowedHeaders: "Content-Type",
    methods: ["POST", "GET"],
    origin: "*"
}));

//Setting up mail service (nodemailer)
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "no.reply.buildup@gmail.com",
        pass: process.env.MAIL_PASSWORD
    }
});

function loadEmailTemplate(fileName, values) {
    const filePath = `./assets/emailTemplates/${fileName}.html`;
    const source = fs.readFileSync(filePath, "utf-8").toString();
    const template = handlebars.compile(source);
    return template(values);
}

function sendMail(mailParams, templateName, receiversEmail, subject) {
    const filledHTML = loadEmailTemplate(templateName, mailParams);

    const mailOptions = {
        from: "no.reply.buildup@gmail.com",
        to: receiversEmail,
        subject: subject,
        html: filledHTML
    };

    transporter.sendMail(mailOptions, function(error) {
        if(error)
            console.error("Error when sending an email:", error.message);
    });
}

await connectToDatabase();

app.post("/requests/create", async function(req, res) {
    try {
        const newRequest = req.body;

        await collection.insertOne(newRequest);

        const emailParams = {
            email: newRequest.email,
            first_name: newRequest.firstName,
            last_name: newRequest.lastName,
            address: newRequest.address,
            phone_no: newRequest.phoneNo,
            design_id: newRequest.designID
        };        

        sendMail(emailParams, "newRequest", newRequest.email, "We have received your request!");

        res.send("Finished");
    } catch(error) {
        console.error("Error when creating new request:", error.message);
        res.send("Incomplete");
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