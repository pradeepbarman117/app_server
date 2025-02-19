const { requestController } = require('@controllers/finance/request/request.controllers');
const validateRequest = require('../../../middlewares/validateRequest');
const requestSchema = require('../../../validators/finance/requestValidator');
const passport = require('passport');
const { authorizeRoles } = require('../../../config/passport');
const roles = require('../../../config/roles');

const router = require('express').Router();



router.post('/master/request/money',
  passport.authenticate('jwt', { session: false }),
  authorizeRoles([roles.MASTER]),
  validateRequest(requestSchema),
  async (req, res, next) => {
    try {
      await requestController.masterRequestCoins(req, res);
    } catch (error) {
      next(error);
    }
  }
);


router.post('/user/request/money',
  passport.authenticate('jwt', { session: false }),
  authorizeRoles([roles.USER]),
  validateRequest(requestSchema),
  async (req, res, next) => {
    try {
      await requestController.userRequestCoins(req, res);
    } catch (error) {
      next(error);
    }
  }
);


module.exports = router