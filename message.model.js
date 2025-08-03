import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  senderName: String,
  senderId: String,
  message: String,
  timestamp: Date
});

export default mongoose.model('Message', messageSchema);
