'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MenuVariation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // MenuVariation belongs to MenuItem
      MenuVariation.belongsTo(models.MenuItem, {
        foreignKey: 'menuItemId',
        as: 'menuItem'
      });
      
      // MenuVariation has many OrderDetails
      MenuVariation.hasMany(models.OrderDetail, {
        foreignKey: 'variationId',
        as: 'orderDetails'
      });
    }
  }
  MenuVariation.init({
    menuItemId: DataTypes.INTEGER,
    variationName: DataTypes.STRING,
    priceAdjustment: DataTypes.DECIMAL,
    isDefault: DataTypes.BOOLEAN,
    isAvailable: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'MenuVariation',
  });
  return MenuVariation;
};