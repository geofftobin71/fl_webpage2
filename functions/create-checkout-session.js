delete require.cache[require.resolve('./data/shop_categories.json')];
delete require.cache[require.resolve('./data/shop_products.json')];
delete require.cache[require.resolve('./data/delivery_fees.json')];

const shop_categories = require('./data/shop_categories.json');
const shop_products = require('./data/shop_products.json');
const delivery_fees = require('./data/delivery_fees.json');

const stripe = require('stripe')(process.env.STRIPE_TEST_SECRET_KEY);

exports.handler = async (event, context) => {

  if(event.httpMethod !== 'POST' || !event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ status: 'Bad Request' })
    }
  }

  let body = JSON.parse(event.body);

  return {
    statusCode: 200,
    body: JSON.stringify(body, null, 2),
  };
};
