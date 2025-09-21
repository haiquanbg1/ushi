const { Table, Area, Order, ReservationTable } = require('../models');

class TableService {
    async getAllTables() {
        try {
            return await Table.findAll({
                include: [
                    { model: Area, as: 'area' },
                    { model: Order, as: 'orders' },
                    { model: ReservationTable, as: 'reservationTables' }
                ],
                order: [['tableNumber', 'ASC']]
            });
        } catch (error) {
            throw new Error(`Error fetching tables: ${error.message}`);
        }
    }

    async getTableById(id) {
        try {
            const table = await Table.findByPk(id, {
                include: [
                    { model: Area, as: 'area' },
                    { model: Order, as: 'orders' },
                    { model: ReservationTable, as: 'reservationTables' }
                ]
            });
            if (!table) {
                throw new Error('Table not found');
            }
            return table;
        } catch (error) {
            throw new Error(`Error fetching table: ${error.message}`);
        }
    }

    async createTable(tableData) {
        try {
            return await Table.create(tableData);
        } catch (error) {
            throw new Error(`Error creating table: ${error.message}`);
        }
    }

    async updateTable(id, updateData) {
        try {
            const [updatedCount] = await Table.update(updateData, {
                where: { id }
            });
            if (updatedCount === 0) {
                throw new Error('Table not found or no changes made');
            }
            return await this.getTableById(id);
        } catch (error) {
            throw new Error(`Error updating table: ${error.message}`);
        }
    }

    async deleteTable(id) {
        try {
            const deletedCount = await Table.destroy({
                where: { id }
            });
            if (deletedCount === 0) {
                throw new Error('Table not found');
            }
            return { message: 'Table deleted successfully' };
        } catch (error) {
            throw new Error(`Error deleting table: ${error.message}`);
        }
    }

    async getTablesByAreaId(areaId) {
        try {
            return await Table.findAll({
                where: { areaId },
                include: [{ model: Area, as: 'area' }],
                order: [['tableNumber', 'ASC']]
            });
        } catch (error) {
            throw new Error(`Error fetching tables by area ID: ${error.message}`);
        }
    }

    async getAvailableTables(reservationDate, reservationTime) {
        try {
            return await Table.findAll({
                include: [
                    { model: Area, as: 'area' },
                    {
                        model: ReservationTable,
                        as: 'reservationTables',
                        required: false,
                        where: {
                            '$reservationTables.reservation.reservationDate$': reservationDate,
                            '$reservationTables.reservation.reservationTime$': reservationTime
                        },
                        include: [
                            { model: Reservation, as: 'reservation' }
                        ]
                    }
                ],
                where: {
                    '$reservationTables.id$': null
                },
                order: [['tableNumber', 'ASC']]
            });
        } catch (error) {
            throw new Error(`Error fetching available tables: ${error.message}`);
        }
    }
}

module.exports = new TableService();