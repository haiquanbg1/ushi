const router = require('express').Router();
const c = require('../../controllers/analyticsController');
const authMiddleware = require('../../middleware/authMiddleware');

router.get('/revenue-by-month', authMiddleware, c.revenueByMonth);
router.get('/best-selling-items', authMiddleware, c.bestSellingItems);
router.get('/combo-share', authMiddleware, c.comboShare);
router.get('/kpis', authMiddleware, c.kpis);
router.get('/revenue-vs-orders', authMiddleware, c.revenueVsOrders);

module.exports = router;

