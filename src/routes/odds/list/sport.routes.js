const { sportControllers } = require('../../../controllers/odds/cricket/sportsControllers');

const router = require('express').Router();


router.get('/get-sport-list',sportControllers);


module.exports = router