const { PromotionMenuItem, Promotion, MenuItem, Category } = require('../models');

class PromotionMenuItemService {
    async getAllPromotionMenuItems() {
        try {
            return await PromotionMenuItem.findAll({
                include: [
                    { model: Promotion, as: 'promotion' },
                    { model: MenuItem, as: 'menuItem' },
                    { model: Category, as: 'category' }
                ]
            });
        } catch (error) {
            throw new Error(`Error fetching promotion menu items: ${error.message}`);
        }
    }

    async getPromotionMenuItemById(id) {
        try {
            const promotionMenuItem = await PromotionMenuItem.findByPk(id, {
                include: [
                    { model: Promotion, as: 'promotion' },
                    { model: MenuItem, as: 'menuItem' },
                    { model: Category, as: 'category' }
                ]
            });
            if (!promotionMenuItem) {
                throw new Error('Promotion menu item not found');
            }
            return promotionMenuItem;
        } catch (error) {
            throw new Error(`Error fetching promotion menu item: ${error.message}`);
        }
    }

    async createPromotionMenuItem(promotionMenuItemData) {
        try {
            return await PromotionMenuItem.create(promotionMenuItemData);
        } catch (error) {
            throw new Error(`Error creating promotion menu item: ${error.message}`);
        }
    }

    async updatePromotionMenuItem(id, updateData) {
        try {
            const [updatedCount] = await PromotionMenuItem.update(updateData, {
                where: { id }
            });
            if (updatedCount === 0) {
                throw new Error('Promotion menu item not found or no changes made');
            }
            return await this.getPromotionMenuItemById(id);
        } catch (error) {
            throw new Error(`Error updating promotion menu item: ${error.message}`);
        }
    }

    async deletePromotionMenuItem(id) {
        try {
            const deletedCount = await PromotionMenuItem.destroy({
                where: { id }
            });
            if (deletedCount === 0) {
                throw new Error('Promotion menu item not found');
            }
            return { message: 'Promotion menu item deleted successfully' };
        } catch (error) {
            throw new Error(`Error deleting promotion menu item: ${error.message}`);
        }
    }

    async getPromotionMenuItemsByPromotionId(promotionId) {
        try {
            return await PromotionMenuItem.findAll({
                where: { promotionId },
                include: [
                    { model: MenuItem, as: 'menuItem' },
                    { model: Category, as: 'category' }
                ]
            });
        } catch (error) {
            throw new Error(`Error fetching promotion menu items by promotion ID: ${error.message}`);
        }
    }
}

module.exports = new PromotionMenuItemService();
