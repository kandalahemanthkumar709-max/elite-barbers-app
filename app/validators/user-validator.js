const Joi = require('joi');

const userRegistrationSchema = Joi.object({
    username: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('customer', 'barber', 'admin'),
    phoneNumber: Joi.string().min(10).max(15).required(),
    bio: Joi.string().optional(),
    profileImage: Joi.string().optional(),
    specialties: Joi.array().items(Joi.string()).optional()
});

const userLoginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

module.exports = {
    userRegistrationSchema,
    userLoginSchema
};
