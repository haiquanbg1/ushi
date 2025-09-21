const { Category, MenuItem, PromotionMenuItem } = require('../models');

class CategoryService {
    async getAllCategories() {
        try {
            return await Category.findAll({
                include: [{
                    model: MenuItem,
                    as: 'menuItems'
                }],
                order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']]
            });
        } catch (error) {
            throw new Error(`Error fetching categories: ${error.message}`);
        }
    }

    async getCategoryById(id) {
        try {
            const category = await Category.findByPk(id, {
                include: [{
                    model: MenuItem,
                    as: 'menuItems'
                }]
            });
            if (!category) {
                throw new Error('Category not found');
            }
            return category;
        } catch (error) {
            throw new Error(`Error fetching category: ${error.message}`);
        }
    }

    async createCategory(categoryData) {
        try {
            return await Category.create(categoryData);
        } catch (error) {
            throw new Error(`Error creating category: ${error.message}`);
        }
    }

    async updateCategory(id, updateData) {
        try {
            const [updatedCount] = await Category.update(updateData, {
                where: { id }
            });
            if (updatedCount === 0) {
                throw new Error('Category not found or no changes made');
            }
            return await this.getCategoryById(id);
        } catch (error) {
            throw new Error(`Error updating category: ${error.message}`);
        }
    }

    async deleteCategory(id) {
        try {
            const deletedCount = await Category.destroy({
                where: { id }
            });
            if (deletedCount === 0) {
                throw new Error('Category not found');
            }
            return { message: 'Category deleted successfully' };
        } catch (error) {
            throw new Error(`Error deleting category: ${error.message}`);
        }
    }

    async getActiveCategories() {
        try {
            return await Category.findAll({
                where: { isActive: true },
                include: [{
                    model: MenuItem,
                    as: 'menuItems',
                    where: { isAvailable: true },
                    required: false
                }],
                order: [['sortOrder', 'ASC']]
            });
        } catch (error) {
            throw new Error(`Error fetching active categories: ${error.message}`);
        }
    }
}

module.exports = new CategoryService();
