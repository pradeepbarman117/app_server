const express = require('express');
const { baseballControllers } = require('../../../controllers/odds/baseball/baseball');
const router = express.Router();

router.get('/mlb',
    async (req, res, next) => {
        try {
            await baseballControllers.mlb(req,res);
        } catch (err) {
            next(err);
        }
    }
)

module.exports = router