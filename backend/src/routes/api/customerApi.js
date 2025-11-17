const router = require('express').Router();
const c = require('../../controllers/customerController');

// Basic CRUD
router.get('/', c.list);           // GET /api/customers
router.get('/:id', c.get);         // GET /api/customers/:id
router.post('/', c.create);        // POST /api/customers
router.put('/:id', c.update);      // PUT /api/customers/:id
router.delete('/:id', c.remove);   // DELETE /api/customers/:id
router.get('/user/:userId', c.getByUser); // GET /api/customers/user/:userId

module.exports = router;