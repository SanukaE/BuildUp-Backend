import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import fs from 'fs';
import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import dotenv from 'dotenv';

import requestsRouter from './routes/requests.js';
import staffRouter from './routes/staff.js';

dotenv.config();

//Setting up Database (MongoDB)
mongoose.connect(process.env.MONGO_URI, { dbName: 'BuildUp' });
const db = mongoose.connection;

db.on('error', function (error) {
  console.error('Database connection error:', error.message);
});

db.on('open', function () {
  console.log('Database connected!');
});

//Setting up express
const app = express();
const port = process.env.PORT || 10000;

app.use(express.json());
app.use(
  cors({
    allowedHeaders: 'Content-Type',
    methods: ['POST', 'GET'],
    origin: '*',
  })
);

app.use('/requests', requestsRouter);
app.use('/staff', staffRouter);

//Setting up mail service (nodemailer)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'no.reply.buildup@gmail.com',
    pass: process.env.MAIL_PASSWORD,
  },
});

function loadEmailTemplate(fileName, values) {
  const filePath = `./assets/emailTemplates/${fileName}.html`;
  const source = fs.readFileSync(filePath, 'utf-8').toString();
  const template = handlebars.compile(source);
  return template(values);
}

function sendMail(mailParams, templateName, receiversEmail, subject) {
  const filledHTML = loadEmailTemplate(templateName, mailParams);

  const mailOptions = {
    from: 'no.reply.buildup@gmail.com',
    to: receiversEmail,
    subject: subject,
    html: filledHTML,
  };

  transporter.sendMail(mailOptions, function (error) {
    if (error) console.error('Error when sending an email:', error.message);
  });
}

app.listen(port, function () {
  console.log(`Listening on ${port}`);
});

export default sendMail;
