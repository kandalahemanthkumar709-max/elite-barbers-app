const ShopSetting = require('../models/settings-model');

const settingsCtrl = {};

settingsCtrl.getSettings = async (req, res) => {
    try {
        let settings = await ShopSetting.findOne();
        if (!settings) {
            // Seed defaults if missing
            settings = await ShopSetting.create({ openTime: 9, closeTime: 20 });
        }
        res.json(settings);
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

settingsCtrl.updateSettings = async (req, res) => {
    try {
        const { openTime, closeTime } = req.body;
        let settings = await ShopSetting.findOne();
        
        if (!settings) {
            settings = new ShopSetting({ openTime, closeTime });
            await settings.save();
        } else {
            settings.openTime = openTime || settings.openTime;
            settings.closeTime = closeTime || settings.closeTime;
            await settings.save();
        }
        
        res.json(settings);
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = settingsCtrl;
