delete require.cache[require.resolve('./data/shop_categories.json')];
delete require.cache[require.resolve('./data/shop_products.json')];
delete require.cache[require.resolve('./data/delivery_fees.json')];

const shop_categories = require('./data/shop_categories.json');
const shop_products = require('./data/shop_products.json');
const delivery_fees = require('./data/delivery_fees.json');

const stripe = require('stripe')(process.env.STRIPE_TEST_SECRET_KEY);
const querystring = require('querystring');

const date_format = "g:ia l j F Y"; // FIXME

function escape(htmlStr) {
  if(!htmlStr) { return null; }
  return htmlStr.replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");        
}

exports.handler = async (event, context) => {

  if(event.httpMethod !== 'POST' || !event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ status: 'Bad Request' })
    }
  }

  const params = querystring.parse(event.body);

  const delivery_option = escape(params.delivery_option.trim()) ?? "none";
  const delivery_name = escape(params.delivery_name.trim()) ?? "Floriade";
  const delivery_phone = escape(params.delivery_phone.trim());
  const delivery_address = escape(params.delivery_address.trim()) ?? "18 Cambridge Terrace";

  /*
  $delivery_suburb = escape(params.delivery_suburb.trim()) ?? "Te Aro";
  $delivery_date = null;
  $gift_tag_message = null;
  $special_requests = null;
  $cardholder_name = null;
  $cardholder_email = null;
  $cardholder_phone = null;
  $workshop_attendee_name = array();
  $workshop_attendee_email = array();
  $cart = array();
  $cart_total = 0.0;
  $delivery_fee = 0.0;
  */

  const cart = JSON.parse(params.cart);

  return {
    statusCode: 200,
    body: JSON.stringify(delivery_phone, null, 2),
  };
};
