import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({
  email: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  address: { type: String, required: true },
  phoneNo: { type: String, required: true },
  designID: { type: String, required: true },
  isAccepted: { type: Boolean, default: false },
  isDeclined: { type: Boolean, default: false },
});

export default mongoose.model('Request', requestSchema);
