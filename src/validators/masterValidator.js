const Joi = require('joi');

// Define the Joi schema for the admin creation request
const masterSchema = Joi.object({
    name: Joi.string().min(3).max(16).required(), // Name should be between 3 and 16 characters
    email: Joi.string().email().required(), // Email should be valid
    password: Joi.string().min(8).max(30).required(), // Password should be between 8 and 30 characters
    passcode: Joi.string().min(4).max(4).required(), // Passcode should be at least 4 characters
    adminId:Joi.string().min(1).max(2).required(),
    percent:Joi.string().min(1).max(3).required(),
}).options({ abortEarly: false });  // Collect all validation errors

module.exports = masterSchema
