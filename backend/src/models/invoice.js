'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Invoice extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Invoice belongs to Order
      Invoice.belongsTo(models.Order, {
        foreignKey: 'orderId',
        as: 'order'
      });
    }
  }
  Invoice.init({
    orderId: DataTypes.INTEGER,
    invoiceNumber: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    customerName: DataTypes.STRING,
    customerTaxCode: DataTypes.STRING,
    subTotal: DataTypes.DECIMAL,
    taxAmount: DataTypes.DECIMAL,
    totalAmount: DataTypes.DECIMAL,
    paymentMethod: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Invoice',
  });
  return Invoice;
};