const express = require('express');
const router = express.Router();


const requestRoute = require('./finance/request/request.routes');
const processRoute = require('./finance/process/process.routes');


router.use(requestRoute);
router.use(processRoute);


module.exports = router