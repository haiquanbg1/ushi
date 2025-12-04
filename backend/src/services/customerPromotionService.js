const { CustomerPromotion, Promotion, Customer, sequelize } = require('../models');
const { Op } = require('sequelize');
const PromotionHelper = require('../utils/promotionHelper');

class CustomerPromotionService {
    // ===== Assignment Operations =====
    async assignToCustomers(promotionId, options = {}) {
        const transaction = await sequelize.transaction();
        try {
            const promotion = await Promotion.findByPk(promotionId);
            if (!promotion) throw new Error('Promotion not found');

            const where = {};
            if (options.onlyRegistered) {
                where.userId = { [Op.ne]: null };
            }
            if (options.customerType) {
                where.customerType = options.customerType;
            }

            const customers = await Customer.findAll({
                where,
                attributes: ['id'],
                raw: true
            });

            if (customers.length === 0) {
                await transaction.rollback();
                return {
                    success: false,
                    message: 'No customers found',
                    assignedCount: 0
                };
            }

            const data = customers.map(c => ({
                promotionId,
                customerId: c.id,
                status: 'available',
                createdAt: new Date(),
                updatedAt: new Date()
            }));

            await CustomerPromotion.bulkCreate(data, {
                ignoreDuplicates: true,
                transaction
            });

            await transaction.commit();
            return {
                success: true,
                message: `Đã gán thành công.`,
                assignedCount: customers.length
            };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async assignToCustomer(promotionId, customerId) {
        const promotion = await Promotion.findByPk(promotionId);
        if (!promotion) throw new Error('Promotion not found');

        const customer = await Customer.findByPk(customerId);
        if (!customer) throw new Error('Customer not found');

        const existing = await CustomerPromotion.findOne({
            where: { promotionId, customerId, status: 'available' }
        });

        if (existing) {
            throw new Error('Promotion already assigned');
        }

        return await CustomerPromotion.create({
            promotionId,
            customerId,
            status: 'available'
        });
    }

    async unassignFromCustomer(promotionId, customerId) {
        const count = await CustomerPromotion.destroy({
            where: {
                promotionId,
                customerId,
                status: 'available'
            }
        });

        if (count === 0) {
            throw new Error('Assignment not found');
        }

        return { message: 'Bỏ gán thành công.' };
    }

    // ===== Usage Operations =====
    async checkEligibility(customerId, promotionId, orderAmount = 0) {
        const customer = await Customer.findByPk(customerId);
        if (!customer) throw new Error('Customer not found');

        const promotion = await Promotion.findByPk(promotionId);
        if (!promotion) throw new Error('Promotion not found');

        // Check assignment
        const assignment = await CustomerPromotion.findOne({
            where: { promotionId, customerId, status: 'available' }
        });

        if (!assignment) {
            return {
                eligible: false,
                reason: 'Promotion not assigned to this customer'
            };
        }

        // Validate promotion
        const validation = PromotionHelper.validatePromotion(promotion, orderAmount);
        if (!validation.valid) {
            return {
                eligible: false,
                reason: validation.reason
            };
        }

        // Calculate discount
        const discount = PromotionHelper.calculateDiscount(promotion, orderAmount);

        return {
            eligible: true,
            promotion: {
                id: promotion.id,
                name: promotion.name,
                type: promotion.type,
                value: promotion.value
            },
            discount
        };
    }

    async applyPromotion(customerId, promotionId, orderId, orderAmount) {
        const transaction = await sequelize.transaction();
        try {
            // Check eligibility
            const check = await this.checkEligibility(customerId, promotionId, orderAmount);
            if (!check.eligible) {
                throw new Error(check.reason);
            }

            // Find assignment
            const assignment = await CustomerPromotion.findOne({
                where: { promotionId, customerId, status: 'available' },
                transaction
            });

            if (!assignment) {
                throw new Error('Promotion assignment not found');
            }

            // Update assignment
            await assignment.update({
                status: 'used',
                usedAt: new Date(),
                discountAmount: check.discount.discountAmount,
                orderId
            }, { transaction });

            // Increment promotion usedCount
            await Promotion.increment('usedCount', {
                where: { id: promotionId },
                transaction
            });

            await transaction.commit();
            return {
                success: true,
                assignment,
                discount: check.discount
            };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async cancelUsage(assignmentId) {
        const transaction = await sequelize.transaction();
        try {
            const assignment = await CustomerPromotion.findByPk(assignmentId, {
                transaction
            });

            if (!assignment) {
                throw new Error('Assignment not found');
            }

            if (assignment.status !== 'used') {
                throw new Error('Only used promotions can be cancelled');
            }

            await assignment.update({ status: 'cancelled' }, { transaction });

            // Decrement usedCount
            await Promotion.decrement('usedCount', {
                where: { id: assignment.promotionId },
                transaction
            });

            await transaction.commit();
            return { message: 'Promotion usage cancelled successfully' };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    // ===== Query Methods =====
    async getCustomerPromotions(customerId, options = {}) {
        const where = { customerId, status: "available" };

        const promotionWhere = {};
        if (!options.includeExpired) {
            promotionWhere.isActive = true;
            promotionWhere.endDate = { [Op.gte]: new Date() };
        }

        return await CustomerPromotion.findAll({
            where,
            include: [{
                model: Promotion,
                as: 'promotion',
                where: Object.keys(promotionWhere).length > 0 ? promotionWhere : undefined,
                required: !options.includeExpired
            }],
            order: [['createdAt', 'DESC']]
        });
    }

    async getPromotionCustomers(promotionId, options = {}) {
        const where = { promotionId };

        if (options.status) {
            where.status = options.status;
        }

        return await CustomerPromotion.findAll({
            where,
            include: [{
                model: Customer,
                as: 'customer',
                attributes: ['id', 'fullName', 'phone', 'email', 'customerType']
            }],
            order: [['createdAt', 'DESC']],
            limit: options.limit || 1000
        });
    }

    async getUsageHistory(filters = {}) {
        const where = {};

        if (filters.customerId) where.customerId = filters.customerId;
        if (filters.promotionId) where.promotionId = filters.promotionId;
        if (filters.status) where.status = filters.status;

        if (filters.startDate || filters.endDate) {
            where.usedAt = {};
            if (filters.startDate) where.usedAt[Op.gte] = new Date(filters.startDate);
            if (filters.endDate) where.usedAt[Op.lte] = new Date(filters.endDate);
        }

        return await CustomerPromotion.findAll({
            where,
            include: [
                {
                    model: Customer,
                    as: 'customer',
                    attributes: ['id', 'fullName', 'customerType']
                },
                {
                    model: Promotion,
                    as: 'promotion',
                    attributes: ['id', 'name', 'type', 'value']
                }
            ],
            order: [['usedAt', 'DESC']],
            limit: filters.limit || 100
        });
    }
}

module.exports = new CustomerPromotionService();