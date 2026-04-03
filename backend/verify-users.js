const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/User.model');

const verifyExistingUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB.');

        const result = await User.updateMany(
            { isEmailVerified: { $exists: false } }, 
            { $set: { isEmailVerified: true } }
        );

        console.log(`Updated ${result.modifiedCount} users to isEmailVerified: true`);
        
        // Also verify the specific admin if it was already created with false
        const adminResult = await User.updateMany(
            { role: 'admin' },
            { $set: { isEmailVerified: true } }
        );
        console.log(`Ensured ${adminResult.modifiedCount} admins are verified.`);

        mongoose.connection.close();
        console.log('Done.');
    } catch (error) {
        console.error('Error updating users:', error);
        process.exit(1);
    }
};

verifyExistingUsers();
