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
      
      // Customer has many Reservations
      Customer.hasMany(models.Reservation, {
        foreignKey: 'customerId',
        as: 'reservations'
      });
    }
  }
  Customer.init({
    fullName: DataTypes.STRING,
    phone: {
      type: DataTypes.STRING,
      validate: {
        is: /^[0-9]{10,15}$/
      }
    },
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true
      }
    },
    dateOfBirth: DataTypes.DATE,
    address: DataTypes.TEXT,
    city: DataTypes.STRING,
    district: DataTypes.STRING,
    customerType: DataTypes.ENUM('regular', 'vip', 'member', 'guest'),
    loyaltyPoints: DataTypes.INTEGER,
    totalSpent: DataTypes.DECIMAL,
    lastVisit: DataTypes.DATE,
    preferredContactMethod: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Customer',
  });
  return Customer;
};