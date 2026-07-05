const express = require('express');
const { listFavorites, addFavorite, removeFavorite } = require('../controllers/favoriteController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(requireAuth);

router.get('/', listFavorites);
router.post('/', addFavorite);
router.delete('/:coinId', removeFavorite);

module.exports = router;