const express = require('express');
const passport = require('passport');
const { authorizeRoles } = require('../../config/passport');
const roles = require('../../config/roles');

const router = express.Router();

router.get('/protected', passport.authenticate('jwt', { session: false }), authorizeRoles([roles.ADMIN,roles.MASTER,roles.USER]), (req, res) => {
  res.status(200).json({ message: 'Protected route accessed', success: true,user:req.user.name});
});

module.exports = router;
