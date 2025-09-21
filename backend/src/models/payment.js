'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Payment belongs to Order
      Payment.belongsTo(models.Order, {
        foreignKey: 'orderId',
        as: 'order'
      });
      
      // Payment belongs to Employee (processed by)
      Payment.belongsTo(models.Employee, {
        foreignKey: 'processedByEmployeeId',
        as: 'processedByEmployee'
      });
    }
  }
  Payment.init({
    orderId: DataTypes.INTEGER,
    paymentMethod: DataTypes.STRING,
    amount: DataTypes.DECIMAL,
    paidAmount: DataTypes.DECIMAL,
    changeAmount: DataTypes.DECIMAL,
    paymentStatus: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded', 'cancelled'),
    transactionId: DataTypes.STRING,
    paymentGateway: DataTypes.STRING,
    paymentTime: DataTypes.DATE,
    processedByEmployeeId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Payment',
  });
  return Payment;
};