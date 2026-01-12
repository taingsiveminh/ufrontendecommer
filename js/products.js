// Fetch and display products
async function loadProducts() {
    const loadingEl = document.getElementById("loading");
    const errorEl = document.getElementById("error");
    const productsContainer = document.getElementById("products-container");

    try {
        loadingEl.style.display = "block";
        errorEl.style.display = "none";

        const data = await apiCall("/products");
        
        loadingEl.style.display = "none";

        if (!data || data.length === 0) {
            productsContainer.innerHTML = "<p class='empty-message'>No products available</p>";
            return;
        }

        displayProducts(data);
    } catch (error) {
        loadingEl.style.display = "none";
        errorEl.style.display = "block";
        errorEl.textContent = "Failed to load products: " + error.message;
        console.error("Error fetching products:", error);
    }
}

// Display products on the page
function displayProducts(products) {
    const productsContainer = document.getElementById("products-container");
    productsContainer.innerHTML = "";

    products.forEach(product => {
        const productCard = createProductCard(product);
        productsContainer.appendChild(productCard);
    });
}

// Create a product card element
function createProductCard(product) {
    const card = document.createElement("div");
    card.className = "product-card";

    // Use product image if available, otherwise use placeholder
    const fallbackImageUrl = "assets/product-placeholder.svg";
    const imageUrl = product.image || product.imageUrl || fallbackImageUrl;

    const safeName = escapeHtml(product.name || "Product");
    const safeDesc = escapeHtml(product.description || "No description available");
    const safePrice = Number(product.price || 0);
    const safeId = Number(product.id);

    card.innerHTML = `
        <div class="product-media">
            <img src="${imageUrl}" alt="${safeName}" class="product-image" onerror="this.src='assets/product-placeholder.svg'">
            <div class="product-overlay">
                <div class="product-actions">
                    <button class="btn btn-quick" type="button" data-action="quick" data-product-id="${safeId}">Quick View</button>
                </div>
            </div>
        </div>
        <div class="product-info">
            <h3>${safeName}</h3>
            <p>${safeDesc}</p>
            <div class="product-price">$${safePrice.toFixed(2)}</div>
            <button class="btn btn-primary btn-block" type="button" data-action="add" data-product-id="${safeId}">
                Add to Cart
            </button>
        </div>
    `;

    // Store data for quick view (keeps it simple, no extra API calls)
    card.dataset.productId = String(safeId);
    card.dataset.productName = safeName;
    card.dataset.productDescription = safeDesc;
    card.dataset.productPrice = String(safePrice);
    card.dataset.productImage = imageUrl;

    return card;
}

function ensureQuickViewModal() {
    if (document.getElementById("quick-view-modal")) return;

    const modal = document.createElement("div");
    modal.id = "quick-view-modal";
    modal.className = "modal";
    modal.innerHTML = `
        <div class="modal-backdrop" data-action="close"></div>
        <div class="modal-dialog" role="dialog" aria-modal="true" aria-label="Quick view">
            <button class="modal-close" type="button" aria-label="Close" data-action="close">×</button>
            <div class="modal-content">
                <div class="modal-image">
                    <img id="qv-image" src="assets/product-placeholder.svg" alt="Product" onerror="this.src='assets/product-placeholder.svg'">
                </div>
                <div class="modal-details">
                    <h3 id="qv-name">Product</h3>
                    <div class="price" id="qv-price">$0.00</div>
                    <p class="desc" id="qv-desc">No description available</p>
                    <button class="btn btn-primary btn-block" id="qv-add" type="button">Add to Cart</button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Close handlers
    modal.addEventListener("click", (e) => {
        const action = e.target?.dataset?.action;
        if (action === "close") closeQuickView();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeQuickView();
    });
}

function openQuickViewFromCard(cardEl) {
    ensureQuickViewModal();

    const modal = document.getElementById("quick-view-modal");
    const image = document.getElementById("qv-image");
    const name = document.getElementById("qv-name");
    const price = document.getElementById("qv-price");
    const desc = document.getElementById("qv-desc");
    const addBtn = document.getElementById("qv-add");

    const productId = Number(cardEl.dataset.productId || 0);
    const productName = cardEl.dataset.productName || "Product";
    const productDescription = cardEl.dataset.productDescription || "No description available";
    const productPrice = Number(cardEl.dataset.productPrice || 0);
    const productImage = cardEl.dataset.productImage || "assets/product-placeholder.svg";

    image.src = productImage;
    image.alt = productName;
    name.textContent = productName;
    desc.textContent = productDescription;
    price.textContent = `$${productPrice.toFixed(2)}`;

    addBtn.onclick = () => {
        addToCart(productId, productName, productPrice, productImage);
        closeQuickView();
    };

    modal.classList.add("is-open");
}

function closeQuickView() {
    const modal = document.getElementById("quick-view-modal");
    if (!modal) return;
    modal.classList.remove("is-open");
}

function wireProductInteractions() {
    const container = document.getElementById("products-container");
    if (!container) return;

    container.addEventListener("click", (e) => {
        const target = e.target;
        if (!(target instanceof HTMLElement)) return;

        const action = target.dataset.action;
        if (!action) return;

        const card = target.closest(".product-card");
        if (!card) return;

        const productId = Number(card.dataset.productId || 0);
        const productName = card.dataset.productName || "Product";
        const productPrice = Number(card.dataset.productPrice || 0);
        const productImage = card.dataset.productImage || "assets/product-placeholder.svg";

        if (action === "add") {
            addToCart(productId, productName, productPrice, productImage);
        }

        if (action === "quick") {
            openQuickViewFromCard(card);
        }
    });
}

// Add product to cart
function addToCart(productId, productName, price, imageUrl) {
    // Get existing cart
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    // Check if product already exists in cart
    const existingItem = cart.find(item => item.productId === productId);

    if (existingItem) {
        existingItem.qty += 1;
    } else {
        cart.push({
            productId: productId,
            name: productName,
            price: price,
            image: imageUrl,
            qty: 1
        });
    }

    // Save cart to localStorage
    localStorage.setItem("cart", JSON.stringify(cart));

    // Update cart count
    updateCartCount();

    // Show feedback
    showNotification("Product added to cart!");
}

// Show notification
function showNotification(message) {
    // Create notification element
    const notification = document.createElement("div");
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background-color: #2ecc71;
        color: white;
        padding: 1rem 2rem;
        border-radius: 5px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = "slideOut 0.3s ease-out";
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

// Initialize products page
if (document.getElementById("products-container")) {
    wireProductInteractions();
    loadProducts();
}
