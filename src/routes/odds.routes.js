const express = require('express');
const router = express.Router();


const sportList = require('./odds/list/sport.routes');
const odiRoutes = require('./odds/cricket/odi/odi.routes');
const betRoutes = require('./odds/bet.routes');
const iplRoutes = require('./odds/cricket/ipl/ipl.routes');
const mainOddsRoute = require('./odds/mainOdds.routes');


// Football
const football = require('./odds/football/football.routes');


// Baseball
const baseballRoute = require('./odds/baseball/baseball.routes');




// Place Bet
router.use('/betting',betRoutes);

router.use('/all',sportList);


// cricket

// ICC Champ
router.use('/cricket',odiRoutes);
router.use('/football',football);
router.use('/baseball',baseballRoute);
router.use('/cricket',iplRoutes);
router.use('/all',mainOddsRoute);




module.exports = router