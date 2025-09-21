const { Combo, ComboItem, MenuItem, OrderCombo } = require('../models');

class ComboService {
    async getAllCombos() {
        try {
            return await Combo.findAll({
                include: [{
                    model: ComboItem,
                    as: 'comboItems',
                    include: [{
                        model: MenuItem,
                        as: 'menuItem'
                    }]
                }],
                order: [['createdAt', 'DESC']]
            });
        } catch (error) {
            throw new Error(`Error fetching combos: ${error.message}`);
        }
    }

    async getComboById(id) {
        try {
            const combo = await Combo.findByPk(id, {
                include: [{
                    model: ComboItem,
                    as: 'comboItems',
                    include: [{
                        model: MenuItem,
                        as: 'menuItem'
                    }]
                }]
            });
            if (!combo) {
                throw new Error('Combo not found');
            }
            return combo;
        } catch (error) {
            throw new Error(`Error fetching combo: ${error.message}`);
        }
    }

    async createCombo(comboData) {
        try {
            return await Combo.create(comboData);
        } catch (error) {
            throw new Error(`Error creating combo: ${error.message}`);
        }
    }

    async updateCombo(id, updateData) {
        try {
            const [updatedCount] = await Combo.update(updateData, {
                where: { id }
            });
            if (updatedCount === 0) {
                throw new Error('Combo not found or no changes made');
            }
            return await this.getComboById(id);
        } catch (error) {
            throw new Error(`Error updating combo: ${error.message}`);
        }
    }

    async deleteCombo(id) {
        try {
            const deletedCount = await Combo.destroy({
                where: { id }
            });
            if (deletedCount === 0) {
                throw new Error('Combo not found');
            }
            return { message: 'Combo deleted successfully' };
        } catch (error) {
            throw new Error(`Error deleting combo: ${error.message}`);
        }
    }

    async getActiveCombos() {
        try {
            const currentDate = new Date();
            return await Combo.findAll({
                where: {
                    isActive: true,
                    validFrom: { [require('sequelize').Op.lte]: currentDate },
                    validTo: { [require('sequelize').Op.gte]: currentDate }
                },
                include: [{
                    model: ComboItem,
                    as: 'comboItems',
                    include: [{
                        model: MenuItem,
                        as: 'menuItem'
                    }]
                }]
            });
        } catch (error) {
            throw new Error(`Error fetching active combos: ${error.message}`);
        }
    }
}

module.exports = new ComboService();
