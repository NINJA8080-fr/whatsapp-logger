import 'dotenv/config';
import express from 'express';
import fs from 'fs-extra';
import mongoose from 'mongoose';

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const MessageSchema = new mongoose.Schema({
  from: String,
  message: String,
  timestamp: Date
});
const Message = mongoose.model('Message', MessageSchema);

app.get('/', async (req, res) => {
  const logs = await Message.find().sort({ timestamp: -1 }).limit(100);
  res.json(logs);
});

app.listen(PORT, () => {
  console.log(`📡 Server listening on http://localhost:${PORT}`);
});
