const {
  createMaster,
  getMasters,
  masterLogin,
  getMasterById,
  updateMaster,
  getAuthMaster
} = require("@controllers/master/master.controllers");
const validateRequest = require("../../middlewares/validateRequest");
const passport = require("passport");
const masterSchema = require("../../validators/masterValidator");
const { authorizeRoles } = require("../../config/passport");
const roles = require("../../config/roles");
const authSchema = require("../../validators/authValidator");
const masterAuthSchema = require("../../validators/master/masterAuthValidator");

const router = require("express").Router();

router.post(
  "/auth/master/login",
  // Callback Function
  validateRequest(masterAuthSchema),
  masterLogin
);

router.post(
  "/master/create",
  validateRequest(masterSchema),
  passport.authenticate("jwt", { session: false }),
  authorizeRoles(roles.ADMIN),
  // Callback Function
  createMaster
);

router.get(
  "/master/getall",
  passport.authenticate("jwt", { session: false }),
  authorizeRoles(roles.ADMIN),
  // Callback Function
  getMasters
);

router.get(
  "/master/get/:id",
  passport.authenticate("jwt", { session: false }),
  authorizeRoles(roles.ADMIN),
  // Callback Function
  getMasterById
);

router.get('/auth/master/get',
  passport.authenticate('jwt',{session:false}),
  authorizeRoles(roles.MASTER),
  // Callback Function
  getAuthMaster
)

router.patch(
  "/master/update/:id",
  passport.authenticate("jwt", { session: false }),
  authorizeRoles(roles.ADMIN),
  // Callback Function
  updateMaster
);

module.exports = router;
