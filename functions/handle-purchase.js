const nodemailer = require('nodemailer');
const stripe = require('stripe')(process.env.STRIPE_TEST_SECRET_KEY);

exports.handler = async (event, context, callback) => {
  try {
    // check the webhook to make sure it’s valid
    const stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      event.headers['stripe-signature'],
      process.env.STRIPE_WEBHOOK_SECRET
    );

    // only do stuff if this is a successful Stripe Checkout purchase
    if (stripeEvent.type === 'checkout.session.completed') {
      const object = stripeEvent.data.object;

      const session = await stripe.checkout.sessions.retrieve(object.id, {expand: ['payment_intent']});
      const lineItems = await stripe.checkout.sessions.listLineItems(object.id, {limit: 100, expand: ['data.price.product']});
      const items = lineItems.data;

      // Send and email to our fulfillment provider using Nodemailer
      var transporter = nodemailer.createTransport({
        host: "smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "ba2cc93943e6dc",
          pass: "01a7c7d695af91"
        }
      });

      const name = 'Geoff Tobin';
      const email = 'geofftobin71@gmail.com';

      transporter.sendMail({
        from: '"Floriade" <no-reply@mailgen.js>',
        to: '"Floriade" <no-reply@mailgen.js>',
        subject: `New purchase from ${name}`,
        text: JSON.stringify(session, null, 2) + "\n\n" + JSON.stringify(items, null, 2),
      }, function (err) {
        if(err) {
          console.error(err);

          return callback(null, {
            statusCode: 400,
            body: JSON.stringify({
              error: err
            })
          });
        }
      });

      // console.log("Mail Sent");
    }

    return callback(null, {
      statusCode: 200,
      body: JSON.stringify({ received: true })
    });
  } catch (err) {
    console.error(`Stripe webhook failed with ${err}`);

    return callback(null, {
      statusCode: 400,
      body: `Webhook Error: ${err.message}`,
    });
  }
}
