const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const auth = require('../middlewares/auth');
const { validateNewItem } = require('../middlewares/validators');
const offerRoutes = require('./offerRoutes');

router.use('/:itemId/offers', offerRoutes);

// Show all items
router.get('/', itemController.index);

// Search items
router.get('/new', auth.isLoggedIn, itemController.getNewItemForm);
router.post('/', auth.isLoggedIn, validateNewItem, itemController.createNewItem);

// Show single item
router.get('/:id', itemController.getItemById);

// Edit & Delete
router.get('/:id/edit', auth.isSeller, itemController.getEditItemForm);
router.put('/:id', auth.isSeller, itemController.updateItem);
router.delete('/:id', auth.isSeller, itemController.deleteItem);


module.exports = router;
