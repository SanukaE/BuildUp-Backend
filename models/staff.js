import mongoose from 'mongoose';

const staffSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  avatarURL: {
    type: String,
    default:
      'https://www.pphfoundation.ca/wp-content/uploads/2018/05/default-avatar.png',
  },
  email: { type: String, required: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
});

export default mongoose.model('Staff', staffSchema);
