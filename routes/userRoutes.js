const express = require('express');
const router = express.Router();
const userController = require('../controllers/userControllers');
const auth = require('../middlewares/auth');
const { handleValidationErrors } = require('../middlewares/errorHandler');
const { validateNewUser } = require('../middlewares/validators');

// Registration form
router.get('/new', auth.isGuest, userController.renderRegister);
router.post('/', auth.isGuest, validateNewUser, handleValidationErrors, userController.create);

// Login form
router.get('/login', auth.isGuest, userController.renderLogin);    
router.post('/login', auth.isGuest, userController.login); 

// Profile page
router.get('/profile', auth.isLoggedIn, userController.renderProfile);
router.get('/logout', auth.isLoggedIn, userController.logout);



module.exports = router;
