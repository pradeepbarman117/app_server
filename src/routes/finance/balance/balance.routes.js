const router = require("express").Router();
const passport = require("passport");
const { authorizeRoles } = require("../../../config/passport");
const roles = require("../../../config/roles");
const { balanceControllers } = require("../../../controllers/finance/balance/balanceControllers");




// Get All Amount For Admins
router.get('/get/amounts',
    passport.authenticate('jwt', { session: false }),
    authorizeRoles([roles.ADMIN]),
    async (req, res, next) => {
        try {
            await balanceControllers.getTotalAmount(req, res);
        } catch (error) {
            next(error);
        }
    }
)


// Get Master's Amount (Authenticated)
router.get('/get/master/amounts',
    passport.authenticate('jwt', { session: false }),
    authorizeRoles([roles.MASTER]),
    async (req, res, next) => {
        try {
            await balanceControllers.getMasterTotalAmount(req, res);
        } catch (error) {
            next(error);
        }
    }
);


// Get User's Amount For master
router.get('/get/user/amounts',
    passport.authenticate('jwt', { session: false }),
    authorizeRoles([roles.MASTER]),
    async (req, res, next) => {
        try {
            await balanceControllers.getUserTotalAmountForMaster(req, res);
        } catch (error) {
            next(error);
        }
    }
);


module.exports = router