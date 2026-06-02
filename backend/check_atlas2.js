require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User.model');

async function check() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const users = await User.find({ resetPasswordCode: { $exists: true, $ne: null } });
    if(users.length === 0) console.log("No users with reset codes found.");
    users.forEach(u => {
      console.log(`Found! Email: ${u.email}`);
      console.log(`resetPasswordCode: ${u.resetPasswordCode}`);
      console.log(`resetPasswordExpires: ${u.resetPasswordExpires}`);
      console.log(`Current Time: ${new Date()}`);
    });
    console.log("Check complete.");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
