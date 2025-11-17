const router = require('express').Router();
const c = require('../../controllers/orderController');

router.get('/', c.list);
router.get('/today', c.today);
router.get('/status/:status', c.byStatus);
router.get('/customer/:customerId', c.byCustomer);
router.get('/table/:tableId/active', c.byTableActive);
router.get('/active-unpaid', c.getActiveUnpaid);
router.get('/:id', c.get);
router.post('/', c.create);
router.post('/:id/items', c.addItems);
router.put('/:id', c.update);
router.patch('/:id/status', c.updateStatus);
router.delete('/:id', c.remove);

module.exports = router;
