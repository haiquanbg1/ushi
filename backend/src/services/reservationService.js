const { Reservation, Customer, Employee, ReservationTable, Table } = require('../models');

class ReservationService {
    async getAllReservations() {
        try {
            return await Reservation.findAll({
                include: [
                    { model: Customer, as: 'customer' },
                    { model: Employee, as: 'createdByEmployee' },
                    {
                        model: ReservationTable,
                        as: 'reservationTables',
                        include: [{ model: Table, as: 'table' }]
                    }
                ],
                order: [['reservationDate', 'DESC'], ['reservationTime', 'DESC']]
            });
        } catch (error) {
            throw new Error(`Error fetching reservations: ${error.message}`);
        }
    }

    async getReservationById(id) {
        try {
            const reservation = await Reservation.findByPk(id, {
                include: [
                    { model: Customer, as: 'customer' },
                    { model: Employee, as: 'createdByEmployee' },
                    {
                        model: ReservationTable,
                        as: 'reservationTables',
                        include: [{ model: Table, as: 'table' }]
                    }
                ]
            });
            if (!reservation) {
                throw new Error('Reservation not found');
            }
            return reservation;
        } catch (error) {
            throw new Error(`Error fetching reservation: ${error.message}`);
        }
    }

    async createReservation(reservationData) {
        try {
            return await Reservation.create(reservationData);
        } catch (error) {
            throw new Error(`Error creating reservation: ${error.message}`);
        }
    }

    async updateReservation(id, updateData) {
        try {
            const [updatedCount] = await Reservation.update(updateData, {
                where: { id }
            });
            if (updatedCount === 0) {
                throw new Error('Reservation not found or no changes made');
            }
            return await this.getReservationById(id);
        } catch (error) {
            throw new Error(`Error updating reservation: ${error.message}`);
        }
    }

    async deleteReservation(id) {
        try {
            const deletedCount = await Reservation.destroy({
                where: { id }
            });
            if (deletedCount === 0) {
                throw new Error('Reservation not found');
            }
            return { message: 'Reservation deleted successfully' };
        } catch (error) {
            throw new Error(`Error deleting reservation: ${error.message}`);
        }
    }

    async getReservationsByCustomerId(customerId) {
        try {
            return await Reservation.findAll({
                where: { customerId },
                include: [
                    { model: Customer, as: 'customer' },
                    {
                        model: ReservationTable,
                        as: 'reservationTables',
                        include: [{ model: Table, as: 'table' }]
                    }
                ],
                order: [['reservationDate', 'DESC']]
            });
        } catch (error) {
            throw new Error(`Error fetching reservations by customer ID: ${error.message}`);
        }
    }

    async getReservationsByDate(date) {
        try {
            return await Reservation.findAll({
                where: { reservationDate: date },
                include: [
                    { model: Customer, as: 'customer' },
                    {
                        model: ReservationTable,
                        as: 'reservationTables',
                        include: [{ model: Table, as: 'table' }]
                    }
                ],
                order: [['reservationTime', 'ASC']]
            });
        } catch (error) {
            throw new Error(`Error fetching reservations by date: ${error.message}`);
        }
    }

    async getReservationsByStatus(status) {
        try {
            return await Reservation.findAll({
                where: { status },
                include: [
                    { model: Customer, as: 'customer' },
                    {
                        model: ReservationTable,
                        as: 'reservationTables',
                        include: [{ model: Table, as: 'table' }]
                    }
                ],
                order: [['reservationDate', 'DESC']]
            });
        } catch (error) {
            throw new Error(`Error fetching reservations by status: ${error.message}`);
        }
    }

    async updateReservationStatus(id, status) {
        try {
            const [updatedCount] = await Reservation.update(
                { status },
                { where: { id } }
            );
            if (updatedCount === 0) {
                throw new Error('Reservation not found');
            }
            return await this.getReservationById(id);
        } catch (error) {
            throw new Error(`Error updating reservation status: ${error.message}`);
        }
    }

    async getTodayReservations() {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            return await Reservation.findAll({
                where: { reservationDate: today },
                include: [
                    { model: Customer, as: 'customer' },
                    {
                        model: ReservationTable,
                        as: 'reservationTables',
                        include: [{ model: Table, as: 'table' }]
                    }
                ],
                order: [['reservationTime', 'ASC']]
            });
        } catch (error) {
            throw new Error(`Error fetching today's reservations: ${error.message}`);
        }
    }
}

module.exports = new ReservationService();
