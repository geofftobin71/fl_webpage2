---
layout: layouts/shop-product.njk
pagination:
  data: valid_shop_products
  size: 1
  alias: product
permalink: "shop/products/{{ product.name | slug }}/index.html"
eleventyComputed:
  title: "{{ product.name }}"
  description: "{{ product.description }}"
  header_image: "{{ product.header_image or product.images[0] }}"
---
