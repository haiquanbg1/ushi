const { MenuVariation, MenuItem } = require('../models');

class MenuVariationService {
    async getAllMenuVariations() {
        try {
            return await MenuVariation.findAll({
                include: [{ model: MenuItem, as: 'menuItem' }]
            });
        } catch (error) {
            throw new Error(`Error fetching menu variations: ${error.message}`);
        }
    }

    async getMenuVariationById(id) {
        try {
            const variation = await MenuVariation.findByPk(id, {
                include: [{ model: MenuItem, as: 'menuItem' }]
            });
            if (!variation) {
                throw new Error('Menu variation not found');
            }
            return variation;
        } catch (error) {
            throw new Error(`Error fetching menu variation: ${error.message}`);
        }
    }

    async createMenuVariation(variationData) {
        try {
            return await MenuVariation.create(variationData);
        } catch (error) {
            throw new Error(`Error creating menu variation: ${error.message}`);
        }
    }

    async updateMenuVariation(id, updateData) {
        try {
            const [updatedCount] = await MenuVariation.update(updateData, {
                where: { id }
            });
            if (updatedCount === 0) {
                throw new Error('Menu variation not found or no changes made');
            }
            return await this.getMenuVariationById(id);
        } catch (error) {
            throw new Error(`Error updating menu variation: ${error.message}`);
        }
    }

    async deleteMenuVariation(id) {
        try {
            const deletedCount = await MenuVariation.destroy({
                where: { id }
            });
            if (deletedCount === 0) {
                throw new Error('Menu variation not found');
            }
            return { message: 'Menu variation deleted successfully' };
        } catch (error) {
            throw new Error(`Error deleting menu variation: ${error.message}`);
        }
    }

    async getVariationsByMenuItemId(menuItemId) {
        try {
            return await MenuVariation.findAll({
                where: { menuItemId },
                include: [{ model: MenuItem, as: 'menuItem' }]
            });
        } catch (error) {
            throw new Error(`Error fetching variations by menu item ID: ${error.message}`);
        }
    }

    async getAvailableVariations(menuItemId) {
        try {
            return await MenuVariation.findAll({
                where: {
                    menuItemId,
                    isAvailable: true
                },
                include: [{ model: MenuItem, as: 'menuItem' }]
            });
        } catch (error) {
            throw new Error(`Error fetching available variations: ${error.message}`);
        }
    }
}

module.exports = new MenuVariationService();
