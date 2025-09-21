'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OrderComboDetail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // OrderComboDetail belongs to OrderCombo
      OrderComboDetail.belongsTo(models.OrderCombo, {
        foreignKey: 'orderComboId',
        as: 'orderCombo'
      });
      
      // OrderComboDetail belongs to MenuItem
      OrderComboDetail.belongsTo(models.MenuItem, {
        foreignKey: 'menuItemId',
        as: 'menuItem'
      });
    }
  }
  OrderComboDetail.init({
    orderComboId: DataTypes.INTEGER,
    menuItemId: DataTypes.INTEGER,
    quantity: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'OrderComboDetail',
  });
  return OrderComboDetail;
};