const stripe = require('stripe')(process.env.STRIPE_TEST_SECRET_KEY);

exports.handler = async ({ body, headers }) => {
  try {
    // check the webhook to make sure it’s valid
    const stripeEvent = stripe.webhooks.constructEvent(
      body,
      headers['stripe-signature'],
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if(stripeEvent.type === 'checkout.session.completed') {
      const eventObject = stripeEvent.data.object;
      const items = eventObject.display_items;
      const shippingDetails = eventObject.shipping;

      console.log("OK");

      return {
        statusCode: 200,
        body: JSON.stringify({ received: true })
      }
    }

    console.log("other type");

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true })
    }
  } catch (err) {
    console.log(`Stripe webhook failed with ${err}`);

    return {
      statusCode: 400,
      body: `Webhook Error: ${err.message}`,
    };
  }
};
