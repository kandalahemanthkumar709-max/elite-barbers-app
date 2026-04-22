const Service = require('../models/service-model');

const servicesCtrl = {};

servicesCtrl.list = async (req, res) => {
    try {
        const services = await Service.find({ isActive: true });
        res.json(services);
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

servicesCtrl.create = async (req, res) => {
    try {
        const { name, description, price, duration, category } = req.body;
        const serviceData = { name, description, price, duration, category };
        
        if (req.file) {
            serviceData.image = req.file.path;
        }
        
        const service = new Service(serviceData);
        await service.save();
        res.status(201).json(service);
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

servicesCtrl.update = async (req, res) => {
    const { id } = req.params;
    try {
        const { name, description, price, duration, category, isActive } = req.body;
        const updateData = { name, description, price, duration, category, isActive };
        
        if (req.file) {
            updateData.image = req.file.path;
        }
        
        const service = await Service.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
        if (!service) {
            return res.status(404).json({ error: 'Service not found' });
        }
        res.json(service);
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

servicesCtrl.remove = async (req, res) => {
    const { id } = req.params;
    try {
        const service = await Service.findByIdAndDelete(id);
        if (!service) {
            return res.status(404).json({ error: 'Service not found' });
        }
        res.json(service);
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = servicesCtrl;
