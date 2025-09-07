let stripe = null;
try {
  const Stripe = require('stripe');
  if (process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });
  }
} catch (e) {
  // Stripe not installed or not available; will use mock
}

const isStripeAvailable = () => !!stripe;

const createPaymentIntent = async (amount, currency = 'usd', metadata = {}) => {
  if (isStripeAvailable()) {
    const pi = await stripe.paymentIntents.create({ amount, currency, metadata, automatic_payment_methods: { enabled: true } });
    return { id: pi.id, clientSecret: pi.client_secret, status: pi.status };
  }
  // Mock response
  return {
    id: `pi_mock_${Date.now()}`,
    clientSecret: `cs_mock_${Math.random().toString(36).slice(2)}`,
    status: 'requires_payment_method',
    mock: true,
  };
};

const confirmPayment = async (paymentIntentId) => {
  if (isStripeAvailable()) {
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
    return { id: pi.id, status: pi.status };
  }
  return { id: paymentIntentId, status: 'succeeded', mock: true };
};

const refundPayment = async (paymentIntentId, amount) => {
  if (isStripeAvailable()) {
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
    const chargeId = pi.latest_charge;
    const refund = await stripe.refunds.create({ charge: chargeId, amount });
    return { id: refund.id, status: refund.status };
  }
  return { id: `re_mock_${Date.now()}`, status: 'succeeded', mock: true };
};

const getPaymentStatus = async (paymentIntentId) => {
  if (isStripeAvailable()) {
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
    return { id: pi.id, status: pi.status };
  }
  return { id: paymentIntentId, status: 'succeeded', mock: true };
};

module.exports = {
  createPaymentIntent,
  confirmPayment,
  refundPayment,
  getPaymentStatus,
};
