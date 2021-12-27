delete require.cache[require.resolve('./shop_categories.json')];
delete require.cache[require.resolve('./shop_products.json')];
delete require.cache[require.resolve('./delivery_fees.json')];

const shop_categories = require('./shop_categories.json');
const shop_products = require('./shop_products.json');
const delivery_fees = require('./delivery_fees.json');

function obfuscate(str) {
    let buf = [];

    for (var i = str.length - 1; i >= 0; i--) {
          buf.unshift(['&#', str[i].charCodeAt(), ';'].join(''));
        }

    return buf.join('');
}

module.exports = function() {
  const valid_shop_products = shop_products.products.filter(product => {
    const category = shop_categories.categories.find(category => category.id === product.category);
    return (product.disabled === false) && (category.disabled === false);
  });

  const valid_shop_categories = shop_categories.categories.filter(category => category.disabled === false);

  let result = {"p":{}, "d":{} };

  valid_shop_products.forEach(product => {
    const category = shop_categories.categories.find(category => category.id === product.category);
    let variants = {};
    category.variants.forEach(variant => {
      variants[variant.id] = variant.price.toString(16);
    });
    result.p[product.id] = { "n": obfuscate(product.name), "v": variants };
  });

  for (const [key, value] of Object.entries(delivery_fees)) {
    result.d[key] = value;
  };

  return result;
};
