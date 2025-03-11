// In your routes file
const express = require('express');
const router = express.Router();
const dinosaurController = require('../controllers/dinosaurController');

router.get('/', dinosaurController.getDinosaurs);
router.post('/vote', dinosaurController.voteDinosaur);
router.post('/fetch-images', dinosaurController.fetchNewImages);
router.get('/:id', dinosaurController.getDinosaurById);
router.delete('/:id', dinosaurController.deleteDinosaur);

module.exports = router;