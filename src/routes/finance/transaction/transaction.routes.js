const passport = require("passport");
const { transactionControllers } = require("../../../controllers/finance/transaction/transaction.controllers");
const roles = require("../../../config/roles");
const { authorizeRoles } = require("../../../config/passport");

const router = require("express").Router();



//////////////////////////// ADMIN CAN RETRIEVE ONLY ////////////////////////////// 

// Get Transaction List For Admin
router.get(
  "/transaction/get/list",
  passport.authenticate("jwt", { session: false }),
  authorizeRoles([roles.ADMIN]),
  async (req, res, next) => {
    try {
      await transactionControllers.getTransactionForAdmin(req,res);
    } catch (error) {
      next(error);
    }
  }
);


// Get Transaction List For Master
router.get(
  "/transaction/master/get/list",
  passport.authenticate("jwt", { session: false }),
  authorizeRoles([roles.ADMIN]),
  async (req, res, next) => {
    try {
      await transactionControllers.getTransactionForMasterByAdmin(req,res);
    } catch (error) {
      next(error);
    }
  }
);



//////////////////////////// MASTER CAN RETRIEVE ONLY //////////////////////////////

router.get(
  "/transaction/auth/master/get/list",
  passport.authenticate("jwt", { session: false }),
  authorizeRoles([roles.MASTER]),
  async (req, res, next) => {
    try {
      await transactionControllers.getTransactionForMasterByMaster(req,res);
    } catch (error) {
      next(error);
    }
  }
);




//////////////////////////// USER CAN RETRIEVE ONLY //////////////////////////////





module.exports = router;
