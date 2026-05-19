import dns from 'dns';
import mongoose from 'mongoose';

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai-work-simulator';

  // Some ISP DNS resolvers fail MongoDB Atlas SRV lookups (querySrv ECONNREFUSED).
  if (uri.startsWith('mongodb+srv://')) {
    dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
  }

  try {
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    if (error.message.includes('ECONNREFUSED') && uri.includes('127.0.0.1')) {
      console.error('Tip: Start local MongoDB or set MONGO_URI in server/.env to your Atlas connection string.');
    }
    if (error.message.includes('querySrv')) {
      console.error('Tip: Atlas DNS lookup failed. Check internet/VPN or use a standard (non-SRV) connection string from MongoDB Atlas.');
    }
    process.exit(1);
  }
};

export default connectDB;
