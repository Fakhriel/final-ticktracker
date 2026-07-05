const { sequelize } = require('../config/db');
const User = require('./User');
const AuthProvider = require('./AuthProvider');
const Favorite = require('./Favorite');

User.hasMany(AuthProvider, { foreignKey: 'userId', as: 'authProviders', onDelete: 'CASCADE' });
AuthProvider.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Favorite, { foreignKey: 'userId', as: 'favorites', onDelete: 'CASCADE' });
Favorite.belongsTo(User, { foreignKey: 'userId' });

async function syncModels() {
  await sequelize.sync({ alter: true });
  console.log('✅ Tabel tersinkron dengan database.');
}

module.exports = { sequelize, User, AuthProvider, Favorite, syncModels };