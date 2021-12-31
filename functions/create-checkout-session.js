delete require.cache[require.resolve('./data/shop_categories.json')];
delete require.cache[require.resolve('./data/shop_products.json')];
delete require.cache[require.resolve('./data/delivery_fees.json')];

const shop_categories = require('./data/shop_categories.json');
const shop_products = require('./data/shop_products.json');
const delivery_fees = require('./data/delivery_fees.json');

const stripe = require('stripe')(process.env.STRIPE_TEST_SECRET_KEY);

exports.handler = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify(shop_products),
  };
};
