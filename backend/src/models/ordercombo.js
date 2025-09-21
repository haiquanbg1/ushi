'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OrderCombo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // OrderCombo belongs to Order
      OrderCombo.belongsTo(models.Order, {
        foreignKey: 'orderId',
        as: 'order'
      });
      
      // OrderCombo belongs to Combo
      OrderCombo.belongsTo(models.Combo, {
        foreignKey: 'comboId',
        as: 'combo'
      });
      
      // OrderCombo has many OrderComboDetails
      OrderCombo.hasMany(models.OrderComboDetail, {
        foreignKey: 'orderComboId',
        as: 'orderComboDetails'
      });
    }
  }
  OrderCombo.init({
    orderId: DataTypes.INTEGER,
    comboId: DataTypes.INTEGER,
    quantity: DataTypes.INTEGER,
    unitPrice: DataTypes.DECIMAL,
    totalPrice: DataTypes.DECIMAL
  }, {
    sequelize,
    modelName: 'OrderCombo',
  });
  return OrderCombo;
};