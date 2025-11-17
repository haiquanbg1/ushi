const router = require('express').Router();
const c = require('../../controllers/roleController');

router.get('/', c.list);
router.post('/', c.create);

module.exports = router;
