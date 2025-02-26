const passport = require("passport");
const {
  getUser,
  createUser,
  getMasterUser,
  getAdminUser,
  getAllMasterUser,
  loginUser
} = require("@controllers/user/user.controllers");
const { authorizeRoles } = require("../../config/passport");
const roles = require("../../config/roles");
const validateRequest = require("../../middlewares/validateRequest");
const { userSchemaCreate,userSchemaLogin } = require("../../validators/userValidator");

const router = require("express").Router();


router.post('/user/auth/login', validateRequest(userSchemaLogin), loginUser);

router.post(
  "/user/create",
  passport.authenticate("jwt", { session: false, failWithError: true }),
  authorizeRoles([roles.MASTER, roles.ADMIN]),
  validateRequest(userSchemaCreate),
  async (req, res, next) => {
    try {
      await createUser(req, res);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/user/get",
  passport.authenticate("jwt", { session: false, failWithError: true }),
  authorizeRoles([roles.ADMIN]),
  async (req, res, next) => {
    try {
      await getUser(req, res);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/master/user/all",
  passport.authenticate("jwt", { session: false, failWithError: true }),
  authorizeRoles([roles.MASTER, roles.ADMIN]),
  async (req, res, next) => {
    try {
      await getAllMasterUser(req, res);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/master/user/:id",
  passport.authenticate("jwt", { session: false, failWithError: true }),
  authorizeRoles([roles.MASTER, roles.ADMIN]),
  async (req, res, next) => {
    try {
      await getMasterUser(req, res);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/admin/user",
  passport.authenticate("jwt", { session: false, failWithError: true }),
  authorizeRoles([roles.ADMIN]),
  async (req, res, next) => {
    try {
      await getAdminUser(req, res);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
