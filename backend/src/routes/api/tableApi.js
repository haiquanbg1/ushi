const router = require('express').Router();
const c = require('../../controllers/tableController');
const authMiddleware = require("../../middleware/authMiddleware");

router.get('/', authMiddleware, c.list);
router.get('/:id', authMiddleware, c.get);
router.post('/', authMiddleware, c.create);
router.put('/:id', authMiddleware, c.update);
router.delete('/:id', authMiddleware, c.remove);

module.exports = router;
