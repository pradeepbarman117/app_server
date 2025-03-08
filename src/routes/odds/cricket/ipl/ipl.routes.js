const express = require('express');
const { iplController } = require('../../../../controllers/odds/cricket/ipl/iplControllers');
const router = express.Router();

router.get('/ipl',
    async (req, res, next) => {
        try {
            await iplController.iplGet(req, res);
        } catch (err) {
            next(err);
        }
    }
)

module.exports = router