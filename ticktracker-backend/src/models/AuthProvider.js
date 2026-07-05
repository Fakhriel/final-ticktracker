const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');


const AuthProvider = sequelize.define(
  'AuthProvider',
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
    provider: {
      type: DataTypes.ENUM('email', 'google', 'github'),
      allowNull: false,
    },
    
    providerUserId: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    tableName: 'auth_providers',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'provider'],
      },
      {
     
        unique: true,
        fields: ['provider', 'provider_user_id'],
      },
    ],
  }
);

module.exports = AuthProvider;