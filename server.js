import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ متصل بقاعدة البيانات MongoDB بنجاح"))
.catch(err => console.error("❌ خطأ في الاتصال بقاعدة البيانات:", err));
import express from 'express'
const app = express()
const port = process.env.PORT || 3000

app.get('/', (req, res) => {
  res.send('✅ البوت شغال من سيرفر Railway!')
})

app.listen(port, () => {
  console.log(`🚀 السيرفر يعمل على http://localhost:${port}`)
})
