const router = require('express').Router();
const c = require('../../controllers/comboController');
const uploadMiddleware = require("../../middleware/uploadMiddleware")

router.get('/', c.list);
router.get('/active', c.active);
router.get('/:id', c.get);
router.get('/:id/items', c.items);
router.post('/', uploadMiddleware, c.create);
router.put('/:id', uploadMiddleware, c.update);
router.delete('/:id', c.remove);

module.exports = router;
