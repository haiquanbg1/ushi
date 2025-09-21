'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ReservationTable extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // ReservationTable belongs to Reservation
      ReservationTable.belongsTo(models.Reservation, {
        foreignKey: 'reservationId',
        as: 'reservation'
      });
      
      // ReservationTable belongs to Table
      ReservationTable.belongsTo(models.Table, {
        foreignKey: 'tableId',
        as: 'table'
      });
    }
  }
  ReservationTable.init({
    reservationId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    tableId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    assignedAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'ReservationTable',
    indexes: [
      {
        unique: true,
        fields: ['reservationId', 'tableId']
      }
    ]
  });
  return ReservationTable;
};