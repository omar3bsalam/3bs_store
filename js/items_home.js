const productSections = [
  { container: document.getElementById("swiper_items_sale"), filter: (p) => p.old_price },
  { container: document.getElementById("swiper_electronics"), filter: (p) => p.category === "electronics" },
  { container: document.getElementById("swiper_appliances"), filter: (p) => p.category === "appliances" },
  { container: document.getElementById("swiper_mobiles"), filter: (p) => p.category === "mobiles" },
];

const skeletonSlide = `
  <div class="swiper-slide skeleton">
    <div class="skeleton_card">
      <div class="skeleton_image"></div>
      <div class="skeleton_line short"></div>
      <div class="skeleton_line"></div>
      <div class="skeleton_line"></div>
      <div class="skeleton_actions">
        <span class="skeleton_button"></span>
        <span class="skeleton_button slim"></span>
      </div>
    </div>
  </div>
`;

productSections.forEach(({ container }) => {
  if (container) {
    container.innerHTML = new Array(4).fill(skeletonSlide).join("");
  }
});

fetch("products.json")
  .then((response) => response.json())
  .then((data) => {
    window.productsCatalog = data;
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    function buildStars(rating) {
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

    function buildProductCard(product) {
      const inCart = cart.some((item) => item.id === product.id);
      const saleBadge = product.old_price
        ? `<span class="sale_percent">${Math.floor(((product.old_price - product.price) / product.old_price) * 100)}%</span>`
        : "";
      const oldPrice = product.old_price
        ? `<p class="old_price">$${product.old_price}</p>`
        : "";
      const installmentAmount = product.installment_months
        ? (product.price / product.installment_months).toFixed(2)
        : (product.price / 4).toFixed(2);
      const ratingMarkup = buildStars(product.rating);
      return `
        <div class="swiper-slide product" data-name="${product.name.toLowerCase()}" data-category="${product.category}" data-hot="${product.old_price ? "true" : "false"}">
          ${saleBadge}
          <div class="img_product">
            <a href="#" class="product_media" data-id="${product.id}">
              <img src="${product.img}" alt="${product.name}" loading="lazy" />
              <span class="quick_view_btn" data-id="${product.id}">
                <i class="fa-regular fa-eye"></i>
              </span>
            </a>
          </div>
          <div class="stars" aria-label="Rating">
            ${ratingMarkup}
            <span>${product.rating.toFixed(1)} (${product.reviews} reviews)</span>
          </div>
          <p class="name_product">
            <a href="#" class="detail_link" data-id="${product.id}">${product.name}</a>
          </p>
          <p class="product_tagline">${product.tagline}</p>
          <div class="price">
            <p><span>$${product.price}</span></p>
            ${oldPrice}
          </div>
          <p class="installment_info">From $${installmentAmount}/mo</p>
          <div class="icons">
            <span class="btn_add_cart ${inCart ? "active" : ""}" data-id="${product.id}">
              <i class="fa-solid fa-cart-shopping"></i>
              ${inCart ? "Item in cart" : "Add to cart"}
            </span>
            <span class="icon_product favourite_btn" data-id="${product.id}">
              <i class="fa-regular fa-heart"></i>
            </span>
            <span class="icon_product compare_btn" data-id="${product.id}">
              <i class="fa-solid fa-scale-balanced"></i>
            </span>
          </div>
        </div>
      `;
    }

    productSections.forEach(({ container, filter }) => {
      if (!container) return;
      const content = data
        .filter(filter)
        .map((product) => buildProductCard(product))
        .join("");
      container.innerHTML = content;
    });

    attachCartListeners(data);
    initializeProductInteractions(data);
  });
