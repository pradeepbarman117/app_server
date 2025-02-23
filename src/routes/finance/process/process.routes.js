const { processController } = require('@controllers/finance/process/process.controllers');
const passport = require('passport');
const { authorizeRoles } = require('../../../config/passport');
const roles = require('../../../config/roles');
const validateRequest = require('../../../middlewares/validateRequest');
const processSchema = require('../../../validators/finance/processValidator');

const router = require('express').Router();



router.post('/master/approval/request',
  passport.authenticate('jwt', { session: false }),
  authorizeRoles([roles.ADMIN]),
  validateRequest(processSchema),
  async (req, res, next) => {
    try {
      await processController.masterRequest(req, res);
    } catch (error) {
      next(error);
    }
  }
);


router.post('/user/approval/request',
  passport.authenticate('jwt', { session: false }),
  authorizeRoles([roles.MASTER]),
  validateRequest(processSchema),
  async (req, res, next) => {
    try {
      await processController.userRequest(req, res);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router