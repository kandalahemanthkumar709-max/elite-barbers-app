const User = require('../models/user-model');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { userRegistrationSchema, userLoginSchema } = require('../validators/user-validator');

const usersCtrl = {};

usersCtrl.register = async (req, res) => {
    const { error } = userRegistrationSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ errors: error.details.map(d => d.message) });
    }

    try {
        const { username, email, password, phoneNumber, bio, profileImage, specialties } = req.body;
        const salt = await bcryptjs.genSalt();
        const hashedPassword = await bcryptjs.hash(password, salt);
        
        // SECURITY: Always force role to 'customer' for public registration
        const user = new User({ 
            username, 
            email, 
            password: hashedPassword, 
            role: 'customer', 
            phoneNumber, 
            bio, 
            profileImage, 
            specialties 
        });
        await user.save();

        const tokenData = { id: user._id, role: user.role };
        const token = jwt.sign(tokenData, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ user, token: `Bearer ${token}` });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ error: 'Email, username, or phone number already in use' });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

usersCtrl.login = async (req, res) => {
    const { error } = userLoginSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ errors: error.details.map(d => d.message) });
    }

    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'Invalid email or password' });
        }

        const isMatch = await bcryptjs.compare(password, user.password);
        if (!isMatch) {
            return res.status(404).json({ error: 'Invalid email or password' });
        }

        const tokenData = { id: user._id, role: user.role };
        const token = jwt.sign(tokenData, process.env.JWT_SECRET, { expiresIn: '7d' });
        
        // Return user data (safely) alongside the token
        const userResponse = {
            id: user._id,
            username: user.username,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role
        };
        
        res.json({ token: `Bearer ${token}`, user: userResponse });
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

usersCtrl.account = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

usersCtrl.listBarbers = async (req, res) => {
    try {
        const barbers = await User.find({ role: 'barber' }).select('-password');
        res.json(barbers);
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

usersCtrl.updateProfile = async (req, res) => {
    try {
        const { username, email, phoneNumber, currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        // If changing password, verify current password first
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ error: 'Current password is required to set a new password' });
            }
            const isMatch = await bcryptjs.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ error: 'Current password is incorrect' });
            }
            const salt = await bcryptjs.genSalt();
            user.password = await bcryptjs.hash(newPassword, salt);
        }

        if (username)    user.username    = username;
        if (email)       user.email       = email;
        if (phoneNumber) user.phoneNumber = phoneNumber;

        await user.save();
        const updated = await User.findById(req.user.id).select('-password');
        res.json(updated);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ error: 'Email or username already in use' });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = usersCtrl;
