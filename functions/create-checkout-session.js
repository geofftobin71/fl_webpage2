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

function obfuscate(str) {
  let buf = [];
  for (var i = str.length - 1; i >= 0; i--) {
    buf.unshift(['%', (str[i].charCodeAt()).toString(16)].join(''));
  }
  return buf.join('');
}

function escape(htmlStr) {
  if(!htmlStr) { return null; }
  return htmlStr.replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');        
}

function titleCase(str) {
  return str.toLowerCase().split(' ').map(function(word) {
    return word.replace(word[0], word[0].toUpperCase());
  }).join(' ');
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
  const delivery_name = getParam(params['delivery-name']) ?? 'Floriade';
  const delivery_phone = getParam(params['delivery-phone']);
  const delivery_address = getParam(params['delivery-address']) ?? '18 Cambridge Terrace';
  const delivery_suburb = getParam(params['delivery-suburb']) ?? 'Te Aro';
  const delivery_date = getParam(params['delivery-date']);
  const gift_tag_message = getParam(params['gift-tag-message']);
  const special_requests = getParam(params['special-requests']);
  const cardholder_name = getParam(params['cardholder-name']);
  const cardholder_email = getParam(params['cardholder-email']);
  const cardholder_phone = getParam(params['cardholder-phone']);
  const cart_total_check = parseFloat(getParam(params['cart-total-check']));
  const delivery_total_check = parseFloat(getParam(params['delivery-total-check']));
  const obf_email = obfuscate(cardholder_email);

  const cart = JSON.parse(params['cart']);

  const order_date = DateTime.now();

  var line_items = [];
  var shipping_rates;

  var cart_total = 0.0;
  var delivery_fee = 0.0;

  cart.forEach(cart_item => {
    const product = shop_products.products.find(element => element.id === cart_item.product_id);
    const category = shop_categories.categories.find(element => element.id === cart_item.category_id);
    const variant = category.variants.find(element => element.id === cart_item.variant_id);
    const price = parseFloat(variant.price);

    let line_item = {
      price_data: {
        product_data: {
          name: product.name,
          metadata: {
            category: category.name,
            variant: variant.name
          }
        },
        unit_amount: parseInt(price * 100.0),
        currency: 'nzd'
      },
      quantity: 1
    };

    line_items.push(line_item);

    cart_total += price;
  });

  if(delivery_option === 'pickup') {
    shipping_rates = [delivery_ids['pickup']];
  }

  if(delivery_option === 'delivery') {
    delivery_fee = parseFloat(delivery_fees[delivery_suburb.toLowerCase()]);

    // Flat rate $20 on Saturday
    if(delivery_date.startsWith('Sat')) {
      if(delivery_fee < 20.0) {
        delivery_fee = 20.0;
      }
    }

    shipping_rates = [delivery_ids[(delivery_fee * 100.0).toString()]];
  }

  if(cart_total !== cart_total_check) {
    return {
      statusCode: 400,
      body: JSON.stringify({ status: 'Cart Total Mismatch' })
    }
  }

  if(delivery_total !== delivery_total_check) {
    return {
      statusCode: 400,
      body: JSON.stringify({ status: 'Delivery Total Mismatch' })
    }
  }

  const shipping = {
    name: delivery_name,
    phone: delivery_phone,
    address: {
      line1: delivery_address,
      line2: titleCase(delivery_suburb),
      city: 'Wellington',
      country: 'NZ'
    }
  };

  const metadata = {
    timestamp: order_date.toFormat(date_format),
    delivery-option: delivery_option,
    delivery-name: delivery_name,
    delivery-phone: delivery_phone,
    delivery-address: delivery_address,
    delivery-suburb: titleCase(delivery_suburb),
    delivery-date: delivery_date,
    gift-tag-message: gift_tag_message,
    special-requests: special_requests,
    cardholder-name: cardholder_name,
    cardholder-email: cardholder_email,
    cardholder-phone: cardholder_phone,
  };

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: line_items,
    shipping_rates: shipping_rates,
    metadata: metadata,
    payment_intent_data: {
      receipt_email: cardholder_email,
      shipping: shipping
    },
    customer_email: cardholder_email,
    success_url: `${process.env.URL}/thankyou-for-your-order?email=${obf_email}`,
    cancel_url: `${process.env.URL}/checkout/`
  });

  return {
    statusCode: 302,
    headers: { Location: session.url },
    body: ''
  }
};
