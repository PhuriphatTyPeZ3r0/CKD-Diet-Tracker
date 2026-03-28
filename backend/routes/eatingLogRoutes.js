const express = require('express');
const router = express.Router();
const eatingLogController = require('../controllers/eatingLogController');

router.post('/eat-logs', eatingLogController.createLog);
router.get('/eat-logs', eatingLogController.getDailyLogs);

module.exports = router;