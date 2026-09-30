
// ============================================================================
// 1. CONFIGURATION & CONSTANTS
// ============================================================================
const CONFIG = {
  FREE_SHIPPING_THRESHOLD: 15000, // Orders >= Rs. 15,000 qualify for free islandwide shipping
  STANDARD_SHIPPING_FEE: 650,    // Standard courier delivery fee in Sri Lanka (LKR)
  CURRENCY_CODE: 'LKR',
  CURRENCY_PREFIX: 'Rs.',
  FALLBACK_IMAGE: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=900&q=80'
};

/**
 * Valid promo codes.
 * Each entry: { type: 'percent'|'fixed'|'freeship', value: number, description: string }
 */
const PROMO_CODES = {
  'TOYHAVEN10': { type: 'percent',  value: 10,  description: '10% off your order' },
  'WELCOME500':  { type: 'fixed',   value: 500,  description: 'Rs. 500 off your order' },
  'FREESHIP':    { type: 'freeship',value: 0,    description: 'Free islandwide delivery' },
  'SAVE15':      { type: 'percent', value: 15,   description: '15% off your order' },
  'SUMMER20':    { type: 'percent', value: 20,   description: '20% off your order' }
};

/** Currently applied promo (null or a PROMO_CODES entry + code key) */
let appliedPromo = null;

// ============================================================================
// 2. UTILITY & LOCAL STORAGE HELPERS
// ============================================================================

/**
 * Formats a numeric price into Sri Lankan Rupees (e.g., "Rs. 4,350.00")
 * @param {number|string} amount
 * @returns {string}
 */
function formatPrice(amount) {
  const num = Number(amount) || 0;
  return `${CONFIG.CURRENCY_PREFIX} ${num.toLocaleString('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

/**
 * Safely retrieves and parses a value from LocalStorage.
 * @param {string} key
 * @param {*} fallback
 * @returns {*}
 */
function getStorage(key, fallback = []) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.warn(`LocalStorage read error for key "${key}":`, error);
    return fallback;
  }
}

/**
 * Safely serializes and saves a value to LocalStorage.
 * @param {string} key
 * @param {*} value
 */
function setStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`LocalStorage write error for key "${key}":`, error);
  }
}

// ============================================================================
// 3. TOAST NOTIFICATIONS & BADGES
// ============================================================================

/**
 * Shows a global animated toast notification.
 * @param {string} message
 * @param {string} icon
 */
function showToast(message, icon = '✓') {
  let toast = document.getElementById('global-toast');

  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'global-toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span class="toast-text">${message}</span>
  `;
  toast.classList.add('show');

  clearTimeout(showToast.timeoutId);
  showToast.timeoutId = setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

/**
 * Updates the Cart badge counter with a bounce animation.
 */
function updateCartBadge() {
  const badge = document.getElementById('cart-badge');
  if (!badge) return;

  const cart = getStorage('cart', []);
  const totalItems = cart.reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
  badge.textContent = totalItems;

  badge.classList.remove('badge-pop');
  void badge.offsetWidth; // Trigger reflow to restart animation
  badge.classList.add('badge-pop');
}

/**
 * Updates the Wishlist badge counter.
 */
function updateWishlistBadge() {
  const badge = document.getElementById('wishlist-badge');
  if (!badge) return;

  const wishlist = getStorage('wishlist', []);
  badge.textContent = wishlist.length;
}

// ============================================================================
// 4. CART LOGIC
// ============================================================================

/**
 * Adds a product to the shopping cart.
 * @param {number} productId
 */
function addToCart(productId) {
  const product = PRODUCTS.find((p) => p.id === productId);
  if (!product) return;

  const cart = getStorage('cart', []);
  const existingItem = cart.find((item) => item.id === productId);

  if (existingItem) {
    existingItem.qty += 1;
  } else {
    cart.push({ id: productId, qty: 1 });
  }

  setStorage('cart', cart);
  updateCartBadge();
  showToast(`Added "${product.name}" to your cart!`, '🛍️');

  // Dynamically re-render cart if user is on the cart page
  if (document.getElementById('cart-items')) {
    renderCartPage();
  }
}

/**
 * Delegates clicks on cart controls (+, -, remove).
 */
function handleCartActions() {
  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action]');
    if (!button) return;

    const productId = Number(button.dataset.id);
    const action = button.dataset.action;

    let cart = getStorage('cart', []);
    const itemIndex = cart.findIndex((entry) => entry.id === productId);

    if (itemIndex === -1) return;

    if (action === 'increase') {
      cart[itemIndex].qty += 1;
    } else if (action === 'decrease') {
      cart[itemIndex].qty -= 1;
      if (cart[itemIndex].qty <= 0) {
        cart = cart.filter((entry) => entry.id !== productId);
      }
    } else if (action === 'remove') {
      cart = cart.filter((entry) => entry.id !== productId);
      showToast('Item removed from cart', '🗑️');
    }

    setStorage('cart', cart);
    renderCartPage();

    if (document.getElementById('checkout-summary')) {
      renderCheckoutSummary();
    }
  });
}

// ============================================================================
// 5. WISHLIST LOGIC
// ============================================================================

/**
 * Toggles a product in or out of the wishlist.
 * @param {number} productId
 */
function addToWishlist(productId) {
  const product = PRODUCTS.find((p) => p.id === productId);
  if (!product) return;

  const wishlist = getStorage('wishlist', []);
  const index = wishlist.findIndex((item) => item.id === productId);

  if (index === -1) {
    wishlist.push({ id: productId, status: 'In Wishlist', addedAt: new Date().toISOString() });
    setStorage('wishlist', wishlist);
    updateWishlistBadge();
    showToast(`Saved "${product.name}" to Wishlist!`, '❤️');
  } else {
    wishlist.splice(index, 1);
    setStorage('wishlist', wishlist);
    updateWishlistBadge();
    showToast(`Removed from Wishlist`, '💔');
  }

  updateWishlistButtonStates();

  if (document.getElementById('w-box')) {
    renderWishlist();
  }
}

/**
 * Synchronizes heart buttons on product cards with current wishlist state.
 */
function updateWishlistButtonStates() {
  const wishlist = getStorage('wishlist', []);
  const buttons = document.querySelectorAll('.btn-wishlist-toggle');

  buttons.forEach((btn) => {
    const id = Number(btn.dataset.id);
    const isSaved = wishlist.some((item) => item.id === id);

    if (isSaved) {
      btn.classList.add('active');
      btn.setAttribute('aria-label', 'Remove from Wishlist');
      btn.setAttribute('title', 'Saved in Wishlist');
      btn.innerHTML = '❤️';
    } else {
      btn.classList.remove('active');
      btn.setAttribute('aria-label', 'Add to Wishlist');
      btn.setAttribute('title', 'Add to Wishlist');
      btn.innerHTML = '🤍';
    }
  });
}

/**
 * Moves an item from the Wishlist directly into the Cart.
 * @param {number} productId
 */
function moveToCart(productId) {
  addToCart(productId);
  // Remove from wishlist
  let wishlist = getStorage('wishlist', []);
  wishlist = wishlist.filter((item) => item.id !== productId);
  setStorage('wishlist', wishlist);
  updateWishlistBadge();
  renderWishlist();
}

// ============================================================================
// 6. PRODUCT CARD COMPONENT
// ============================================================================

/**
 * Generates semantic HTML markup for a product card.
 * @param {Object} product
 * @returns {string}
 */
function makeProductCard(product) {
  const wishlist = getStorage('wishlist', []);
  const isSaved = wishlist.some((item) => item.id === product.id);

  const badgeHtml = product.badge
    ? `<span class="product-badge badge-${product.badge.toLowerCase().replace(/[\s\W]+/g, '-')}">${product.badge}</span>`
    : '';

  const ratingHtml = product.rating
    ? `
      <div class="product-rating" title="${product.rating} out of 5 stars">
        <span class="stars">★★★★★</span>
        <span class="rating-num">${product.rating.toFixed(1)}</span>
        <span class="rating-count">(${product.reviews || 24})</span>
      </div>
    `
    : '';

  return `
    <article class="card product-card" data-category="${product.category}" data-id="${product.id}">
      <div class="card-img-wrap">
        <img
          src="${product.image}"
          class="card-img"
          alt="${product.name}"
          loading="lazy"
          onerror="this.onerror=null; this.src='${CONFIG.FALLBACK_IMAGE}';"
        />
        ${badgeHtml}
        <button
          type="button"
          class="btn-wishlist-toggle ${isSaved ? 'active' : ''}"
          data-id="${product.id}"
          onclick="addToWishlist(${product.id})"
          aria-label="${isSaved ? 'Remove from Wishlist' : 'Add to Wishlist'}"
          title="${isSaved ? 'Saved in Wishlist' : 'Add to Wishlist'}"
        >
          ${isSaved ? '❤️' : '🤍'}
        </button>
      </div>
      <div class="card-body">
        <div class="card-topline">
          <span class="category-pill">${product.category}</span>
          ${ratingHtml}
        </div>
        <h3 class="card-title">${product.name}</h3>
        <p class="card-price">${formatPrice(product.price)}</p>
        <p class="card-description">${product.description}</p>
        <div class="card-actions">
          <button class="btn btn-cart" type="button" onclick="addToCart(${product.id})">
            <span class="btn-icon">🛒</span> Add to Cart
          </button>
          <button class="btn btn-secondary" type="button" onclick="addToWishlist(${product.id})">
            ${isSaved ? '❤️ Saved' : '🤍 Wishlist'}
          </button>
        </div>
      </div>
    </article>
  `;
}

// ============================================================================
// 7. CATALOG FILTERING, SEARCH & SORTING
// ============================================================================

let currentCategoryFilter = 'all';
let currentSearchQuery = '';
let currentSort = 'featured';

/**
 * Filters and sorts products based on active toolbar settings.
 * @returns {Array<Object>}
 */
function filterAndSortProducts() {
  return PRODUCTS.filter((product) => {
    const matchesCategory =
      currentCategoryFilter === 'all' ||
      product.category.toLowerCase() === currentCategoryFilter.toLowerCase();

    const matchesSearch =
      !currentSearchQuery ||
      product.name.toLowerCase().includes(currentSearchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(currentSearchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(currentSearchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    if (currentSort === 'price-low') return a.price - b.price;
    if (currentSort === 'price-high') return b.price - a.price;
    if (currentSort === 'rating') return (b.rating || 0) - (a.rating || 0);
    if (currentSort === 'name-asc') return a.name.localeCompare(b.name);
    return a.id - b.id; // 'featured'
  });
}

/**
 * Renders the products grid on the Catalog page.
 */
function renderProductCatalog() {
  const container = document.getElementById('grid');
  if (!container) return;

  const filtered = filterAndSortProducts();
  const countEl = document.getElementById('catalog-count');

  if (countEl) {
    countEl.textContent = `Showing ${filtered.length} of ${PRODUCTS.length} toys in Sri Lanka`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state catalog-empty">
        <div class="empty-icon">🔍</div>
        <h3>No matching toys found</h3>
        <p>Try searching with another model keyword or click below to reset filters.</p>
        <button class="btn btn-primary" type="button" onclick="resetFilters()">Reset All Filters</button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(makeProductCard).join('');
}

/**
 * Resets search and category filters.
 */
function resetFilters() {
  currentCategoryFilter = 'all';
  currentSearchQuery = '';
  currentSort = 'featured';

  const searchInput = document.getElementById('catalog-search');
  if (searchInput) searchInput.value = '';

  const sortSelect = document.getElementById('catalog-sort');
  if (sortSelect) sortSelect.value = 'featured';

  document.querySelectorAll('.filter-pill').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.category === 'all');
  });

  renderProductCatalog();
}

/**
 * Initializes listeners for search, filter pills, and sorting dropdown.
 */
function initCatalogControls() {
  const searchInput = document.getElementById('catalog-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearchQuery = e.target.value.trim();
      renderProductCatalog();
    });
  }

  const sortSelect = document.getElementById('catalog-sort');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      renderProductCatalog();
    });
  }

  const filterBtns = document.querySelectorAll('.filter-pill');
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategoryFilter = btn.dataset.category || 'all';
      renderProductCatalog();
    });
  });
}

// ============================================================================
// 8. PAGE RENDERERS (Home, Wishlist, Cart, Checkout)
// ============================================================================

/**
 * Renders featured picks on the Home page (top 8 picks).
 */
function renderFeaturedProducts() {
  const container = document.getElementById('featured-products');
  if (!container) return;

  const featured = PRODUCTS.slice(0, 8);
  container.innerHTML = featured.map(makeProductCard).join('');
}

/**
 * Renders the saved toys on the Wishlist page.
 */
function renderWishlist() {
  const container = document.getElementById('w-box');
  if (!container) return;

  const wishlist = getStorage('wishlist', []);
  const countEl = document.getElementById('wishlist-count-text');

  if (countEl) {
    countEl.textContent = `${wishlist.length} item${wishlist.length === 1 ? '' : 's'} saved in your collection`;
  }

  if (!wishlist.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">❤️</div>
        <h3>Your Wishlist is Empty</h3>
        <p>Tap the heart icon on any toy model you love to save it for later.</p>
        <a href="products.html" class="btn btn-primary">Browse All Toys</a>
      </div>
    `;
    return;
  }

  container.innerHTML = wishlist
    .map((item) => {
      const product = PRODUCTS.find((p) => p.id === item.id);
      if (!product) return '';

      return `
        <article class="card product-card wishlist-card">
          <div class="card-img-wrap">
            <img
              src="${product.image}"
              class="card-img"
              alt="${product.name}"
              onerror="this.onerror=null; this.src='${CONFIG.FALLBACK_IMAGE}';"
            />
            <span class="product-badge badge-bestseller">In Wishlist</span>
          </div>
          <div class="card-body">
            <div class="card-topline">
              <span class="category-pill">${product.category}</span>
            </div>
            <h3 class="card-title">${product.name}</h3>
            <p class="card-price">${formatPrice(product.price)}</p>
            <p class="card-description">${product.description}</p>
            <div class="card-actions">
              <button class="btn btn-cart" type="button" onclick="moveToCart(${product.id})">
                <span class="btn-icon">🛒</span> Move to Cart
              </button>
              <button class="btn btn-secondary text-danger" type="button" onclick="addToWishlist(${product.id})">
                Remove
              </button>
            </div>
          </div>
        </article>
      `;
    })
    .join('');
}

/**
 * Renders the Cart Page with dynamic free shipping progress bar and order summary.
 */
function renderCartPage() {
  const cartContainer = document.getElementById('cart-items');
  const summaryContainer = document.getElementById('cart-summary');

  if (!cartContainer || !summaryContainer) return;

  const cart = getStorage('cart', []);

  if (!cart.length) {
    cartContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🛒</div>
        <h3>Your cart is empty</h3>
        <p>Explore our 20+ collectible diecast cars and sports models to get started.</p>
        <a href="products.html" class="btn btn-primary">Start Shopping</a>
      </div>
    `;

    summaryContainer.innerHTML = `
      <div class="summary-card">
        <h3>Order Summary</h3>
        <div class="summary-row"><span>Subtotal</span><strong>${formatPrice(0)}</strong></div>
        <div class="summary-row"><span>Islandwide Shipping</span><strong>${formatPrice(0)}</strong></div>
        <div class="summary-row total"><span>Total</span><strong>${formatPrice(0)}</strong></div>
        <a href="products.html" class="btn btn-secondary full-width">Continue Shopping</a>
      </div>
    `;

    updateCartBadge();
    return;
  }

  const items = cart
    .map((entry) => {
      const product = PRODUCTS.find((p) => p.id === entry.id);
      return product ? { ...product, qty: entry.qty } : null;
    })
    .filter(Boolean);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const isFreeShipping = subtotal >= CONFIG.FREE_SHIPPING_THRESHOLD;
  const shipping = isFreeShipping ? 0 : CONFIG.STANDARD_SHIPPING_FEE;
  const total = subtotal + shipping;

  const progressPercent = Math.min(100, Math.round((subtotal / CONFIG.FREE_SHIPPING_THRESHOLD) * 100));
  const diffForFree = CONFIG.FREE_SHIPPING_THRESHOLD - subtotal;

  const freeShippingBar = isFreeShipping
    ? `
      <div class="free-shipping-notice unlocked">
        <span class="notice-icon">🎉</span>
        <div>
          <strong>You've unlocked FREE Islandwide Delivery!</strong>
          <small>Delivery fee waived across all 25 districts in Sri Lanka.</small>
        </div>
      </div>
    `
    : `
      <div class="free-shipping-notice">
        <div class="notice-header">
          <span>Add <strong>${formatPrice(diffForFree)}</strong> more for <strong>FREE Islandwide Delivery</strong></span>
          <span class="percent-badge">${progressPercent}%</span>
        </div>
        <div class="shipping-progress-track">
          <div class="shipping-progress-fill" style="width: ${progressPercent}%;"></div>
        </div>
      </div>
    `;

  cartContainer.innerHTML = `
    ${freeShippingBar}
    <div class="cart-items-list">
      ${items
        .map(
          (item) => `
            <div class="cart-item">
              <img src="${item.image}" alt="${item.name}" />
              <div class="cart-item-info">
                <span class="category-pill mini">${item.category}</span>
                <h3>${item.name}</h3>
                <span class="unit-price">${formatPrice(item.price)} each</span>
              </div>
              <div class="quantity-controls">
                <button class="qty-btn" type="button" data-action="decrease" data-id="${item.id}" aria-label="Decrease quantity">−</button>
                <span class="qty-number">${item.qty}</span>
                <button class="qty-btn" type="button" data-action="increase" data-id="${item.id}" aria-label="Increase quantity">+</button>
              </div>
              <div class="item-total">
                <strong class="item-total-price">${formatPrice(item.price * item.qty)}</strong>
                <button class="text-btn" type="button" data-action="remove" data-id="${item.id}" title="Remove item">Remove</button>
              </div>
            </div>
          `
        )
        .join('')}
    </div>
  `;

  summaryContainer.innerHTML = `
    <div class="summary-card">
      <h3>Order Summary</h3>
      <div class="summary-row">
        <span>Subtotal (${items.reduce((s, i) => s + i.qty, 0)} items)</span>
        <strong>${formatPrice(subtotal)}</strong>
      </div>
      <div class="summary-row">
        <span>Islandwide Delivery</span>
        <strong class="${shipping === 0 ? 'text-success' : ''}">
          ${shipping === 0 ? 'FREE' : formatPrice(shipping)}
        </strong>
      </div>
      <div class="delivery-estimate-badge">
        <span>🚚 Est. Delivery: 1-2 days Colombo, 2-3 days Outstation</span>
      </div>
      <div class="summary-row total">
        <span>Total (LKR)</span>
        <strong class="grand-total">${formatPrice(total)}</strong>
      </div>
      <a href="checkout.html" class="btn btn-primary full-width checkout-btn">
        Proceed to Checkout 💳
      </a>
      <div class="security-note">
        <span>🔒 Secure SSL 256-bit encryption</span>
      </div>
    </div>
  `;

  updateCartBadge();
}

/**
 * Renders the Order Summary sidebar on the Checkout page.
 */
function renderCheckoutSummary() {
  const summary = document.getElementById('checkout-summary');
  if (!summary) return;

  const cart = getStorage('cart', []);

  if (!cart.length) {
    summary.innerHTML = `
      <div class="summary-card">
        <h3>Order Summary</h3>
        <p class="text-muted">Your cart is currently empty.</p>
        <a href="products.html" class="btn btn-primary full-width">Shop Now</a>
      </div>
    `;
    return;
  }

  const items = cart
    .map((entry) => {
      const product = PRODUCTS.find((p) => p.id === entry.id);
      return product ? { ...product, qty: entry.qty } : null;
    })
    .filter(Boolean);

  const subtotal   = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discount   = getPromoDiscount(subtotal);
  const isFreeShip = appliedPromo?.type === 'freeship' || subtotal >= CONFIG.FREE_SHIPPING_THRESHOLD;
  const shipping   = isFreeShip ? 0 : CONFIG.STANDARD_SHIPPING_FEE;
  const total      = subtotal - discount + shipping;

  const discountRow = (discount > 0 && appliedPromo)
    ? `<div class="summary-row promo-discount-row">
        <span>🎟️ Promo (<em>${appliedPromo.code}</em>)</span>
        <strong class="text-success">−${formatPrice(discount)}</strong>
       </div>`
    : (appliedPromo?.type === 'freeship'
        ? `<div class="summary-row promo-discount-row">
            <span>🎟️ Promo (<em>${appliedPromo.code}</em>)</span>
            <strong class="text-success">FREE SHIP</strong>
           </div>`
        : '');

  summary.innerHTML = `
    <div class="summary-card">
      <div class="summary-title-row">
        <h3>Order Summary</h3>
        <span class="items-badge">${items.reduce((s, i) => s + i.qty, 0)} items</span>
      </div>

      <div class="checkout-items-list">
        ${items
          .map(
            (item) => `
              <div class="mini-item">
                <img src="${item.image}" alt="${item.name}" class="mini-item-img" />
                <div class="mini-item-details">
                  <strong>${item.name}</strong>
                  <small>${formatPrice(item.price)} × ${item.qty}</small>
                </div>
                <span class="mini-item-total">${formatPrice(item.price * item.qty)}</span>
              </div>
            `
          )
          .join('')}
      </div>

      <div class="summary-divider"></div>
      <div class="summary-row"><span>Subtotal</span><strong>${formatPrice(subtotal)}</strong></div>
      ${discountRow}
      <div class="summary-row">
        <span>Delivery (Sri Lanka)</span>
        <strong class="${shipping === 0 ? 'text-success' : ''}">
          ${shipping === 0 ? 'FREE' : formatPrice(shipping)}
        </strong>
      </div>
      <div class="summary-row total">
        <span>Total to Pay</span>
        <strong class="grand-total">${formatPrice(total)}</strong>
      </div>

      <div class="guarantee-box">
        <p>✓ 100% Guaranteed Genuine Mattel & Diecast</p>
        <p>✓ Cash on Delivery or Secure Card Payment</p>
      </div>
    </div>
  `;
}

/**
 * Calculates discount amount from appliedPromo against a subtotal.
 * @param {number} subtotal
 * @returns {number}
 */
function getPromoDiscount(subtotal) {
  if (!appliedPromo) return 0;
  const { type, value } = appliedPromo;
  if (type === 'percent') return Math.round(subtotal * (value / 100));
  if (type === 'fixed')   return Math.min(value, subtotal); // can't discount more than subtotal
  return 0; // freeship handled separately
}

/**
 * Applies or removes a promo code and re-renders the checkout summary.
 */
function applyPromoCode() {
  const input     = document.getElementById('promo-input');
  const feedback  = document.getElementById('promo-feedback');
  if (!input || !feedback) return;

  const code = input.value.trim().toUpperCase();
  const promo = PROMO_CODES[code];

  if (!code) {
    // Remove applied promo
    appliedPromo = null;
    feedback.innerHTML = '';
    feedback.className = 'promo-feedback';
    renderCheckoutSummary();
    return;
  }

  if (!promo) {
    feedback.innerHTML = `<span class="promo-error">❌ Invalid promo code. Please check and try again.</span>`;
    feedback.className = 'promo-feedback promo-feedback--error';
    appliedPromo = null;
    renderCheckoutSummary();
    return;
  }

  appliedPromo = { ...promo, code };
  feedback.innerHTML = `<span class="promo-success">🎉 Code <strong>${code}</strong> applied — ${promo.description}!</span>`;
  feedback.className = 'promo-feedback promo-feedback--success';
  renderCheckoutSummary();
  showToast(`Promo "${code}" applied!`, '🎟️');
}

/**
 * Initializes the Checkout page form submission, radio toggling, and invoice generator.
 */
function initCheckoutPage() {
  const form = document.getElementById('checkout-form');
  if (!form) return;

  // Toggle card details input based on payment method
  const paymentRadios = document.querySelectorAll('input[name="payment-method"]');
  const cardDetailsSection = document.getElementById('card-details-section');

  paymentRadios.forEach((radio) => {
    radio.addEventListener('change', (e) => {
      if (cardDetailsSection) {
        if (e.target.value === 'card') {
          cardDetailsSection.style.display = 'block';
          cardDetailsSection.querySelectorAll('input').forEach((inp) => (inp.required = true));
        } else {
          cardDetailsSection.style.display = 'none';
          cardDetailsSection.querySelectorAll('input').forEach((inp) => (inp.required = false));
        }
      }
    });
  });

  // Promo code button
  const applyBtn = document.getElementById('apply-promo-btn');
  if (applyBtn) {
    applyBtn.addEventListener('click', applyPromoCode);
  }
  const promoInput = document.getElementById('promo-input');
  if (promoInput) {
    promoInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); applyPromoCode(); }
    });
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const cart = getStorage('cart', []);
    if (!cart.length) {
      showToast('Your cart is empty!', '⚠️');
      return;
    }

    const items = cart
      .map((entry) => {
        const product = PRODUCTS.find((p) => p.id === entry.id);
        return product ? { ...product, qty: entry.qty } : null;
      })
      .filter(Boolean);

    const subtotal  = items.reduce((sum, item) => sum + item.price * item.qty, 0);
    const discount   = getPromoDiscount(subtotal);
    const isFreeShip = appliedPromo?.type === 'freeship' || subtotal >= CONFIG.FREE_SHIPPING_THRESHOLD;
    const shipping   = isFreeShip ? 0 : CONFIG.STANDARD_SHIPPING_FEE;
    const total      = subtotal - discount + shipping;

    const selectedPayment = document.querySelector('input[name="payment-method"]:checked')?.value || 'card';
    const paymentNames = {
      card: 'Credit / Debit Card',
      cod: 'Cash on Delivery (COD)',
      koko: 'Koko / Mintpay (3 Installments)'
    };

    const customer = {
      name: document.getElementById('name')?.value.trim() || 'Valued Customer',
      phone: document.getElementById('phone')?.value.trim() || '+94 7X XXX XXXX',
      email: document.getElementById('email')?.value.trim() || 'customer@toyhaven.lk',
      address: document.getElementById('address')?.value.trim() || '',
      city: document.getElementById('city')?.value.trim() || 'Colombo',
      province: document.getElementById('province')?.value || 'Western Province',
      postalCode: document.getElementById('zip')?.value.trim() || '00100',
      paymentMethod: paymentNames[selectedPayment] || 'Online Payment'
    };

    const invoice = {
      id: `TH-LK-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      customer,
      items,
      subtotal,
      discount,
      promoCode: appliedPromo?.code || null,
      shipping,
      total
    };

    setStorage('invoice', invoice);
    localStorage.removeItem('cart');

    const checkoutPage = document.querySelector('.checkout-page');
    if (checkoutPage) {
      checkoutPage.innerHTML = `
        <section class="success-state invoice-container animate-fade-in">
          <div class="success-icon-badge">✓</div>
          <span class="eyebrow" style="margin-top: 1rem;">Order Placed Successfully</span>
          <h2>Thank You, ${customer.name}!</h2>
          <p class="success-subtitle">
            Your Toy Haven order has been confirmed. A confirmation and tracking SMS will be sent to <strong>${customer.phone}</strong>.
          </p>

          <div class="invoice-box">
            <div class="invoice-header">
              <div>
                <span class="invoice-label">Invoice Number</span>
                <strong class="invoice-id">${invoice.id}</strong>
              </div>
              <div class="text-right">
                <span class="invoice-label">Order Date & Time</span>
                <strong>${invoice.date}</strong>
              </div>
            </div>

            <div class="invoice-details-grid">
              <div class="invoice-col">
                <span class="invoice-label">Delivery To</span>
                <h4>${customer.name}</h4>
                <p>${customer.address}</p>
                <p>${customer.city}, ${customer.province} ${customer.postalCode}</p>
                <p>Phone: ${customer.phone}</p>
                <p>Email: ${customer.email}</p>
              </div>
              <div class="invoice-col">
                <span class="invoice-label">Payment Information</span>
                <h4>${customer.paymentMethod}</h4>
                <p class="status-pill status-confirmed">Status: Confirmed</p>
                <p class="delivery-tag">🚚 Dispatch: Within 24 Hours</p>
              </div>
            </div>

            <div class="invoice-items">
              <div class="invoice-row invoice-row--heading">
                <span>Toy Item</span>
                <span class="text-center">Qty</span>
                <span class="text-right">Total (LKR)</span>
              </div>
              ${items
                .map(
                  (item) => `
                    <div class="invoice-row">
                      <div class="invoice-item-name">
                        <strong>${item.name}</strong>
                        <small>${item.category} • ${formatPrice(item.price)}</small>
                      </div>
                      <span class="text-center">x${item.qty}</span>
                      <strong class="text-right">${formatPrice(item.price * item.qty)}</strong>
                    </div>
                  `
                )
                .join('')}
            </div>

            <div class="invoice-totals">
              <div class="invoice-row">
                <span>Subtotal</span>
                <strong>${formatPrice(subtotal)}</strong>
              </div>
              <div class="invoice-row">
                <span>Islandwide Delivery</span>
                <strong class="${shipping === 0 ? 'text-success' : ''}">
                  ${shipping === 0 ? 'FREE' : formatPrice(shipping)}
                </strong>
              </div>
              <div class="invoice-row total">
                <span>Grand Total</span>
                <strong class="text-primary grand-total">${formatPrice(total)}</strong>
              </div>
            </div>
          </div>

          <div class="invoice-actions">
            <button type="button" class="btn btn-secondary" onclick="window.print()">
              🖨️ Print Invoice
            </button>
            <a href="index.html" class="btn btn-primary">
              Continue Shopping
            </a>
          </div>
        </section>
      `;
    }

    updateCartBadge();
  });

  renderCheckoutSummary();
}

// ============================================================================
// 9. APP LIFECYCLE INITIALIZATION
// ============================================================================
function initPage() {
  updateCartBadge();
  updateWishlistBadge();
  renderFeaturedProducts();
  renderProductCatalog();
  initCatalogControls();
  renderWishlist();
  renderCartPage();
  handleCartActions();
  initCheckoutPage();
}

document.addEventListener('DOMContentLoaded', initPage);