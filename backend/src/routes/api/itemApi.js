const router = require('express').Router();
const c = require('../../controllers/itemController');
const uploadMiddleware = require('../../middleware/uploadMiddleware');

router.get('/', c.list);
router.get('/search', c.search);
router.get('/category/:categoryId', c.byCategory);
router.get('/:id', c.get);
router.post('/', uploadMiddleware, c.create);
router.put('/:id', c.update);
router.delete('/:id', c.remove);

module.exports = router;
