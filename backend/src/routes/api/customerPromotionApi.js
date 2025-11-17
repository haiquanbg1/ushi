const router = require('express').Router();
const c = require('../../controllers/customerPromotionController');

// Assignment Management
router.post('/promotions/:promotionId/assign', c.assignToCustomers);
// POST /api/customer-promotions/promotions/:promotionId/assign
// Body: { onlyRegistered: true, customerType: 'vip' }

router.post('/promotions/:promotionId/customers/:customerId', c.assignToCustomer);
// POST /api/customer-promotions/promotions/:promotionId/customers/:customerId

router.delete('/promotions/:promotionId/customers/:customerId', c.unassignFromCustomer);
// DELETE /api/customer-promotions/promotions/:promotionId/customers/:customerId

// Usage Management
router.get('/customers/:customerId/promotions/:promotionId/check', c.checkEligibility);
// GET /api/customer-promotions/customers/:customerId/promotions/:promotionId/check?orderAmount=100000

router.post('/customers/:customerId/promotions/:promotionId/apply', c.applyPromotion);
// POST /api/customer-promotions/customers/:customerId/promotions/:promotionId/apply
// Body: { orderId: 123, orderAmount: 100000 }

router.post('/assignments/:assignmentId/cancel', c.cancelUsage);
// POST /api/customer-promotions/assignments/:assignmentId/cancel

// Query Endpoints
router.get('/customers/:customerId/promotions', c.getCustomerPromotions);
// GET /api/customer-promotions/customers/:customerId/promotions?status=available

router.get('/promotions/:promotionId/customers', c.getPromotionCustomers);
// GET /api/customer-promotions/promotions/:promotionId/customers?status=used

router.get('/usage-history', c.getUsageHistory);
// GET /api/customer-promotions/usage-history?customerId=1&startDate=2024-01-01

module.exports = router;