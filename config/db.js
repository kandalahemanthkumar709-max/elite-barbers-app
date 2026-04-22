const mongoose = require('mongoose');

const configureDB = async () => {
    try {
        const db = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/elite-barbers');
        console.log('Connected to Elite Barbers DB');
    } catch (err) {
        console.log('Error connecting to DB', err);
    }
};

module.exports = configureDB;
