const router = require('express').Router();
const c = require('../../controllers/itemController');
const authMiddleware = require('../../middleware/authMiddleware');
const uploadMiddleware = require('../../middleware/uploadMiddleware');

router.get('/', c.list);
router.get('/search', c.search);
router.get('/category/:categoryId', c.byCategory);
router.get('/:id', c.get);
router.post('/', uploadMiddleware, authMiddleware, c.create);
router.put('/:id', uploadMiddleware, authMiddleware, c.update);
router.delete('/:id', authMiddleware, c.remove);

module.exports = router;
