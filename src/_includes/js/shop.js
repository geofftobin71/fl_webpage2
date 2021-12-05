var cart = JSON.parse(localStorage.getItem("floriade-cart")) || [];
var cart_total = 0;

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
    const view_cart = document.getElementById('view-cart');
    if(view_cart) {
      view_cart.style.display = "flex";
    }
  }
}

function showError(message) {
  const error_msg = document.getElementById('error-msg');
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
  const error_msg = document.getElementById('error-msg');
  if(error_msg) {
    error_msg.style.visibility = "hidden";
  }
}

function showAddToCart() {
  const add_to_cart_button = document.getElementById("add-to-cart-button");
  if(add_to_cart_button) {
    document.getElementById("add-to-cart-button").disabled = false;
  }
}
