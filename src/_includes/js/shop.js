var cart = JSON.parse(localStorage.getItem("floriade-cart")) || [];
var cart_total = 0;

function uid() {
  let uID = '';
  let length = 8;
  let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    uID += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return uID;
};

function computeCartTotal() {
  cart_total = 0;

  cart.forEach(cart_item => {
    let product = getProduct(cart_item["product-id"]);
    let price = getPrice(product, cart_item["variant-id"]);

    cart_total += price;
  });
}

function showViewCart() {
  if(cart.length > 0) {
    const view_cart = document.getElementById("view-cart");
    if(view_cart) {
      view_cart.style.display = "flex";
    }
  }
}

function showError(message) {
  const error_msg = document.getElementById("error-msg");
  if(error_msg) {
    error_msg.innerText = message;
    error_msg.style.visibility = "visible";
  }

  const info = document.getElementById("info");
  if(info) {
    info.style.display = "none";
  }
}

function hideError() {
  const error_msg = document.getElementById("error-msg");
  if(error_msg) {
    error_msg.style.visibility = "hidden";
  }
}

function showAddToCart(parents) {
  const variants = document.querySelectorAll("input[name='variant-id']");

  let ok = true;

  if(variants && variants.length > 1) {
    const selected_variant = document.querySelector("input[name='variant-id']:checked");
    if(!selected_variant) { ok = false; }
  }

  if(parents && parents.length > 0) {
    const cart_parent = cart.find(element => parents.includes(element.category_id));
    if(!cart_parent) { ok = false; }
  }

  if(ok) {
    const add_to_cart_button = document.getElementById("add-to-cart-button");
    if(add_to_cart_button) {
      add_to_cart_button.disabled = false;
    }

    const add_to_cart_message = document.getElementById("add-to-cart-message");
    if(add_to_cart_message) {
      add_to_cart_message.style.visibility = "hidden";
    }
  }
}

function addToCart(product_id, category_id) {
  const variants = document.querySelectorAll("input[name='variant-id']");

  let variant_id;
  if(variants) {
    let variant_input;
    if(variants.length > 1) {
      variant_input = document.querySelector("input[name='variant-id']:checked");
    } else {
      variant_input = document.querySelector("input[name='variant-id']");
    }
    if(variant_input) {
      variant_id = variant_input.value;
    } else {
      location.reload();
      return;
    }
  }

  const product_count = 1;

  for(let i = 0; i < product_count; ++i) {
    cart.push({
      "cart_id": uid(),
      "category_id": category_id,
      "product_id": product_id,
      "variant_id": variant_id
    });
  }

  localStorage.setItem("floriade-cart", JSON.stringify(cart));
  localStorage.setItem("floriade-cart-info", product_count + (product_count === 1 ? " item was" : " items were") + " added to your cart");
  window.location.href = "/cart/";
}

function clearCart() {
  localStorage.clear();
}
