const express = require('express');
const router = express.Router();


const sportList = require('./odds/list/sport.routes');


router.use(sportList);


module.exports = router