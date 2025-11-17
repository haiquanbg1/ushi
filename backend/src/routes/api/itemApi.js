const router = require('express').Router();
const c = require('../../controllers/itemController');

router.get('/', c.list);
router.get('/search', c.search);
router.get('/category/:categoryId', c.byCategory);
router.get('/:id', c.get);
router.post('/', c.create);
router.put('/:id', c.update);
router.delete('/:id', c.remove);

module.exports = router;
