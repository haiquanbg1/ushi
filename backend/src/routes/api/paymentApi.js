const router = require('express').Router();
const c = require('../../controllers/paymentController');

router.get('/', c.list);
router.get('/status/:status', c.byStatus);
router.get('/order/:orderId', c.byOrderId);
router.get('/:id', c.get);
router.post('/', c.create);
router.post('/:id/confirm', c.confirmPayment);
router.put('/:id', c.update);
router.delete('/:id', c.remove);

module.exports = router;
