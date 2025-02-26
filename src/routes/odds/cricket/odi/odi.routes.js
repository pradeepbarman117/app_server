const express = require('express');
const { odiControllers } = require('../../../../controllers/odds/cricket/international/odi/odi.controllers');
const router = express.Router();

router.get('/icc/odi/champ-trophy',
    async (req, res, next) => {
        try {
            await odiControllers.champ_trophy(req, res);
        } catch (err) {
            next(err);
        }
    }
)

module.exports = router