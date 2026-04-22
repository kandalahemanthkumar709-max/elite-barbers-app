const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['customer', 'barber', 'admin'],
        default: 'customer'
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true
    },
    profileImage: {
        type: String
    },
    bio: {
        type: String
    },
    specialties: [{
        type: String
    }]
}, { timestamps: true });

const User = model('User', userSchema);

module.exports = User;
