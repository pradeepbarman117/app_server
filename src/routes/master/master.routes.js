const {
  createMaster,
  getMasters,
  masterLogin,
  getMasterById,
  updateMaster
} = require("@controllers/master/master.controllers");
const validateRequest = require("../../middlewares/validateRequest");
const passport = require("passport");
const masterSchema = require("../../validators/masterValidator");
const { authorizeRoles } = require("../../config/passport");
const roles = require("../../config/roles");
const authSchema = require("../../validators/authValidator");

const router = require("express").Router();

router.post(
  "/auth/master/login",
  // Callback Function
  validateRequest(authSchema),
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


router.patch(
  "/master/update/:id",
  passport.authenticate("jwt", { session: false }),
  authorizeRoles(roles.ADMIN),
  // Callback Function
  updateMaster
);

module.exports = router;
