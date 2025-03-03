const passport = require("passport");
const { transactionControllers } = require("../../../controllers/finance/transaction/transaction.controllers");

const router = require("express").Router();

router.get(
  "/transaction/get/list",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    try {
      await transactionControllers.getTransaction(req,res);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
