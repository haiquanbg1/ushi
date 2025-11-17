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

      // ComboItem belongs to Item
      ComboItem.belongsTo(models.Item, {
        foreignKey: 'itemId',
        as: 'item'
      });
    }
  }
  ComboItem.init({
    comboId: { type: DataTypes.INTEGER, allowNull: false },
    itemId: { type: DataTypes.INTEGER, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    isRequired: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    isDefault: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
  }, {
    sequelize,
    modelName: 'ComboItem',
  });
  return ComboItem;
};