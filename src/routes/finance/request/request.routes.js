const { requestController } = require('@controllers/finance/request/request.controllers');
const validateRequest = require('../../../middlewares/validateRequest');
const requestSchema = require('../../../validators/finance/requestValidator');
const passport = require('passport');
const { authorizeRoles } = require('../../../config/passport');
const roles = require('../../../config/roles');

const router = require('express').Router();



// Request Money to Admin
router.post('/master/request/money',
  passport.authenticate('jwt', { session: false }),
  authorizeRoles([roles.MASTER]),
  validateRequest(requestSchema),
  async (req, res, next) => {
    try {
      await requestController.masterRequestBalance(req, res);
    } catch (error) {
      next(error);
    }
  }
);

// Request Money to  Master
router.post('/user/request/money',
  passport.authenticate('jwt', { session: false }),
  authorizeRoles([roles.USER]),
  validateRequest(requestSchema),
  async (req, res, next) => {
    try {
      await requestController.userRequestBalance(req, res);
    } catch (error) {
      next(error);
    }
  }
);


///////  Get Request  //////

// Get Master Request Money
router.get('/master/request/money',
  passport.authenticate('jwt',{session:false}),
  authorizeRoles([roles.ADMIN]),
  async (req, res, next) => {
    try {
      await requestController.getMasterRequest(req, res);
    }catch(err){
      next(err);
    }
  }
)


// Get Master Request List By Id
router.get('/master/request/money/list/:id',
  passport.authenticate('jwt',{session:false}),
  authorizeRoles([roles.MASTER,roles.ADMIN]),
  async (req, res, next) => {
    try {
      await requestController.getMasterREQById(req, res);
    }catch(err){
      next(err);
    }
  }
)


// Get Master Request List By Id
router.get('/auth/master/request/money/list',
  passport.authenticate('jwt',{session:false}),
  authorizeRoles([roles.MASTER]),
  async (req, res, next) => {
    try {
      await requestController.getAuthMasterREQ(req, res);
    }catch(err){
      next(err);
    }
  }
)


////////////  USER   ///////////////

// Get Logged In User Requests
router.get('/auth/user/request/money/list',
  passport.authenticate('jwt',{session:false}),
  authorizeRoles([roles.USER]),
  async (req, res, next) => {
    try {
      await requestController.getAuthUserRequest(req,res);
    }catch(err){
      next(err);
    }
  }
)

// Get User Request List For Master (Authenticated Master);
router.get('/master/user/request/money/list',
  passport.authenticate('jwt',{session:false}),
  authorizeRoles([roles.MASTER]),
  async (req, res, next) => {
    try {
      await requestController.getAllUserRequest(req,res);
    }catch(err){
      next(err);
    }
  }
)



module.exports = router