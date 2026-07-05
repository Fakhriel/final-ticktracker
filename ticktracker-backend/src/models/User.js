const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  
    avatarPath: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    tableName: 'users',
    timestamps: true,
  }
);

module.exports = User;
