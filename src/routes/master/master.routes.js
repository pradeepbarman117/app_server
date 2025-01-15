const { createMaster,getMasters } = require('@controllers/master/master.controllers');
const validateRequest = require('../../middlewares/validateRequest');
const passport = require('passport');
const masterSchema = require('../../validators/masterValidator');
const { authorizeRoles } = require('../../config/passport');
const roles = require('../../config/roles');

const router = require('express').Router();



router.post('/master/create', validateRequest(masterSchema), passport.authenticate('jwt', { session: false }), authorizeRoles(roles.ADMIN), createMaster);
router.get('/master/get',passport.authenticate('jwt', { session: false }), authorizeRoles(roles.ADMIN),getMasters)


module.exports = router