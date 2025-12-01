const { Item, Category, OrderDetail, ComboItem } = require('../models');

class ItemService {
    async getAllItems() {
        try {
            return await Item.findAll({
                include: [
                    { model: Category, as: 'category' },
                ],
                order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']]
            });
        } catch (error) {
            throw new Error(`Error fetching menu items: ${error.message}`);
        }
    }

    async getItemById(id) {
        try {
            const item = await Item.findByPk(id, {
                include: [
                    { model: Category, as: 'category' },
                ]
            });
            if (!item) {
                throw new Error('Menu item not found');
            }
            return item;
        } catch (error) {
            throw new Error(`Error fetching menu item: ${error.message}`);
        }
    }

    async createItem(itemData) {
        try {
            // Validate dữ liệu trước khi tạo (tùy chọn)
            if (!itemData.image) {
                throw new Error('Image URL is required');
            }

            const newItem = await Item.create(itemData);
            return newItem;
        } catch (error) {
            throw new Error(`Error creating menu item: ${error.message}`);
        }
    }

    async updateItem(id, updateData) {
        try {
            const [updatedCount] = await Item.update(updateData, {
                where: { id }
            });
            if (updatedCount === 0) {
                throw new Error('Menu item not found or no changes made');
            }
            return await this.getItemById(id);
        } catch (error) {
            throw new Error(`Error updating menu item: ${error.message}`);
        }
    }

    async deleteItem(id) {
        try {
            const deletedCount = await Item.destroy({
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

    async getAvailableItems() {
        try {
            return await Item.findAll({
                where: { isAvailable: true },
                include: [
                    { model: Category, as: 'category' },
                ],
                order: [['sortOrder', 'ASC']]
            });
        } catch (error) {
            throw new Error(`Error fetching available menu items: ${error.message}`);
        }
    }

    async getItemsByCategory(categoryId) {
        try {
            return await Item.findAll({
                where: { categoryId },
                include: [
                    { model: Category, as: 'category' },
                ],
                order: [['sortOrder', 'ASC']]
            });
        } catch (error) {
            throw new Error(`Error fetching menu items by category: ${error.message}`);
        }
    }

    async searchItems(searchTerm) {
        try {
            const { Op } = require('sequelize');
            return await Item.findAll({
                where: {
                    [Op.or]: [
                        { name: { [Op.like]: `%${searchTerm}%` } },
                        { description: { [Op.like]: `%${searchTerm}%` } }
                    ]
                },
                include: [
                    { model: Category, as: 'category' },
                ]
            });
        } catch (error) {
            throw new Error(`Error searching menu items: ${error.message}`);
        }
    }
}

module.exports = new ItemService();
