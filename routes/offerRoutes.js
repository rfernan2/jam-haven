const express = require('express');
const router = express.Router({ mergeParams: true });
const offerController = require('../controllers/offerController');
const { validateOffer } = require('../middlewares/validators');
const { handleValidationErrors } = require('../middlewares/errorHandler');
const auth = require('../middlewares/auth');

router.post('/', validateOffer, handleValidationErrors, offerController.createOffer);
router.get('/', auth.isLoggedIn, auth.isSeller, offerController.viewOffers);
router.post('/:offerId/accept', offerController.acceptOffer);


module.exports = router;
