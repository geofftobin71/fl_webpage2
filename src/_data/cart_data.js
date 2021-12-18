delete require.cache[require.resolve('./shop_categories.json')];
delete require.cache[require.resolve('./shop_products.json')];

const shop_categories = require('./shop_categories.json');
const shop_products = require('./shop_products.json');

module.exports = function() {
  const valid_shop_products = shop_products.products.filter(product => {
    const category = shop_categories.categories.find(category => category.id === product.category);
    return (product.disabled === false) && (category.disabled === false);
  });

  const valid_shop_categories = shop_categories.categories.filter(category => category.disabled === false);

  let result = {"products":{}, "pre":{} };

  valid_shop_products.forEach(product => {
    const category = shop_categories.categories.find(category => category.id === product.category);
    let variants = {};
    category.variants.forEach(variant => {
      variants[variant.id] = variant.price;
    });
    result.products[product.id] = { "name": product.name, "variants": variants };
  });

  valid_shop_categories.forEach(category => {
    result.pre[category.id] = category.parents;
  });

  return result;
};
