delete require.cache[require.resolve('./data/shop_categories.json')];
delete require.cache[require.resolve('./data/shop_products.json')];
delete require.cache[require.resolve('./data/delivery_fees.json')];
delete require.cache[require.resolve('./data/site.json')];

const shop_categories = require('./data/shop_categories.json');
const shop_products = require('./data/shop_products.json');
const delivery_fees = require('./data/delivery_fees.json');
const site = require('./data/site.json');

const { Settings, DateTime } = require('luxon'); 
const stripe = require('stripe')(process.env.STRIPE_TEST_SECRET_KEY);
const querystring = require('querystring');

Settings.defaultZoneName = 'Pacific/Auckland';

const date_format = 'h:mma cccc d LLLL yyyy';

var cart_total = 0.0;
var delivery_fee = 0.0;

function obfuscate(str) {
  return str;
  let buf = [];
  for (var i = str.length - 1; i >= 0; i--) {
    buf.unshift(['%', parseInt(str[i].charCodeAt(),16)].join(''));
  }
  return buf.join('');
}

function escape(htmlStr) {
  if(!htmlStr) { return null; }
  return htmlStr.replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");        
}

function getParam(str) {
  return (str ? escape(str.trim()) : null);
}

exports.handler = async (event, context) => {

  if(event.httpMethod !== 'POST' || !event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ status: 'Bad Request' })
    }
  }

  const params = querystring.parse(event.body);

  const delivery_option = getParam(params['delivery-option']);
  const delivery_name = getParam(params['delivery-name']);
  const delivery_phone = getParam(params['delivery-phone']);
  const delivery_address = getParam(params['delivery-address']);
  const delivery_suburb = getParam(params['delivery-suburb']);
  const delivery_date = getParam(params['delivery-date']);
  const gift_tag_message = getParam(params['gift-tag-message']);
  const special_requests = getParam(params['special-requests']);
  const cardholder_name = getParam(params['cardholder-name']);
  const cardholder_email = getParam(params['cardholder-email']);
  const cardholder_phone = getParam(params['cardholder-phone']);
  const cart_total_check = parseFloat(getParam(params['cart-total-check']));
  const delivery_total_check = parseFloat(getParam(params['delivery-total-check']));

  const cart = JSON.parse(params['cart']);

  const order_date = DateTime.now();

  let items;
  let shipping_rates;
  let metadata;
  let shipping;

  const obf_email = obfuscate(cardholder_email);

  console.log(obf_email);

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: items,
    shipping_rates: shipping_rates,
    metadata: metadata,
    payment_intent_data: [
      receipt_email: cardholder_email,
      shipping: shipping
    ],
    customer_email: cardholder_email,
    success_url: `${process.env.URL}/thankyou-for-your-order?session-id={CHECKOUT_SESSION_ID}&email=${obf_email}`,
    cancel_url: `${process.env.URL}/checkout/`
  });

  return {
    statusCode: 302,
    headers: { Location: session.url },
    body: ''
  }
};
