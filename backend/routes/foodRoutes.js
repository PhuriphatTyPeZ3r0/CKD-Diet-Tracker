const express = require('express');
const router = express.Router();
const foodController = require('../controllers/foodController');

router.get('/foods', foodController.getAllFoods);

module.exports = router;