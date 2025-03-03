const express = require('express');
const matchController = require('../../controllers/odds/match.controllers');
const router = express.Router();

// Create a new match
router.post('/', matchController.createMatch);