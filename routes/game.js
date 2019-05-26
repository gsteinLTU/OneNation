const path = require('path');
const express = require('express');

const gameController = require('../controllers/game');

const router = express.Router();

router.get('/', gameController.getGameIndex);
router.get('/play', gameController.getGame);
router.post('/play', gameController.postGame);

module.exports = router;