const router = require('express').Router();
const c = require('../../controllers/comboController');

router.get('/', c.list);
router.get('/active', c.active);
router.get('/:id', c.get);
router.get('/:id/items', c.items);
router.post('/', c.create);
router.put('/:id', c.update);
router.delete('/:id', c.remove);

module.exports = router;
