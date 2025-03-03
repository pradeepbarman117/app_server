const express = require('express');
const { footballControllers } = require('../../../controllers/odds/football/football.controllers');
const router = express.Router();

router.get('/americanfootbal/ncaaf',
    async (req, res, next) => {
        try {
            await footballControllers.nacaaf(req,res);
        } catch (err) {
            next(err);
        }
    }
)

module.exports = router