const router = require("express").Router();
const {
  createAdmin,
  getAdmins,
  loginAdmin,
  updateAdminBalance,
} = require("@controllers/admin/admin.controllers");
const validateRequest = require("../../middlewares/validateRequest");
const adminSchema = require("../../validators/adminValidator");
const { authorizeRoles } = require("../../config/passport");
const passport = require("passport");
const roles = require("../../config/roles");
const authSchema = require("../../validators/authValidator");
const adminFinanceSchema = require("../../validators/admin/adminValidator");

router.post("/auth/create", validateRequest(adminSchema), createAdmin);

router.get(
  "/get",
  passport.authenticate("jwt", { session: false }),
  authorizeRoles([roles.ADMIN]),
  getAdmins
);

router.post("/auth/login", validateRequest(authSchema), loginAdmin);

router.patch(
  "/finance/add/money",
  passport.authenticate("jwt", { session: false }),
  validateRequest(adminFinanceSchema),
  updateAdminBalance
);

module.exports = router; // Export the router to use in other files.
