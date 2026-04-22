const Joi = require('joi');

const bookingCreateSchema = Joi.object({
    barberId: Joi.string().hex().length(24).required(),
    serviceId: Joi.string().hex().length(24).required(),
    bookingDate: Joi.date().iso().required(),
    paymentMethod: Joi.string().valid('online', 'cash').required()
});

module.exports = {
    bookingCreateSchema
};
