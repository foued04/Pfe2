require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User.model');

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/immosmart');
    const user = await User.findOne({ email: 'jammes.hollmann@allfreemail.net' });
    if(user) {
      console.log('User found! Expiry:', user.resetPasswordExpires);
      const now = Date.now();
      console.log('Is Date.now() > Expires?', now > user.resetPasswordExpires);
      const queryUser = await User.findOne({ email: user.email, resetPasswordExpires: { $gt: Date.now() } });
      console.log('Found with $gt: Date.now()?', !!queryUser);
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
