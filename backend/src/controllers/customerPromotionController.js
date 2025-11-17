const CustomerPromotionService = require('../services/customerPromotionService');

// Assignment endpoints
exports.assignToCustomers = async (req, res) => {
    try {
        const { promotionId } = req.params;
        const data = await CustomerPromotionService.assignToCustomers(promotionId, req.body);
        res.status(200).json({ ok: true, data });
    } catch (e) {
        res.status(400).json({ ok: false, message: e.message });
    }
};

exports.assignToCustomer = async (req, res) => {
    try {
        const { promotionId, customerId } = req.params;
        const data = await CustomerPromotionService.assignToCustomer(promotionId, customerId);
        res.status(201).json({ ok: true, data });
    } catch (e) {
        res.status(400).json({ ok: false, message: e.message });
    }
};

exports.unassignFromCustomer = async (req, res) => {
    try {
        const { promotionId, customerId } = req.params;
        const data = await CustomerPromotionService.unassignFromCustomer(promotionId, customerId);
        res.json({ ok: true, data });
    } catch (e) {
        res.status(400).json({ ok: false, message: e.message });
    }
};

// Usage endpoints
exports.checkEligibility = async (req, res) => {
    try {
        const { customerId, promotionId } = req.params;
        const orderAmount = parseFloat(req.query.orderAmount) || 0;

        const data = await CustomerPromotionService.checkEligibility(
            customerId,
            promotionId,
            orderAmount
        );
        res.json({ ok: true, data });
    } catch (e) {
        res.status(400).json({ ok: false, message: e.message });
    }
};

exports.applyPromotion = async (req, res) => {
    try {
        const { customerId, promotionId } = req.params;
        const { orderId, orderAmount } = req.body;

        const data = await CustomerPromotionService.applyPromotion(
            customerId,
            promotionId,
            orderId,
            orderAmount
        );
        res.json({ ok: true, data });
    } catch (e) {
        res.status(400).json({ ok: false, message: e.message });
    }
};

exports.cancelUsage = async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const data = await CustomerPromotionService.cancelUsage(assignmentId);
        res.json({ ok: true, data });
    } catch (e) {
        res.status(400).json({ ok: false, message: e.message });
    }
};

// Query endpoints
exports.getCustomerPromotions = async (req, res) => {
    try {
        const { customerId } = req.params;
        const data = await CustomerPromotionService.getCustomerPromotions(customerId, req.query);
        res.json({ ok: true, data });
    } catch (e) {
        res.status(400).json({ ok: false, message: e.message });
    }
};

exports.getPromotionCustomers = async (req, res) => {
    try {
        const { promotionId } = req.params;
        const data = await CustomerPromotionService.getPromotionCustomers(promotionId, req.query);
        res.json({ ok: true, data });
    } catch (e) {
        res.status(400).json({ ok: false, message: e.message });
    }
};

exports.getUsageHistory = async (req, res) => {
    try {
        const data = await CustomerPromotionService.getUsageHistory(req.query);
        res.json({ ok: true, data });
    } catch (e) {
        res.status(400).json({ ok: false, message: e.message });
    }
};
