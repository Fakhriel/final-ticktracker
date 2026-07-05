const { Favorite } = require('../models');

// GET /api/favorites - list semua coin favorite milik user yang login
async function listFavorites(req, res) {
  try {
    const favorites = await Favorite.findAll({
      where: { userId: req.userId },
      order: [['createdAt', 'ASC']],
    });

    return res.json(favorites.map((f) => ({ coinId: f.coinId })));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Gagal mengambil watchlist.' });
  }
}

// POST /api/favorites { coinId } - tambah coin ke watchlist
async function addFavorite(req, res) {
  try {
    const { coinId } = req.body;
    if (!coinId || typeof coinId !== 'string') {
      return res.status(400).json({ message: 'coinId wajib diisi.' });
    }

    await Favorite.findOrCreate({
      where: { userId: req.userId, coinId },
    });

    return res.status(201).json({ coinId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Gagal menambahkan ke watchlist.' });
  }
}

// DELETE /api/favorites/:coinId - hapus coin dari watchlist
async function removeFavorite(req, res) {
  try {
    const { coinId } = req.params;
    await Favorite.destroy({ where: { userId: req.userId, coinId } });
    return res.json({ coinId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Gagal menghapus dari watchlist.' });
  }
}

module.exports = { listFavorites, addFavorite, removeFavorite };