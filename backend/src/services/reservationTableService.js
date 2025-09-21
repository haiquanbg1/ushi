const { ReservationTable, Reservation, Table } = require('../models');

class ReservationTableService {
    async getAllReservationTables() {
        try {
            return await ReservationTable.findAll({
                include: [
                    { model: Reservation, as: 'reservation' },
                    { model: Table, as: 'table' }
                ]
            });
        } catch (error) {
            throw new Error(`Error fetching reservation tables: ${error.message}`);
        }
    }

    async getReservationTableById(id) {
        try {
            const reservationTable = await ReservationTable.findByPk(id, {
                include: [
                    { model: Reservation, as: 'reservation' },
                    { model: Table, as: 'table' }
                ]
            });
            if (!reservationTable) {
                throw new Error('Reservation table not found');
            }
            return reservationTable;
        } catch (error) {
            throw new Error(`Error fetching reservation table: ${error.message}`);
        }
    }

    async createReservationTable(reservationTableData) {
        try {
            return await ReservationTable.create(reservationTableData);
        } catch (error) {
            throw new Error(`Error creating reservation table: ${error.message}`);
        }
    }

    async updateReservationTable(id, updateData) {
        try {
            const [updatedCount] = await ReservationTable.update(updateData, {
                where: { id }
            });
            if (updatedCount === 0) {
                throw new Error('Reservation table not found or no changes made');
            }
            return await this.getReservationTableById(id);
        } catch (error) {
            throw new Error(`Error updating reservation table: ${error.message}`);
        }
    }

    async deleteReservationTable(id) {
        try {
            const deletedCount = await ReservationTable.destroy({
                where: { id }
            });
            if (deletedCount === 0) {
                throw new Error('Reservation table not found');
            }
            return { message: 'Reservation table deleted successfully' };
        } catch (error) {
            throw new Error(`Error deleting reservation table: ${error.message}`);
        }
    }

    async getReservationTablesByReservationId(reservationId) {
        try {
            return await ReservationTable.findAll({
                where: { reservationId },
                include: [{ model: Table, as: 'table' }]
            });
        } catch (error) {
            throw new Error(`Error fetching reservation tables by reservation ID: ${error.message}`);
        }
    }

    async getReservationTablesByTableId(tableId) {
        try {
            return await ReservationTable.findAll({
                where: { tableId },
                include: [{ model: Reservation, as: 'reservation' }]
            });
        } catch (error) {
            throw new Error(`Error fetching reservation tables by table ID: ${error.message}`);
        }
    }
}

module.exports = new ReservationTableService();
