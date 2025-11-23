const router = require('express').Router();
const c = require('../../controllers/orderDetailController');

router.get('/', c.list);
router.get('/order/:orderId', c.byOrder);
router.get('/:id', c.get);
router.post('/', c.create);
router.put('/:id', c.update);
router.put('/:id/item', c.updateItem);
router.put('/:id/combo', c.updateCombo);
router.delete('/:id', c.remove);

module.exports = router;
