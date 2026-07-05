const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// Satu user bisa punya banyak favorite, tapi gak boleh dobel coin yang
// sama (unique index user_id + coin_id). Ini yang gantiin localStorage
// 'favoriteCoins' di frontend.
const Favorite = sequelize.define(
  'Favorite',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    // ID coin dari CoinGecko, misal "bitcoin", "ethereum" - string slug,
    // bukan angka, makanya bukan FK ke tabel coin manapun.
    coinId: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  },
  {
    tableName: 'favorites',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'coin_id'],
      },
    ],
  }
);

module.exports = Favorite;