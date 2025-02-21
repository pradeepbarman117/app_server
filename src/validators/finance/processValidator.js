const Joi = require('joi');

// Define the Joi schema for the request creation request
const processSchema = Joi.object({
    requestId: Joi.number().required(''),
    status: Joi.valid('pending', 'approved', 'rejected').required(),
    comments: Joi.string().required('comment is required'),
}).options({ abortEarly: false });  // Collect all validation errors

module.exports = processSchema;
