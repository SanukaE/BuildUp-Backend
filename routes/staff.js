import express from 'express';
import { generateSecurePassword } from 'password-guardian';
import sendMail from '../server.js';
import Staff from '../models/staff.js';

const router = express.Router();

router.get('/', async function (req, res) {
  try {
    const staff = await Staff.find();
    res.status(200).json(staff);
  } catch (error) {
    console.error('Error getting all staff:', error.message);
    res.status(500).send('Failed');
  }
});

router.get('/:id', async function (req, res) {
  try {
    const staffID = req.params.id;
    const staff = await Staff.findById(staffID);
    res.status(200).json(staff);
  } catch (error) {
    console.error('Error getting staff with ID:', error.message);
    res.status(500).send('Failed');
  }
});

router.post('/register', async function (req, res) {
  try {
    const { firstName, lastName, avatarURL, email, isAdmin } = req.body;
    const staffPassword = generateSecurePassword({ length: 12 });

    const newStaff = {
      firstName: firstName,
      lastName: lastName,
      avatarURL: avatarURL,
      email: email,
      password: staffPassword,
      isAdmin: isAdmin,
    };

    await Staff.create(newStaff);

    const emailParams = {
      first_name: firstName,
      email: email,
      password: staffPassword,
    };

    sendMail(emailParams, 'newStaff', email, 'Welcome to BuildUp!');

    res.status(201).send('Done');
  } catch (error) {
    console.error('Error while registering a staff:', error.message);
    res.status(500).send('Failed');
  }
});

router.put('/:id', async function (req, res) {
  try {
    const staffID = req.params.id;
    const { firstName, lastName, avatarURL, email, password } =
      await Staff.findByIdAndUpdate(staffID, req.body);

    const emailParams = {
      first_name: firstName,
      last_name: lastName,
      avatarURL: avatarURL,
      email: email,
      password: password,
    };

    sendMail(emailParams, 'updateStaff', email, 'Staff Account Update!');

    res.status(200).send('Done');
  } catch (error) {
    console.error('Error updating a staff:', error.message);
    res.status(500).send('Failed');
  }
});

router.delete('/delete/:id', async function (req, res) {
  try {
    const staffID = req.params.id;
    await Staff.findByIdAndDelete(staffID);
    res.status(200).send('Done');
  } catch (error) {
    console.error('Error deleting a staff:', error.message);
    res.status(500).send('Failed');
  }
});

export default router;
