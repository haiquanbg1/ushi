const { Table, Order } = require('../models');

class TableService {
    async getAllTablesActive() {
        try {
            return await Table.findAll({
                where: {
                    isActive: true
                },
                include: [
                    { model: Order, as: 'orders' },
                ],
                order: [['tableNumber', 'ASC']]
            });
        } catch (error) {
            console.log(error)
            throw new Error(`Error fetching tables: ${error.message}`);
        }
    }

    async getAllTables() {
        try {
            return await Table.findAll({
                include: [
                    { model: Order, as: 'orders' },
                ],
                order: [['tableNumber', 'ASC']]
            });
        } catch (error) {
            console.log(error)
            throw new Error(`Error fetching tables: ${error.message}`);
        }
    }

    async getTableById(id) {
        try {
            const table = await Table.findByPk(id, {
                include: [
                    { model: Order, as: 'orders' },
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
}

module.exports = new TableService();