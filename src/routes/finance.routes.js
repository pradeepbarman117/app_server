const express = require('express');
const router = express.Router();


const requestRoute = require('./finance/request/request.routes');
const processRoute = require('./finance/process/process.routes');
const balanceRoute = require('./finance/balance/balance.routes');


router.use(requestRoute);
router.use(processRoute);
router.use(balanceRoute);


module.exports = router