const Joi = require('joi');

// Middleware to validate incoming requests based on Joi schema
const validateRequest = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });

        if (error) {
            return res.status(400).json({
                message: error.details.map((detail) => detail.message).join(', '), // Collect all validation errors
            });
        }

        next();
    };
};

module.exports = validateRequest;
