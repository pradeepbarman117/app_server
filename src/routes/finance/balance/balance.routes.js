const router = require("express").Router();
const passport = require("passport");
const { authorizeRoles } = require("../../../config/passport");
const roles = require("../../../config/roles");
const { balanceControllers } = require("../../../controllers/finance/balance/balanceControllers");





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


module.exports = router