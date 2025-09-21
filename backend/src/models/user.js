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

      // User has one Employee
      User.hasOne(models.Employee, {
        foreignKey: 'userId',
        as: 'employee'
      });
    }
  }
  User.init({
    username: DataTypes.STRING,
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