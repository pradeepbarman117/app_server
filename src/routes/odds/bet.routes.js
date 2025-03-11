// routes/betRoutes.js
const express = require('express');
const betController = require('../../controllers/odds/bet.controllers');
const passport = require('passport');
const { authorizeRoles } = require('../../config/passport');
const roles = require('../../config/roles');
const router = express.Router();

// Place a bet (with match and odds data)
router.post('/place-bet',
    passport.authenticate('jwt',{session:false}),
    authorizeRoles([roles.USER]), 
    betController.placeBet
);
router.get('/user/bets', 
    passport.authenticate('jwt',{session:false}),
    authorizeRoles([roles.USER]),
    async(req,res,next)=>{
        try{
            await betController.getUserBets(req,res);
        }catch(err){
            next(err)
        }
    }
);

module.exports = router