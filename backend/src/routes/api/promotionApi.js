const router = require('express').Router();
const c = require('../../controllers/promotionController');

// Basic CRUD
router.get('/', c.list);                    // GET /api/promotions
router.get('/active', c.getActive);         // GET /api/promotions/active
router.get('/:id', c.get);                  // GET /api/promotions/:id
router.post('/', c.create);                 // POST /api/promotions
router.put('/:id', c.update);               // PUT /api/promotions/:id
router.delete('/:id', c.remove);            // DELETE /api/promotions/:id

// Utility endpoints
router.get('/:id/stats', c.getStats);       // GET /api/promotions/:id/stats
router.get('/:id/validate', c.validate);    // GET /api/promotions/:id/validate?orderAmount=100000
router.post('/:id/clone', c.clone);         // POST /api/promotions/:id/clone

module.exports = router;