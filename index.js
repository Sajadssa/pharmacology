// import product.js
import { productsData } from "./assets/product.js";
//define variables
const cartBtn = document.querySelector(".cart-btn");
const cartModal = document.querySelector(".cart");
const backDrop = document.querySelector(".backdrop");
const closeModal = document.querySelector(".cart-item-confirm");
const productsDom = document.querySelector(".products-center");
const cartItems = document.querySelector(".cart-items");

const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");

const cartStatus = document.querySelector(".cart-status");

const clearCart = document.querySelector(".clear-cart");
const toggler = document.querySelector(".toggler");
const navbar = document.querySelector(".nav");

let cart = [];

let buttonsDOM = [];

//get all products from product.js with class object

class Products {
  getProducts() {
    return productsData;
  }
}

class UI {
  displayProducts(products) {
    let result = "";
    products.forEach((product) => {
      result += `<div class="product">
              <div class="img-container">
                <img src="${product.imageUrl}" class="product-img" />
              </div>
              <div class="product-desc">
                <p class="product-price">${product.price} هزار تومان </p>
                <p class="product-title"> ${product.title}</p>
              </div>
              <button class="btn add-to-cart" data-id=${product.id} ">
              
               اضافه کردن به سبد خرید
              </button>
            </div>
            `;
    });
    productsDom.innerHTML = result;
  }
  //access to buttons
  getCartBtns() {
    const addToCartBtns = [...document.querySelectorAll(".add-to-cart")];
    buttonsDOM = addToCartBtns;
    addToCartBtns.forEach((btn) => {
      const id = btn.dataset.id;
      //check if product id is in cart or not?

      const isInCart = cart.find((p) => p.id === parseInt(id));
      if (isInCart) {
        btn.innerText = "موجود در سبد خرید ";
        btn.disabled = true;
      }
      //if product id is not in cart
      btn.addEventListener("click", (e) => {
        // console.log(e.target.dataset.id);
        e.target.innerText = "موجود درسبد خرید";
        e.target.disabled = true;
        cartItems.style.opacity = "1";
        if (!cart.length) {
          cartStatus.style.opacity = "0";
        }
        //1.get product from products in local storage

        const addedProduct = { ...Storage.getProduct(id), quantity: 1 };
        //2. add product to cart

        cart = [...cart, addedProduct];

        //3. save cart to local storage
        Storage.saveCart(cart);
        //4. set cart values
        this.setCartValue(cart);

        //5.display cart items
        this.addCartItem(addedProduct);
      });
    });
  }
  //calculation cartItems and totalPrice
  setCartValue(cart) {
    let tempCartItems = 0;
    const totalPrice = cart.reduce((acc, curr) => {
      tempCartItems += curr.quantity; //2+1=3
      // console.log(tempCartItems);
      return curr.quantity * curr.price + acc;
    }, 0);

    cartTotal.innerText = `قیمت کل:${parseFloat(totalPrice).toFixed(2)} تومان`;
    cartItems.innerText = tempCartItems;
  }
  //Display cart items in show modal
  addCartItem(cart) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `<div><img class="cart-item-img" src=${cart.imageUrl} /></div>
 <div class="cart-item-desc">
   <h4>${cart.title}</h4>
   <h5> ${cart.price}هزار تومان</h5>
 </div>
 <div class="cart-item-controller">
   <i class="fas fa-chevron-up" data-id=${cart.id}></i>
   <p class="item-quantity">${cart.quantity}</p>
   <i class="fas fa-chevron-down" data-id=${cart.id}></i>
 </div>
 <i class="fas fa-trash-alt remove-item" data-id=${cart.id}></i>
 `;
    cartContent.appendChild(div);
  }

  //6.remain cart after refresh browser
  setupApp() {
    cart = Storage.getCart();

    this.setCartValue(cart);

    this.populateCart(cart);
  }

  populateCart(cart) {
    cart.forEach((item) => this.addCartItem(item));
  }

  cartLogic() {
    //clear cart button
    clearCart.addEventListener("click", (e) => {
      // console.log('clear',e.target.value)
      this.clearCart();
      closeModalFunction();
    });
    cartContent.addEventListener("click", (event) => {
      // console.log(event.target);
      if (event.target.classList.contains("fa-chevron-up")) {
        console.log(event.target.dataset.id);
        const addQuantity = event.target;
        //1.get item from cart
        const addedItem = cart.find(
          (cItem) => cItem.id == addQuantity.dataset.id
        );
        addedItem.quantity++;
        //2.update cart value
        this.setCartValue(cart);
        //3.save cart
        Storage.saveCart(cart);
        // update cart item an ui
        console.log(addQuantity.nextElementSibling);
        addQuantity.nextElementSibling.innerText = addedItem.quantity;
      } else if (event.target.classList.contains("fa-trash-alt")) {
        const removeItem = event.target;
        //  console.log(event.target);
        const id = removeItem.dataset.id;
        console.log(id);
        const _removedItem = cart.find(
          (c) => c.id === parseInt(removeItem.dataset.id)
        );
        this.removeItem(_removedItem.id);
        this.setCartValue(cart);
        //update cart in storage
        Storage.saveCart(cart);
        //for delete item from cartContent:
        cartContent.removeChild(removeItem.parentElement);
      } else if (event.target.classList.contains("fa-chevron-down")) {
        // console.log(event.target.dataset.id);
        const substractQuantity = event.target;
        //1.get item from cart
        const substractedItem = cart.find(
          (cItem) => cItem.id == substractQuantity.dataset.id
        );

        if (substractedItem.quantity === 1) {
          this.removeItem(substractedItem.id);
          cartContent.removeChild(
            substractQuantity.parentElement.parentElement
          );
        }
        if (!cart.length) cartStatus.style.opacity = "1";
        cartItems.style.opacity = "0";
        // console.log(substractQuantity.parentElement);
        substractedItem.quantity--;
        //2.update cart value
        this.setCartValue(cart);
        //3.save cart
        Storage.saveCart(cart);
        // update cart item an ui
        // console.log(substractQuantity.previousElementSibling);
        substractQuantity.previousElementSibling.innerText =
          substractedItem.quantity;
      }
    });
  }

  clearCart() {
    //loop on all the items and trigger remove for each one
    cart.forEach((item) => this.removeItem(item.id));
    // console.log(cartContent.children[0]);
    while (cartContent.children.length) {
      cartContent.removeChild(cartContent.children[0]);
      if (!cart.length) cartStatus.style.opacity = "1";
      cartItems.style.opacity = "0";
    }
  }

  removeItem(id) {
    //reusable method for single remove and clear all items in cart
    // console.log(id);
    cart = cart.filter((cItems) => cItems.id !== id);
    // console.log(cartContent.children);
    this.setCartValue(cart);
    Storage.saveCart(cart);
    const button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = `
   اضافه کردن به سبد خرید`;
    console.log(buttonsDOM);
  }
  getSingleButton(id) {
    // should be parseInt to get correct result
    return buttonsDOM.find((btn) => parseInt(btn.dataset.id) === parseInt(id));
  }
}

class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }

  static getProduct(id) {
    const _products = JSON.parse(localStorage.getItem("products"));
    return _products.find((p) => p.id === parseInt(id));
  }

  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI(0);
  // set up already added cart items
  ui.setupApp();
  const products = new Products();
  const productsData = products.getProducts();
  // console.log(displayProducts);
  !cart.length
    ? (cartStatus.style.opacity = "1")
    : (cartItems.style.opacity = "1");

  ui.displayProducts(productsData);
  //access to buttons
  ui.getCartBtns();

  Storage.saveProducts(productsData);
  //  console.log(addToCartBtn);
  ui.cartLogic();
});

//modal
function showModalFunction() {
  backDrop.style.display = "block";
  cartModal.style.opacity = "1";
  cartModal.style.top = "20%";
}

function closeModalFunction() {
  backDrop.style.display = "none";
  cartModal.style.opacity = "0";
  cartModal.style.top = "-100%";
}

cartBtn.addEventListener("click", showModalFunction);
closeModal.addEventListener("click", closeModalFunction);
backDrop.addEventListener("click", closeModalFunction);

// navBar toggler
toggler.addEventListener("click", () => {
  navbar.classList.toggle("nav_expanded");
});
/*==================== SCROLL SECTIONS ACTIVE LINK ====================*/
const sections = document.querySelectorAll("section");
const navLi = document.querySelectorAll("nav .container ul li");
window.onscroll = () => {
  var current = "";

  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    if (pageYOffset >= sectionTop - 60) {
      current = section.getAttribute("id");
    }
  });

  navLi.forEach((li) => {
    li.classList.remove("active");
    if (li.classList.contains(current)) {
      li.classList.add("active");
    }
  });
};
