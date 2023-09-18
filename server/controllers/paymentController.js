const catchAsyncError = require('../middlewares/catchAsyncError');
const Stripe = require('stripe');
const stripe = Stripe('sk_test_51NoKwsSD1O2b9p9DtkaVjAQDWdP9rpZQD9IACMhxKo6zpfl8fsPMxhg0pJY9eIL0gHhTyGZLuQrZW5bs6yuFhp5n00NcBSXJMJ')

exports.processPayment = catchAsyncError(async (req, res, next) => {
  console.log('Passed');
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: req.body.amount,
      currency: 'usd',
      description: 'TEST PAYMENT',
      metadata: {
        integration_check: 'accept_payment',
      },
      shipping: req.body.shipping,
    });
    console.log('Passed2');

    res.status(200).json({
      success: true,
      client_secret: paymentIntent.client_secret,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      error: 'Payment processing failed.',
    });
  }
});

exports.sendStripeApi = catchAsyncError(async (req, res, next) => {
  res.status(200).json({
    stripeApiKey: process.env.STRIPE_API_KEY,
  });
});