require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User.model');

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/immosmart');
    const users = await User.find({ resetPasswordCode: { $exists: true, $ne: null } });
    console.log("Users with codes:");
    users.forEach(u => {
      console.log(`Email: ${u.email}`);
      console.log(`Code: ${u.resetPasswordCode}`);
      console.log(`Expires: ${u.resetPasswordExpires}`);
      console.log(`Current Time: ${new Date()}`);
      console.log('---');
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
