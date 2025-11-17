'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Table extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Table has many Orders
      Table.hasMany(models.Order, {
        foreignKey: 'tableId',
        as: 'orders'
      });
    }
  }
  Table.init({
    tableNumber: DataTypes.STRING,
    capacity: DataTypes.INTEGER,
    status: {
      type: DataTypes.ENUM('available', 'occupied', 'reserved', 'cleaning', 'maintenance'),
      defaultValue: 'available'
    },
    isActive: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Table',
  });
  return Table;
};