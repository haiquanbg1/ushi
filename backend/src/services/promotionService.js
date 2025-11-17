const { Promotion, CustomerPromotion, Customer } = require('../models');
const { Op } = require('sequelize');

class PromotionService {
    // ===== CRUD Operations =====
    async getAll(filters = {}) {
        const where = {};

        if (filters.isActive !== undefined) {
            where.isActive = filters.isActive;
        }

        if (filters.type) {
            where.type = filters.type;
        }

        return await Promotion.findAll({
            where,
            order: [['createdAt', 'DESC']]
        });
    }

    async getById(id) {
        const promotion = await Promotion.findByPk(id);
        if (!promotion) {
            throw new Error('Promotion not found');
        }
        return promotion;
    }

    async create(data) {
        return await Promotion.create({
            ...data,
            usedCount: 0
        });
    }

    async update(id, data) {
        const promotion = await this.getById(id);

        // Prevent manual update of usedCount
        delete data.usedCount;

        await promotion.update(data);
        return promotion;
    }

    async delete(id) {
        const promotion = await this.getById(id);

        // Check if promotion is being used
        const usageCount = await CustomerPromotion.count({
            where: { promotionId: id, status: 'used' }
        });

        if (usageCount > 0) {
            throw new Error('Cannot delete promotion with usage history');
        }

        await promotion.destroy();
        return { message: 'Promotion deleted successfully' };
    }

    // ===== Query Methods =====
    async getActive() {
        const now = new Date();
        return await Promotion.findAll({
            where: {
                isActive: true,
                startDate: { [Op.lte]: now },
                endDate: { [Op.gte]: now }
            }
        });
    }

    async getStatistics(id) {
        const promotion = await this.getById(id);

        const stats = await CustomerPromotion.findOne({
            where: { promotionId: id },
            attributes: [
                [sequelize.fn('COUNT', sequelize.col('id')), 'totalAssigned'],
                [sequelize.fn('COUNT', sequelize.literal("CASE WHEN status='available' THEN 1 END")), 'availableCount'],
                [sequelize.fn('COUNT', sequelize.literal("CASE WHEN status='used' THEN 1 END")), 'usedCount'],
                [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('discountAmount')), 0), 'totalDiscount']
            ],
            raw: true
        });

        return {
            promotion: {
                id: promotion.id,
                name: promotion.name,
                usageLimit: promotion.usageLimit,
                usedCount: promotion.usedCount
            },
            stats: {
                totalAssigned: parseInt(stats.totalAssigned) || 0,
                availableCount: parseInt(stats.availableCount) || 0,
                usedCount: parseInt(stats.usedCount) || 0,
                totalDiscount: parseFloat(stats.totalDiscount) || 0,
                remainingUsages: promotion.usageLimit ? promotion.usageLimit - promotion.usedCount : null
            }
        };
    }

    // ===== Utility Methods =====
    async deactivateExpired() {
        const [count] = await Promotion.update(
            { isActive: false },
            {
                where: {
                    isActive: true,
                    endDate: { [Op.lt]: new Date() }
                }
            }
        );

        return { message: `Deactivated ${count} expired promotions`, count };
    }

    async clone(id, newData = {}) {
        const original = await this.getById(id);

        return await this.create({
            name: newData.name || `${original.name} (Copy)`,
            type: original.type,
            value: original.value,
            minOrderAmount: original.minOrderAmount,
            maxDiscount: original.maxDiscount,
            description: original.description,
            startDate: newData.startDate || new Date(),
            endDate: newData.endDate || original.endDate,
            usageLimit: original.usageLimit,
            isActive: newData.isActive || false
        });
    }
}

module.exports = new PromotionService();