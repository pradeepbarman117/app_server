const Joi = require('joi');


// Define the Joi schema for the admin creation request
const userSchema = Joi.object({
    userId: Joi.string().min(6).max(16).required(), // Email should be valid
    password: Joi.string().min(8).max(16).required(), // Password should be between 8 and 30 characters
    passcode: Joi.string().min(4).max(4).required(), // Passcode should be at least 4 characters
}).options({ abortEarly: false });  // Collect all validation errors

module.exports = userSchema;