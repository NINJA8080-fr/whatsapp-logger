import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGO_URI;

export async function connectDB() {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ تم الاتصال بقاعدة البيانات MongoDB بنجاح');
  } catch (error) {
    console.error('❌ فشل الاتصال بقاعدة البيانات:', error);
  }
}
