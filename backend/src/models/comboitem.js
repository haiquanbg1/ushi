'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ComboItem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // ComboItem belongs to Combo
      ComboItem.belongsTo(models.Combo, {
        foreignKey: 'comboId',
        as: 'combo'
      });
      
      // ComboItem belongs to MenuItem
      ComboItem.belongsTo(models.MenuItem, {
        foreignKey: 'menuItemId',
        as: 'menuItem'
      });
    }
  }
  ComboItem.init({
    comboId: DataTypes.INTEGER,
    menuItemId: DataTypes.INTEGER,
    quantity: DataTypes.INTEGER,
    isRequired: DataTypes.BOOLEAN,
    isDefault: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'ComboItem',
  });
  return ComboItem;
};