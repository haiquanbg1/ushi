const { MenuItem, Category, MenuVariation, OrderDetail, ComboItem, PromotionMenuItem } = require('../models');

class MenuItemService {
    async getAllMenuItems() {
        try {
            return await MenuItem.findAll({
                include: [
                    { model: Category, as: 'category' },
                    { model: MenuVariation, as: 'variations' }
                ],
                order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']]
            });
        } catch (error) {
            throw new Error(`Error fetching menu items: ${error.message}`);
        }
    }

    async getMenuItemById(id) {
        try {
            const menuItem = await MenuItem.findByPk(id, {
                include: [
                    { model: Category, as: 'category' },
                    { model: MenuVariation, as: 'variations' }
                ]
            });
            if (!menuItem) {
                throw new Error('Menu item not found');
            }
            return menuItem;
        } catch (error) {
            throw new Error(`Error fetching menu item: ${error.message}`);
        }
    }

    async createMenuItem(menuItemData) {
        try {
            return await MenuItem.create(menuItemData);
        } catch (error) {
            throw new Error(`Error creating menu item: ${error.message}`);
        }
    }

    async updateMenuItem(id, updateData) {
        try {
            const [updatedCount] = await MenuItem.update(updateData, {
                where: { id }
            });
            if (updatedCount === 0) {
                throw new Error('Menu item not found or no changes made');
            }
            return await this.getMenuItemById(id);
        } catch (error) {
            throw new Error(`Error updating menu item: ${error.message}`);
        }
    }

    async deleteMenuItem(id) {
        try {
            const deletedCount = await MenuItem.destroy({
                where: { id }
            });
            if (deletedCount === 0) {
                throw new Error('Menu item not found');
            }
            return { message: 'Menu item deleted successfully' };
        } catch (error) {
            throw new Error(`Error deleting menu item: ${error.message}`);
        }
    }

    async getAvailableMenuItems() {
        try {
            return await MenuItem.findAll({
                where: { isAvailable: true },
                include: [
                    { model: Category, as: 'category' },
                    { model: MenuVariation, as: 'variations' }
                ],
                order: [['sortOrder', 'ASC']]
            });
        } catch (error) {
            throw new Error(`Error fetching available menu items: ${error.message}`);
        }
    }

    async getMenuItemsByCategory(categoryId) {
        try {
            return await MenuItem.findAll({
                where: { categoryId },
                include: [
                    { model: Category, as: 'category' },
                    { model: MenuVariation, as: 'variations' }
                ],
                order: [['sortOrder', 'ASC']]
            });
        } catch (error) {
            throw new Error(`Error fetching menu items by category: ${error.message}`);
        }
    }

    async searchMenuItems(searchTerm) {
        try {
            const { Op } = require('sequelize');
            return await MenuItem.findAll({
                where: {
                    [Op.or]: [
                        { name: { [Op.like]: `%${searchTerm}%` } },
                        { description: { [Op.like]: `%${searchTerm}%` } }
                    ]
                },
                include: [
                    { model: Category, as: 'category' },
                    { model: MenuVariation, as: 'variations' }
                ]
            });
        } catch (error) {
            throw new Error(`Error searching menu items: ${error.message}`);
        }
    }
}

module.exports = new MenuItemService();
