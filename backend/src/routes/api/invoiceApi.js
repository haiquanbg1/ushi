const router = require('express').Router();
const c = require('../../controllers/invoiceController');

router.get('/', c.list);
router.get('/order/:orderId', c.byOrderId);
router.get('/:id', c.get);
router.post('/', c.create);
router.put('/:id', c.update);
router.delete('/:id', c.remove);

module.exports = router;
