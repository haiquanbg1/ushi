const PromotionService = require('../services/promotionService');
const PromotionHelper = require('../utils/promotionHelper');

exports.list = async (req, res) => {
    try {
        const data = await PromotionService.getAll(req.query);
        res.json({ ok: true, data });
    } catch (e) {
        res.status(500).json({ ok: false, message: e.message });
    }
};

exports.get = async (req, res) => {
    try {
        const data = await PromotionService.getById(req.params.id);
        res.json({ ok: true, data });
    } catch (e) {
        res.status(404).json({ ok: false, message: e.message });
    }
};

exports.create = async (req, res) => {
    try {
        const data = await PromotionService.create(req.body);
        res.status(201).json({ ok: true, data });
    } catch (e) {
        res.status(400).json({ ok: false, message: e.message });
    }
};

exports.update = async (req, res) => {
    try {
        const data = await PromotionService.update(req.params.id, req.body);
        res.json({ ok: true, data });
    } catch (e) {
        res.status(400).json({ ok: false, message: e.message });
    }
};

exports.remove = async (req, res) => {
    try {
        const data = await PromotionService.delete(req.params.id);
        res.json({ ok: true, data });
    } catch (e) {
        res.status(400).json({ ok: false, message: e.message });
    }
};

exports.getActive = async (req, res) => {
    try {
        const data = await PromotionService.getActive();
        res.json({ ok: true, data });
    } catch (e) {
        res.status(500).json({ ok: false, message: e.message });
    }
};

exports.getStats = async (req, res) => {
    try {
        const data = await PromotionService.getStatistics(req.params.id);
        res.json({ ok: true, data });
    } catch (e) {
        res.status(400).json({ ok: false, message: e.message });
    }
};

exports.validate = async (req, res) => {
    try {
        const promotion = await PromotionService.getById(req.params.id);
        const orderAmount = parseFloat(req.query.orderAmount) || 0;

        const validation = PromotionHelper.validatePromotion(promotion, orderAmount);
        const discount = validation.valid
            ? PromotionHelper.calculateDiscount(promotion, orderAmount)
            : null;

        res.json({
            ok: true,
            data: { ...validation, discount }
        });
    } catch (e) {
        res.status(400).json({ ok: false, message: e.message });
    }
};

exports.clone = async (req, res) => {
    try {
        const data = await PromotionService.clone(req.params.id, req.body);
        res.status(201).json({ ok: true, data });
    } catch (e) {
        res.status(400).json({ ok: false, message: e.message });
    }
};