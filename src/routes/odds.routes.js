const express = require('express');
const router = express.Router();


const sportList = require('./odds/list/sport.routes');
const odiRoutes = require('./odds/cricket/odi/odi.routes');


router.use('/all',sportList);


// cricket

// ICC Champ
router.use('/cricket',odiRoutes)


module.exports = router