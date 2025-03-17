// In your routes file
const express = require('express');
const router = express.Router();
const dinosaurController = require('../controllers/dinosaurController');

router.get('/voted', dinosaurController.getUserVotes);
router.get('/statistics', dinosaurController.GetDinoStatistics);

module.exports = router;