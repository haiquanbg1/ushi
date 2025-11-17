'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Order belongs to Customer
      Order.belongsTo(models.Customer, {
        foreignKey: 'customerId',
        as: 'customer'
      });

      // Order belongs to Table
      Order.belongsTo(models.Table, {
        foreignKey: 'tableId',
        as: 'table'
      });

      // Order has many OrderDetails
      Order.hasMany(models.OrderDetail, {
        foreignKey: 'orderId',
        as: 'orderDetails'
      });

      // Order has many Payments
      Order.hasMany(models.Payment, {
        foreignKey: 'orderId',
        as: 'payments'
      });

      // Order has many Invoices
      Order.hasMany(models.Invoice, {
        foreignKey: 'orderId',
        as: 'invoices'
      });

      Order.hasMany(models.CustomerPromotion, {
        foreignKey: 'orderId',
        as: 'customerPromotions'
      });
    }
  }
  Order.init({
    orderNumber: DataTypes.STRING,
    customerId: DataTypes.INTEGER,
    tableId: DataTypes.INTEGER,
    subTotal: DataTypes.DECIMAL,
    serviceCharge: DataTypes.DECIMAL,
    discountAmount: DataTypes.DECIMAL,
    totalAmount: DataTypes.DECIMAL,
    orderStatus: {
      type: DataTypes.ENUM('pending', 'confirmed', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending'
    },
    customerNotes: DataTypes.TEXT,
  }, {
    sequelize,
    modelName: 'Order',
  });
  return Order;
};