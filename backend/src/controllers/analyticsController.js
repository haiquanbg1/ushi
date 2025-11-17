const AnalyticsService = require('../services/analyticsService');

exports.revenueByMonth = async (req, res) => {
    try {
        const months = parseInt(req.query.months) || 6;
        res.json({ ok: true, data: await AnalyticsService.getRevenueByMonth(months) });
    } catch (e) {
        res.status(500).json({ ok: false, message: e.message });
    }
};

exports.bestSellingItems = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        res.json({ ok: true, data: await AnalyticsService.getBestSellingItems(limit) });
    } catch (e) {
        res.status(500).json({ ok: false, message: e.message });
    }
};

exports.comboShare = async (req, res) => {
    try {
        res.json({ ok: true, data: await AnalyticsService.getComboShare() });
    } catch (e) {
        res.status(500).json({ ok: false, message: e.message });
    }
};

exports.kpis = async (req, res) => {
    try {
        res.json({ ok: true, data: await AnalyticsService.getKPIs() });
    } catch (e) {
        res.status(500).json({ ok: false, message: e.message });
    }
};

exports.revenueVsOrders = async (req, res) => {
    try {
        const months = parseInt(req.query.months) || 6;
        res.json({ ok: true, data: await AnalyticsService.getRevenueVsOrders(months) });
    } catch (e) {
        res.status(500).json({ ok: false, message: e.message });
    }
};

