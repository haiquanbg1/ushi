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
      // Table belongs to Area
      Table.belongsTo(models.Area, {
        foreignKey: 'areaId',
        as: 'area'
      });
      
      // Table has many Orders
      Table.hasMany(models.Order, {
        foreignKey: 'tableId',
        as: 'orders'
      });
      
      // Table has many ReservationTables
      Table.hasMany(models.ReservationTable, {
        foreignKey: 'tableId',
        as: 'reservationTables'
      });
    }
  }
  Table.init({
    areaId: DataTypes.INTEGER,
    tableNumber: DataTypes.STRING,
    capacity: DataTypes.INTEGER,
    status: DataTypes.ENUM('available', 'occupied', 'reserved', 'cleaning', 'maintenance'),
    qrCode: DataTypes.STRING,
    isActive: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Table',
  });
  return Table;
};