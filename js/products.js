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
    const imageUrl = product.image || product.imageUrl || `https://via.placeholder.com/300x250?text=${encodeURIComponent(product.name || 'Product')}`;

    card.innerHTML = `
        <img src="${imageUrl}" alt="${product.name || 'Product'}" class="product-image" onerror="this.src='https://via.placeholder.com/300x250?text=Product'">
        <div class="product-info">
            <h3>${product.name || 'Unnamed Product'}</h3>
            <p>${product.description || 'No description available'}</p>
            <div class="product-price">$${(product.price || 0).toFixed(2)}</div>
            <button class="btn btn-primary btn-block" onclick="addToCart(${product.id}, '${escapeHtml(product.name)}', ${product.price}, '${imageUrl}')">
                Add to Cart
            </button>
        </div>
    `;

    return card;
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
    loadProducts();
}
