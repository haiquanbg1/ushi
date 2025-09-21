'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Combo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Combo has many ComboItems
      Combo.hasMany(models.ComboItem, {
        foreignKey: 'comboId',
        as: 'comboItems'
      });
      
      // Combo has many OrderCombos
      Combo.hasMany(models.OrderCombo, {
        foreignKey: 'comboId',
        as: 'orderCombos'
      });
    }
  }
  Combo.init({
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    price: DataTypes.DECIMAL,
    imageURL: DataTypes.STRING,
    isActive: DataTypes.BOOLEAN,
    validFrom: DataTypes.DATE,
    validTo: DataTypes.DATE,
    minItems: DataTypes.INTEGER,
    maxItems: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Combo',
  });
  return Combo;
};