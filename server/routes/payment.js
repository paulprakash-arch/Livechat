const express = require('express');
const { isAuntenticatedUser } = require('../middlewares/authenticate');
const {processPayment, sendStripeApi} = require('../controllers/paymentController');
const router = express.Router();

router.route('/payment/process').post(isAuntenticatedUser, processPayment);
router.route('/stripeapi').get(isAuntenticatedUser,sendStripeApi);


module.exports = router