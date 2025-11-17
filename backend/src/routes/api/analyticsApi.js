const router = require('express').Router();
const c = require('../../controllers/analyticsController');

router.get('/revenue-by-month', c.revenueByMonth);
router.get('/best-selling-items', c.bestSellingItems);
router.get('/combo-share', c.comboShare);
router.get('/kpis', c.kpis);
router.get('/revenue-vs-orders', c.revenueVsOrders);

module.exports = router;

