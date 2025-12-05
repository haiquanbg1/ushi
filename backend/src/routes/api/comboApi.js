const router = require('express').Router();
const c = require('../../controllers/comboController');
const authMiddleware = require('../../middleware/authMiddleware');
const uploadMiddleware = require("../../middleware/uploadMiddleware")

router.get('/', c.list);
router.get('/active', c.active);
router.get('/:id', c.get);
router.get('/:id/items', c.items);
router.post('/', uploadMiddleware, authMiddleware, c.create);
router.put('/:id', uploadMiddleware, authMiddleware, c.update);
router.delete('/:id', authMiddleware, c.remove);

module.exports = router;
