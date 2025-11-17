'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Customer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Customer has many Orders
      Customer.hasMany(models.Order, {
        foreignKey: 'customerId',
        as: 'orders'
      });

      Customer.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });

      Customer.hasMany(models.CustomerPromotion, {
        foreignKey: 'customerId',
        as: 'customerPromotions'
      });
    }
  }
  Customer.init({
    fullName: DataTypes.STRING,
    dateOfBirth: DataTypes.DATE,
    address: DataTypes.TEXT,
    city: DataTypes.STRING,
    district: DataTypes.STRING,
    customerType: DataTypes.ENUM('regular', 'vip', 'member', 'guest'),
    loyaltyPoints: DataTypes.INTEGER,
    totalSpent: DataTypes.DECIMAL,
  }, {
    sequelize,
    modelName: 'Customer',
    timestamps: false,
  });
  return Customer;
};