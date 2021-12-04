delete require.cache[require.resolve('./shop_categories.json')];
delete require.cache[require.resolve('./shop_products.json')];

const shop_categories = require('./shop_categories.json');
const shop_products = require('./shop_products.json');

module.exports = function() {
  return shop_products.products.filter(product => {
    const category = shop_categories.categories.find(category => category.name === product.category);
    return (product.disabled === false) && (category.disabled === false);
  });
};
