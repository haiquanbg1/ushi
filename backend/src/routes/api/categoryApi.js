const router = require('express').Router();
const c = require('../../controllers/categoryController');
const authMiddleware = require("../../middleware/authMiddleware");

router.get('/', c.list);
router.get('/active', c.active);
router.get('/:id', c.get);
router.post('/', authMiddleware, c.create);
router.put('/:id', authMiddleware, c.update);
router.delete('/:id', authMiddleware, c.remove);

module.exports = router;
