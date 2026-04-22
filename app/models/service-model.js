const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const serviceSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    duration: {
        type: Number, // in minutes
        required: true,
        min: 15
    },
    category: {
        type: String,
        required: true,
        enum: ['Haircuts', 'Beard & Shave', 'Facial & Spa', 'Combos', 'Color & Chemical'],
        default: 'Haircuts'
    },
    image: {
        type: String // URL to an image representing the service
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const Service = model('Service', serviceSchema);

module.exports = Service;
