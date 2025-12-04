'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // User belongs to Role
      User.belongsTo(models.Role, {
        foreignKey: 'roleId',
        as: 'role'
      });

      User.hasOne(models.Customer, {
        foreignKey: 'userId',
        as: 'customer'
      });
    }
  }
  User.init({
    username: DataTypes.STRING,
    phone: {
      type: DataTypes.STRING,
      validate: {
        is: /^[0-9]{10,10}$/
      }
    },
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true
      }
    },
    password: DataTypes.STRING,
    roleId: DataTypes.INTEGER,
    isActive: DataTypes.BOOLEAN,
    lastLoginAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};