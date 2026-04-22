const mongoose = require('mongoose');

const shopSettingsSchema = new mongoose.Schema({
    openTime: { type: Number, required: true, default: 9 }, // 9 AM
    closeTime: { type: Number, required: true, default: 20 } // 8 PM (20:00)
}, { timestamps: true });

module.exports = mongoose.model('ShopSetting', shopSettingsSchema);
