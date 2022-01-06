const nodemailer = require('nodemailer');
const stripe = require('stripe')(process.env.STRIPE_TEST_SECRET_KEY);

exports.handler = async ({ body, headers }) => {
  try {
    // check the webhook to make sure it’s valid
    const stripeEvent = stripe.webhooks.constructEvent(
      body,
      headers['stripe-signature'],
      process.env.STRIPE_WEBHOOK_SECRET
    );

    // only do stuff if this is a successful Stripe Checkout purchase
    if (stripeEvent.type === 'checkout.session.completed') {
      const eventObject = stripeEvent.data.object;
      const items = eventObject.display_items;
      const shippingDetails = eventObject.shipping;

      // Send and email to our fulfillment provider using Nodemailer
      var transporter = nodemailer.createTransport({
        host: "smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "ba2cc93943e6dc",
          pass: "01a7c7d695af91"
        }
      });

        console.log(transporter ? "OK" : "failed");
        console.log(JSON.stringify(eventObject, null, 2));

      const name = 'Geoff Tobin';
      const email = 'geofftobin71@gmail.com';

      transporter.sendMail({
        from: '"Floriade" <no-reply@mailgen.js>',
        to: `"${name}" <${email}>`,
        subject: `New purchase from ${shippingDetails.name}`,
        text: JSON.stringify(eventObject, null, 2),
      }, function (err) {
        if(err) {
          console.error(err);

          return {
            statusCode: 400,
            body: JSON.stringify({
              error: err
            })
          }
        }

        return {
          statusCode: 200,
          body: JSON.stringify({ received: true })
        }
      });
    }

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
