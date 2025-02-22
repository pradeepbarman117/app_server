const Joi = require('joi');


const adminFinanceSchema = Joi.object({
    id: Joi.number().required(),
    amount: Joi.number().required(),
}).options({abortEarly:false});

module.exports = adminFinanceSchema