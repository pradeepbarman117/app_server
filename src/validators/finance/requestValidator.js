const Joi = require('joi');

// Define the Joi schema for the request creation request
const requestSchema = Joi.object({
    amount: Joi.number().greater(500, 'Minimum 500 amount can be requested').less(10000, 'Maximum 10,000 amount can be requested').precision(2).required('amount is required'),
}).options({ abortEarly: false });  // Collect all validation errors

module.exports = requestSchema;
