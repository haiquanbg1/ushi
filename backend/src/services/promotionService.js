const { Promotion, PromotionMenuItem } = require('../models');

class PromotionService {
    async getAllPromotions() {
        try {
            return await Promotion.findAll({
                include: [{ model: PromotionMenuItem, as: 'promotionMenuItems' }],
                order: [['createdAt', 'DESC']]
            });
        } catch (error) {
            throw new Error(`Error fetching promotions: ${error.message}`);
        }
    }

    async getPromotionById(id) {
        try {
            const promotion = await Promotion.findByPk(id, {
                include: [{ model: PromotionMenuItem, as: 'promotionMenuItems' }]
            });
            if (!promotion) {
                throw new Error('Promotion not found');
            }
            return promotion;
        } catch (error) {
            throw new Error(`Error fetching promotion: ${error.message}`);
        }
    }

    async createPromotion(promotionData) {
        try {
            return await Promotion.create(promotionData);
        } catch (error) {
            throw new Error(`Error creating promotion: ${error.message}`);
        }
    }

    async updatePromotion(id, updateData) {
        try {
            const [updatedCount] = await Promotion.update(updateData, {
                where: { id }
            });
            if (updatedCount === 0) {
                throw new Error('Promotion not found or no changes made');
            }
            return await this.getPromotionById(id);
        } catch (error) {
            throw new Error(`Error updating promotion: ${error.message}`);
        }
    }

    async deletePromotion(id) {
        try {
            const deletedCount = await Promotion.destroy({
                where: { id }
            });
            if (deletedCount === 0) {
                throw new Error('Promotion not found');
            }
            return { message: 'Promotion deleted successfully' };
        } catch (error) {
            throw new Error(`Error deleting promotion: ${error.message}`);
        }
    }

    async getActivePromotions() {
        try {
            const { Op } = require('sequelize');
            const currentDate = new Date();
            return await Promotion.findAll({
                where: {
                    isActive: true,
                    startDate: { [Op.lte]: currentDate },
                    endDate: { [Op.gte]: currentDate }
                },
                include: [{ model: PromotionMenuItem, as: 'promotionMenuItems' }]
            });
        } catch (error) {
            throw new Error(`Error fetching active promotions: ${error.message}`);
        }
    }

    async incrementUsageCount(id) {
        try {
            const promotion = await Promotion.findByPk(id);
            if (!promotion) {
                throw new Error('Promotion not found');
            }

            if (promotion.usageLimit && promotion.usedCount >= promotion.usageLimit) {
                throw new Error('Promotion usage limit reached');
            }

            await Promotion.update(
                { usedCount: (promotion.usedCount || 0) + 1 },
                { where: { id } }
            );

            return await this.getPromotionById(id);
        } catch (error) {
            throw new Error(`Error incrementing usage count: ${error.message}`);
        }
    }
}

module.exports = new PromotionService();
