import express from 'express';
import sendMail from '../server.js';
import Request from '../models/requests.js';

const router = express.Router();

router.get('/', async function (req, res) {
  try {
    const requests = await Request.find();
    res.status(200).json(requests);
  } catch (error) {
    console.error('Error during getting all requests:', error.message);
    res.status(500).send('Failed');
  }
});

router.get('/:id', async function (req, res) {
  try {
    const requestID = req.params.id;
    const request = await Request.findById(requestID);
    res.status(200).json(request);
  } catch (error) {
    console.error('Error when getting request:', error.message);
    res.status(500).send('Failed');
  }
});

router.post('/create', async function (req, res) {
  try {
    const newRequest = req.body;

    await Request.create(newRequest);

    const emailParams = {
      email: newRequest.email,
      first_name: newRequest.firstName,
      last_name: newRequest.lastName,
      address: newRequest.address,
      phone_no: newRequest.phoneNo,
      design_id: newRequest.designID,
    };

    sendMail(
      emailParams,
      'newRequest',
      newRequest.email,
      'We have received your request!'
    );

    res.status(201).send('Done');
  } catch (error) {
    console.error('Error when creating new request:', error.message);
    res.status(500).send('Failed');
  }
});

router.put('/accept/:id', async function (req, res) {
  try {
    const requestID = req.params.id;
    const request = await Request.findByIdAndUpdate(requestID, {
      isAccepted: true,
    });

    const emailParams = {
      email: request.email,
      first_name: request.firstName,
      last_name: request.lastName,
      address: request.address,
      phone_no: request.phoneNo,
      design_id: request.designID,
    };

    sendMail(
      emailParams,
      'requestAccept',
      request.email,
      'House Request Approved!'
    );

    res.status(201).send('Done');
  } catch (error) {
    console.error('Error when updating request:', error.message);
    res.status(500).send('Failed');
  }
});

router.put('/decline/:id', async function (req, res) {
  try {
    const requestID = req.params.id;
    const request = await Request.findByIdAndUpdate(requestID, {
      isDeclined: true,
    });

    const emailParams = {
      email: request.email,
      first_name: request.firstName,
      last_name: request.lastName,
      address: request.address,
      phone_no: request.phoneNo,
      design_id: request.designID,
    };

    sendMail(
      emailParams,
      'requestDecline',
      request.email,
      'House Request Rejected!'
    );

    res.status(201).send('Done');
  } catch (error) {
    console.error('Error when updating request:', error.message);
    res.status(500).send('Failed');
  }
});

router.delete('/:id', async function (req, res) {
  try {
    const requestID = req.params.id;
    await Request.findByIdAndDelete(requestID);
    res.status(200).send('Done');
  } catch (error) {
    console.error('Error when deleting request:', error.message);
    res.status(500).send('Failed');
  }
});

export default router;
