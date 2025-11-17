class PromotionHelper {
    /**
     * Validate promotion eligibility
     */
    static validatePromotion(promotion, orderAmount = 0) {
        if (!promotion) {
            return { valid: false, reason: 'Promotion not found' };
        }

        if (!promotion.isActive) {
            return { valid: false, reason: 'Promotion is inactive' };
        }

        const now = new Date();
        if (now < new Date(promotion.startDate)) {
            return { valid: false, reason: 'Promotion has not started yet' };
        }
        if (now > new Date(promotion.endDate)) {
            return { valid: false, reason: 'Promotion has expired' };
        }

        if (promotion.usageLimit && promotion.usedCount >= promotion.usageLimit) {
            return { valid: false, reason: 'Promotion usage limit reached' };
        }

        if (promotion.minOrderAmount && orderAmount < promotion.minOrderAmount) {
            return {
                valid: false,
                reason: `Minimum order amount is ${promotion.minOrderAmount.toLocaleString()} VND`
            };
        }

        return { valid: true, promotion };
    }

    /**
     * Calculate discount amount
     */
    static calculateDiscount(promotion, orderAmount) {
        let discount = 0;

        if (promotion.type === 'percent') {
            discount = (orderAmount * promotion.value) / 100;
            if (promotion.maxDiscount && discount > promotion.maxDiscount) {
                discount = promotion.maxDiscount;
            }
        } else if (promotion.type === 'amount') {
            discount = Math.min(promotion.value, orderAmount);
        }

        return {
            discountAmount: parseFloat(discount.toFixed(2)),
            finalAmount: parseFloat((orderAmount - discount).toFixed(2))
        };
    }
}

module.exports = PromotionHelper;