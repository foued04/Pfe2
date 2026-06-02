require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User.model');

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/immosmart');
    const users = await User.find({});
    users.forEach(u => {
      if (u.verificationCode === '864109' || u.resetPasswordCode === '864109') {
        console.log(`Found! Email: ${u.email}`);
        console.log(`verificationCode: ${u.verificationCode}`);
        console.log(`resetPasswordCode: ${u.resetPasswordCode}`);
      }
    });
    console.log("Check complete.");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
