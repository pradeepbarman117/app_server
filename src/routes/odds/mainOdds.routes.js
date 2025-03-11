const express = require('express');
const router = express.Router();
const { mainOddsControllers } = require('../../controllers/odds/mainOddsControllers');

// Route to get odds for a specific sport
router.get('/odds/:sport', mainOddsControllers.getOddsForSport);

// Route to get odds for all sports
router.get('/odds', mainOddsControllers.getOddsForAllSports);

module.exports = router;