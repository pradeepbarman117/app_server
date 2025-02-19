const { processController } = require('@controllers/finance/process/process.controllers');
const passport = require('passport');
const { authorizeRoles } = require('../../../config/passport');
const roles = require('../../../config/roles');
const validateRequest = require('../../../middlewares/validateRequest');
const processSchema = require('../../../validators/finance/processValidator');

const router = require('express').Router();



router.post('/approve/request',
  validateRequest(processSchema),
  passport.authenticate('jwt', { session: false }),
  authorizeRoles([roles.ADMIN]),
  async (req, res, next) => {
    try {
      await processController.masterRequest(req, res);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router