const category_nav_list = document.querySelector(".category_nav_list");
const nav_links = document.querySelector(".nav_links");
const cart_sidebar = document.querySelector(".cart");
const cartOverlay = document.getElementById("cart_overlay");
const searchForm = document.getElementById("search_form");
const searchInput = document.getElementById("search");
const countdownElement = document.getElementById("deal_countdown");
const darkModeToggle = document.getElementById("darkModeToggle");
const backToTopBtn = document.getElementById("backToTop");
const comparePanel = document.getElementById("compare_panel");
const compareItems = document.getElementById("compare_items");
const compareCount = document.getElementById("compare_count");
const compareReviewBtn = document.getElementById("compare_review");
const compareClearBtn = document.getElementById("compare_clear");
const couponInput = document.getElementById("coupon_code");
const applyCouponBtn = document.getElementById("apply_coupon");
const couponFeedback = document.getElementById("coupon_feedback");
const modalBackdrop = document.getElementById("modal_backdrop");
const productModal = document.getElementById("product_modal");
const loginModal = document.getElementById("login_modal");
const loginForm = document.getElementById("login_form");
const loginModalTitle = document.getElementById("login_modal_title");
const loginMessage = document.getElementById("login_message");
const compareModal = document.getElementById("compare_modal");
const compareModalBody = document.getElementById("compare_modal_body");
const modalProductImg = document.getElementById("modal_product_img");
const modalProductName = document.getElementById("modal_product_name");
const modalProductPrice = document.getElementById("modal_product_price");
const modalProductOldPrice = document.getElementById("modal_product_old_price");
const modalProductDescription = document.getElementById("modal_product_description");
const modalProductRating = document.getElementById("modal_product_rating");
const modalProductInstallment = document.getElementById("modal_product_installment");
const modalBadge = document.getElementById("modal_badge");
const modalAddToCart = document.getElementById("modal_add_to_cart");
const modalAddToWishlist = document.getElementById("modal_add_to_wishlist");
const wishlistCount = document.querySelector(".count_favourite");
const wishlistIcon = document.querySelector(".header_icons .icon:first-child i");
const loginTriggers = document.querySelectorAll(".login_trigger");
const categoryLinks = document.querySelectorAll(".category_nav_list a");

const wishlistKey = "3bs_wishlist";
const compareKey = "3bs_compare";
const couponKey = "3bs_cart_coupon";
const themeKey = "3bs_theme";
const countdownKey = "3bs_deal_end";
const couponRules = {
  SPRING15: 15,
  SAVE10: 10,
  FREESHIP: 5,
};

let wishlist = JSON.parse(localStorage.getItem(wishlistKey)) || [];
let compareList = JSON.parse(localStorage.getItem(compareKey)) || [];
let activeCoupon = JSON.parse(localStorage.getItem(couponKey)) || null;
let catalog = [];
let currentCategoryFilter = "all";

function Open_category_list() {
  category_nav_list?.classList.toggle("active");
}

function open_Menu() {
  nav_links?.classList.toggle("active");
}

function Open_close_cart() {
  cart_sidebar?.classList.toggle("active");
  cartOverlay?.classList.toggle("active");
  category_nav_list?.classList.remove("active");
}

cartOverlay?.addEventListener("click", () => {
  cart_sidebar?.classList.remove("active");
  cartOverlay?.classList.remove("active");
});

function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  setTimeout(() => {
    toast.classList.remove("show");
  }, 2800);
}

function attachCartListeners(data) {
  const addToCartButtons = document.querySelectorAll(".btn_add_cart");
  addToCartButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const btn = event.currentTarget;
      if (btn.dataset.busy === "true") return;
      btn.dataset.busy = "true";
      setTimeout(() => {
        delete btn.dataset.busy;
      }, 800);
      const productId = parseInt(btn.dataset.id, 10);
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      const alreadyIn = cart.some((item) => item.id === productId);
      if (alreadyIn) {
        showToast("This item is already in your cart!", "warning");
        Open_close_cart();
        return;
      }
      const selectedProduct = data.find((product) => product.id === productId);
      if (!selectedProduct) return;
      addToCart(selectedProduct);
      document.querySelectorAll(`.btn_add_cart[data-id='${productId}']`).forEach((b) => {
        b.classList.add("active");
        b.innerHTML = `<i class="fa-solid fa-cart-shopping"></i> Item in cart`;
      });
    });
  });
}

function addToCart(product) {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const exists = cart.some((item) => item.id === product.id);
  if (exists) {
    showToast("Item is already in the cart", "warning");
    return;
  }
  cart.push({ ...product, quantity: 1 });
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCart();
  showToast(`"${product.name.slice(0, 30)}..." added to cart ✓`);
}

function updateCart() {
  const cartItemsContainer = document.getElementById("cart_items");
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  let total_price = 0;
  let total_count = 0;
  cartItemsContainer.innerHTML = "";
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="empty_cart">
        <i class="fa-solid fa-cart-shopping"></i>
        <p>Your cart is empty</p>
        <span>Add some products to get started!</span>
      </div>
    `;
  } else {
    cart.forEach((item, index) => {
      const item_total = item.price * item.quantity;
      total_price += item_total;
      total_count += item.quantity;
      cartItemsContainer.innerHTML += `
        <div class="item_cart">
          <img src="${item.img}" alt="${item.name}">
          <div class="content">
            <h4>${item.name}</h4>
            <p class="price_cart">$${item_total.toFixed(2)}</p>
            <div class="quantity_control">
              <button class="decrease_quantity" data-index="${index}">-</button>
              <span class="quantity">${item.quantity}</span>
              <button class="increase_quantity" data-index="${index}">+</button>
            </div>
          </div>
          <button class="delete_item" data-index="${index}">
            <i class="fa-regular fa-trash-can"></i>
          </button>
        </div>
      `;
    });
  }
  const discountPercent = activeCoupon?.percent || 0;
  const discountValue = (total_price * discountPercent) / 100;
  const finalTotal = Math.max(total_price - discountValue, 0);
  document.querySelector(".price_cart_total").textContent = `$${finalTotal.toFixed(2)}`;
  document.querySelector(".Count_item_cart").textContent = total_count;
  document.querySelector(".count_item_header").textContent = total_count;
  if (couponFeedback) {
    if (discountPercent && activeCoupon) {
      couponFeedback.textContent = `${activeCoupon.code} applied (-${discountPercent}%)`;
    } else {
      couponFeedback.textContent = "Add a coupon code to save";
    }
  }
  if (total_count > 0) {
    document.querySelectorAll(".Count_item_cart, .count_item_header").forEach((node) => {
      node.classList.add("count_bump");
      setTimeout(() => {
        node.classList.remove("count_bump");
      }, 600);
    });
  }
  document.querySelectorAll(".increase_quantity").forEach((btn) => {
    btn.addEventListener("click", (e) => increaseQuantity(e.target.getAttribute("data-index")));
  });
  document.querySelectorAll(".decrease_quantity").forEach((btn) => {
    btn.addEventListener("click", (e) => decreaseQuantity(e.target.getAttribute("data-index")));
  });
  document.querySelectorAll(".delete_item").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const index = e.target.closest("button").getAttribute("data-index");
      removeFromCart(index);
    });
  });
}

function increaseQuantity(index) {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart[index].quantity += 1;
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCart();
}

function decreaseQuantity(index) {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  if (cart[index].quantity > 1) {
    cart[index].quantity -= 1;
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCart();
}

function removeFromCart(index) {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const removedProduct = cart.splice(index, 1)[0];
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCart();
  if (removedProduct) {
    updateButtonsState(removedProduct.id);
    showToast("Item removed from cart", "warning");
  }
}

function updateButtonsState(productId) {
  document.querySelectorAll(`.btn_add_cart[data-id='${productId}']`).forEach((btn) => {
    btn.classList.remove("active");
    btn.innerHTML = `<i class="fa-solid fa-cart-shopping"></i> Add to cart`;
  });
}

function initializeProductInteractions(data) {
  catalog = data;
  updateWishlistUI();
  updateComparePanel();
  document.querySelectorAll(".quick_view_btn, .product_media, .detail_link").forEach((element) => {
    element.addEventListener("click", (event) => {
      event.preventDefault();
      const id = parseInt(event.currentTarget.dataset.id, 10);
      openProductModal(id);
    });
  });
  document.querySelectorAll(".favourite_btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = parseInt(btn.dataset.id, 10);
      toggleWishlist(targetId);
    });
  });
  document.querySelectorAll(".compare_btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = parseInt(btn.dataset.id, 10);
      toggleCompare(targetId);
    });
  });
  applyFilters();
}

function toggleWishlist(productId) {
  const index = wishlist.indexOf(productId);
  if (index === -1) {
    wishlist.push(productId);
    showToast("Added to wishlist");
  } else {
    wishlist.splice(index, 1);
    showToast("Removed from wishlist", "warning");
  }
  localStorage.setItem(wishlistKey, JSON.stringify(wishlist));
  updateWishlistUI();
}

function updateWishlistUI() {
  wishlistCount && (wishlistCount.textContent = wishlist.length);
  if (wishlistIcon) {
    wishlistIcon.classList.toggle("fa-solid", wishlist.length > 0);
    wishlistIcon.classList.toggle("fa-regular", wishlist.length === 0);
  }
  document.querySelectorAll(".favourite_btn").forEach((btn) => {
    const id = parseInt(btn.dataset.id, 10);
    btn.classList.toggle("active", wishlist.includes(id));
  });
}

function toggleCompare(productId) {
  const exists = compareList.includes(productId);
  if (exists) {
    compareList = compareList.filter((id) => id !== productId);
    showToast("Product removed from comparison", "warning");
  } else if (compareList.length >= 3) {
    showToast("You can compare up to 3 products", "warning");
    return;
  } else {
    compareList.push(productId);
    showToast("Product added to comparison");
  }
  localStorage.setItem(compareKey, JSON.stringify(compareList));
  updateComparePanel();
}

function updateComparePanel() {
  if (!comparePanel || !compareItems) return;
  if (compareList.length === 0) {
    comparePanel.classList.add("empty");
    compareItems.innerHTML = "<p>Select up to 3 products to compare</p>";
  } else {
    comparePanel.classList.remove("empty");
    const products = compareList
      .map((id) => catalog.find((item) => item.id === id))
      .filter(Boolean);
    compareItems.innerHTML = products
      .map((product) => `
        <div class="compare_card">
          <img src="${product.img}" alt="${product.name}" />
          <div>
            <h4>${product.name}</h4>
            <p>$${product.price}</p>
            <button class="btn subtle remove_compare" data-id="${product.id}">Remove</button>
          </div>
        </div>
      `)
      .join("");
    compareItems.querySelectorAll(".remove_compare").forEach((button) => {
      button.addEventListener("click", () => {
        const id = parseInt(button.dataset.id, 10);
        toggleCompare(id);
      });
    });
  }
  compareCount && (compareCount.textContent = `${compareList.length} selected`);
  document.querySelectorAll(".compare_btn").forEach((btn) => {
    const id = parseInt(btn.dataset.id, 10);
    btn.classList.toggle("active", compareList.includes(id));
  });
}

function openProductModal(productId) {
  const product = catalog.find((item) => item.id === productId);
  if (!product || !productModal) return;
  modalProductImg && ((modalProductImg.src = product.img), (modalProductImg.alt = product.name));
  modalProductName && (modalProductName.textContent = product.name);
  modalProductPrice && (modalProductPrice.textContent = `$${product.price}`);
  if (modalProductOldPrice) {
    modalProductOldPrice.textContent = product.old_price ? `$${product.old_price}` : "";
  }
  modalProductDescription && (modalProductDescription.textContent = product.description);
  modalBadge && (modalBadge.textContent = product.tagline);
  if (modalProductInstallment) {
    const months = product.installment_months || 4;
    const perInstallment = (product.price / months).toFixed(2);
    modalProductInstallment.textContent = `Pay in ${months} installments of $${perInstallment}`;
  }
  if (modalProductRating) {
    modalProductRating.innerHTML = renderStars(product.rating);
  }
  modalAddToCart && (modalAddToCart.dataset.id = productId);
  modalAddToWishlist && (modalAddToWishlist.dataset.id = productId);
  showModal(productModal);
}

function renderStars(rating) {
  let html = "";
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);
  for (let i = 0; i < fullStars; i += 1) {
    html += '<i class="fa-solid fa-star"></i>';
  }
  if (hasHalf) {
    html += '<i class="fa-solid fa-star-half-stroke"></i>';
  }
  for (let i = 0; i < emptyStars; i += 1) {
    html += '<i class="fa-regular fa-star"></i>';
  }
  return html;
}

function showModal(modal) {
  if (!modal) return;
  modal.classList.add("active");
  modalBackdrop?.classList.add("active");
  document.body.classList.add("modal_open");
}

function closeModals() {
  document.querySelectorAll(".modal.active").forEach((modal) => {
    modal.classList.remove("active");
  });
  modalBackdrop?.classList.remove("active");
  document.body.classList.remove("modal_open");
}

modalBackdrop?.addEventListener("click", closeModals);
document.querySelectorAll && document.querySelectorAll(".close_modal").forEach((button) => {
  button.addEventListener("click", closeModals);
});

function applyFilters() {
  const query = searchInput?.value.trim().toLowerCase() || "";
  document.querySelectorAll(".swiper-slide.product").forEach((card) => {
    const name = card.dataset.name || "";
    const cardCategory = card.dataset.category || "";
    const matchesSearch = !query || name.includes(query);
    const matchesCategory =
      currentCategoryFilter === "all"
        ? true
        : currentCategoryFilter === "hot"
        ? card.dataset.hot === "true"
        : cardCategory === currentCategoryFilter;
    card.style.display = matchesSearch && matchesCategory ? "" : "none";
  });
}

function handleCategoryClick(event) {
  event.preventDefault();
  const link = event.currentTarget;
  const targetCategory = link.dataset.category || "all";
  currentCategoryFilter = targetCategory;
  categoryLinks.forEach((item) => item.classList.remove("active"));
  link.classList.add("active");
  const scrollTarget = link.dataset.scroll;
  if (scrollTarget) {
    const targetElement = document.getElementById(scrollTarget);
    targetElement?.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  applyFilters();
}

function handleFilters() {
  applyFilters();
}

categoryLinks.forEach((link) => {
  link.addEventListener("click", handleCategoryClick);
});

searchForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  handleFilters();
});

searchInput?.addEventListener("input", handleFilters);

function applyCoupon(code) {
  if (!code) {
    couponFeedback && (couponFeedback.textContent = "Enter a coupon code");
    return;
  }
  const normalized = code.trim().toUpperCase();
  const discount = couponRules[normalized];
  if (!discount) {
    couponFeedback && (couponFeedback.textContent = "Invalid coupon code");
    showToast("Coupon is not valid", "warning");
    return;
  }
  activeCoupon = { code: normalized, percent: discount };
  localStorage.setItem(couponKey, JSON.stringify(activeCoupon));
  updateCart();
  showToast(`Coupon ${normalized} applied`);
}

applyCouponBtn?.addEventListener("click", () => {
  applyCoupon(couponInput?.value || "");
});
couponInput?.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    applyCoupon(couponInput.value);
  }
});

function startCountdown() {
  if (!countdownElement) return;
  const existing = parseInt(localStorage.getItem(countdownKey), 10);
  let endTime = existing && existing > Date.now() ? existing : Date.now() + 5 * 60 * 60 * 1000;
  localStorage.setItem(countdownKey, endTime);
  function tick() {
    const remaining = endTime - Date.now();
    if (remaining <= 0) {
      endTime = Date.now() + 5 * 60 * 60 * 1000;
      localStorage.setItem(countdownKey, endTime);
    }
    const totalSeconds = Math.max(Math.floor((endTime - Date.now()) / 1000), 0);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    countdownElement.textContent = `${hours}:${minutes}:${seconds}`;
  }
  tick();
  setInterval(tick, 1000);
}

function initTheme() {
  const saved = localStorage.getItem(themeKey) || "light";
  const isDark = saved === "dark";
  document.body.classList.toggle("dark-theme", isDark);
  if (darkModeToggle) {
    darkModeToggle.textContent = isDark ? "Light Mode" : "Dark Mode";
    darkModeToggle.addEventListener("click", () => {
      const active = document.body.classList.toggle("dark-theme");
      localStorage.setItem(themeKey, active ? "dark" : "light");
      darkModeToggle.textContent = active ? "Light Mode" : "Dark Mode";
    });
  }
}

function handleLoginTriggers() {
  loginTriggers.forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      const mode = btn.dataset.mode === "signup" ? "Signup" : "Login";
      loginModalTitle && (loginModalTitle.textContent = mode);
      showModal(loginModal);
    });
  });
}

loginForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  loginMessage && (loginMessage.textContent = "Welcome back! Check your inbox soon.");
  setTimeout(() => {
    if (loginMessage) {
      loginMessage.textContent = "";
    }
    closeModals();
  }, 2000);
});

compareReviewBtn?.addEventListener("click", () => {
  if (!compareList.length) {
    showToast("Add at least one product to compare", "warning");
    return;
  }
  if (compareModal && compareModalBody) {
    compareModalBody.innerHTML = compareList
      .map((id) => catalog.find((item) => item.id === id))
      .filter(Boolean)
      .map(
        (product) => `
          <div class="compare_modal_card">
            <img src="${product.img}" alt="${product.name}" />
            <h4>${product.name}</h4>
            <p>${product.tagline}</p>
            <p>$${product.price}</p>
            <p>${product.description}</p>
            <span>${product.rating.toFixed(1)} ★</span>
          </div>
        `
      )
      .join("");
    showModal(compareModal);
  }
});

compareClearBtn?.addEventListener("click", () => {
  compareList = [];
  localStorage.setItem(compareKey, JSON.stringify(compareList));
  updateComparePanel();
  showToast("Comparison list cleared", "warning");
});

modalAddToCart?.addEventListener("click", () => {
  const id = parseInt(modalAddToCart.dataset.id, 10);
  const product = catalog.find((item) => item.id === id);
  if (!product) return;
  addToCart(product);
});

modalAddToWishlist?.addEventListener("click", () => {
  const id = parseInt(modalAddToWishlist.dataset.id, 10);
  toggleWishlist(id);
});

function handleBackToTop() {
  if (!backToTopBtn) return;
  window.addEventListener("scroll", () => {
    if (window.scrollY > 400) {
      backToTopBtn.classList.add("visible");
    } else {
      backToTopBtn.classList.remove("visible");
    }
  });
  backToTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

initTheme();
startCountdown();
handleFilters();
handleBackToTop();
handleLoginTriggers();
updateCart();
updateComparePanel();
