const { Area, Table } = require('../models');

class AreaService {
    async getAllAreas() {
        try {
            return await Area.findAll({
                include: [{
                    model: Table,
                    as: 'tables'
                }],
                order: [['createdAt', 'DESC']]
            });
        } catch (error) {
            throw new Error(`Error fetching areas: ${error.message}`);
        }
    }

    async getAreaById(id) {
        try {
            const area = await Area.findByPk(id, {
                include: [{
                    model: Table,
                    as: 'tables'
                }]
            });
            if (!area) {
                throw new Error('Area not found');
            }
            return area;
        } catch (error) {
            throw new Error(`Error fetching area: ${error.message}`);
        }
    }

    async createArea(areaData) {
        try {
            return await Area.create(areaData);
        } catch (error) {
            throw new Error(`Error creating area: ${error.message}`);
        }
    }

    async updateArea(id, updateData) {
        try {
            const [updatedCount] = await Area.update(updateData, {
                where: { id }
            });
            if (updatedCount === 0) {
                throw new Error('Area not found or no changes made');
            }
            return await this.getAreaById(id);
        } catch (error) {
            throw new Error(`Error updating area: ${error.message}`);
        }
    }

    async deleteArea(id) {
        try {
            const deletedCount = await Area.destroy({
                where: { id }
            });
            if (deletedCount === 0) {
                throw new Error('Area not found');
            }
            return { message: 'Area deleted successfully' };
        } catch (error) {
            throw new Error(`Error deleting area: ${error.message}`);
        }
    }

    async getActiveAreas() {
        try {
            return await Area.findAll({
                where: { isActive: true },
                include: [{
                    model: Table,
                    as: 'tables'
                }]
            });
        } catch (error) {
            throw new Error(`Error fetching active areas: ${error.message}`);
        }
    }
}

module.exports = new AreaService();
