delete require.cache[require.resolve('./data/shop_categories.json')];
delete require.cache[require.resolve('./data/shop_products.json')];
delete require.cache[require.resolve('./data/delivery_fees.json')];
delete require.cache[require.resolve('./data/site.json')];

const shop_categories = require('./data/shop_categories.json');
const shop_products = require('./data/shop_products.json');
const delivery_fees = require('./data/delivery_fees.json');
const site = require('./data/site.json');

const stripe = require('stripe')(process.env.STRIPE_TEST_SECRET_KEY);
const querystring = require('querystring');

const date_format = "g:ia l j F Y"; // FIXME

var cart_total = 0.0;
var delivery_fee = 0.0;

function escape(htmlStr) {
  if(!htmlStr) { return null; }
  return htmlStr.replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");        
}

function getParam(str) {
  return str ? escape(str.trim()) : null;
}

exports.handler = async (event, context) => {

  if(event.httpMethod !== 'POST' || !event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ status: 'Bad Request' })
    }
  }

  const params = querystring.parse(event.body);

  const delivery_option = getParam(params.delivery_option);
  const delivery_name = getParam(params.delivery_name);
  const delivery_phone = getParam(params.delivery_phone);
  const delivery_address = getParam(params.delivery_address);
  const delivery_suburb = getParam(params.delivery_suburb);
  const delivery_date = getParam(params.delivery_date);
  const gift_tag_message = getParam(params.gift_tag_message);
  const special_requests = getParam(params.special_requests);
  const cardholder_name = getParam(params.cardholder_name);
  const cardholder_email = getParam(params.cardholder_email);
  const cardholder_phone = getParam(params.cardholder_phone);
  const cart_total_check = getParam(params['cart-total-check']);

  const cart = JSON.parse(params.cart);

  const test = {
    a: delivery_name,
    b: cart_total_check
  };

  return {
    statusCode: 200,
    body: JSON.stringify(test, null, 2),
  };
};
