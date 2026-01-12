// Get cart from localStorage
function getCart() {
    return JSON.parse(localStorage.getItem("cart")) || [];
}

// Save cart to localStorage
function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
}

// Update cart count badge
function updateCartCount() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    const cartCountElements = document.querySelectorAll("#cart-count");
    cartCountElements.forEach(el => {
        el.textContent = totalItems;
    });
}

// Display cart items
function displayCart() {
    const cart = getCart();
    const cartItemsEl = document.getElementById("cart-items");
    const cartSummaryEl = document.getElementById("cart-summary");
    const emptyCartEl = document.getElementById("empty-cart");

    if (cart.length === 0) {
        cartItemsEl.innerHTML = "";
        cartSummaryEl.style.display = "none";
        emptyCartEl.style.display = "block";
        return;
    }

    emptyCartEl.style.display = "none";
    cartSummaryEl.style.display = "block";

    // Display cart items
    cartItemsEl.innerHTML = "";
    cart.forEach((item, index) => {
        const cartItem = createCartItem(item, index);
        cartItemsEl.appendChild(cartItem);
    });

    // Update summary
    updateCartSummary(cart);
}

// Create cart item element
function createCartItem(item, index) {
    const itemDiv = document.createElement("div");
    itemDiv.className = "cart-item";

    const imageUrl = item.image || "assets/product-placeholder.svg";

    itemDiv.innerHTML = `
        <img src="${imageUrl}" alt="${item.name}" class="cart-item-image" onerror="this.src='assets/product-placeholder.svg'">
        <div class="cart-item-info">
            <h3>${item.name}</h3>
            <p>Price: $${item.price.toFixed(2)}</p>
            <p>Subtotal: $${(item.price * item.qty).toFixed(2)}</p>
        </div>
        <div class="cart-item-actions">
            <div class="quantity-controls">
                <button onclick="updateQuantity(${index}, -1)">-</button>
                <span>${item.qty}</span>
                <button onclick="updateQuantity(${index}, 1)">+</button>
            </div>
            <button class="btn btn-danger" onclick="removeFromCart(${index})">Remove</button>
        </div>
    `;

    return itemDiv;
}

// Update item quantity
function updateQuantity(index, change) {
    const cart = getCart();
    
    if (cart[index]) {
        cart[index].qty += change;
        
        if (cart[index].qty <= 0) {
            cart.splice(index, 1);
        }
        
        saveCart(cart);
        displayCart();
    }
}

// Remove item from cart
function removeFromCart(index) {
    const cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    displayCart();
}

// Update cart summary
function updateCartSummary(cart) {
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const total = subtotal; // Can add tax/shipping here if needed

    document.getElementById("total-items").textContent = totalItems;
    document.getElementById("subtotal").textContent = "$" + subtotal.toFixed(2);
    document.getElementById("total").textContent = "$" + total.toFixed(2);
}

// Place order
async function placeOrder() {
    const cart = getCart();
    
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    // Check if user is logged in
    const token = getToken();
    if (!token) {
        alert("Please login to place an order");
        window.location.href = "login.html";
        return;
    }

    try {
        const checkoutBtn = document.getElementById("checkout-btn");
        checkoutBtn.disabled = true;
        checkoutBtn.textContent = "Processing...";

        // Place order for each item in cart
        const orderPromises = cart.map(item => {
            return apiCall("/orders", {
                method: "POST",
                body: JSON.stringify({
                    productId: item.productId,
                    qty: item.qty
                })
            });
        });

        await Promise.all(orderPromises);

        // Clear cart
        localStorage.removeItem("cart");
        updateCartCount();

        alert("Order placed successfully!");
        window.location.href = "index.html";
    } catch (error) {
        alert("Failed to place order: " + error.message);
        const checkoutBtn = document.getElementById("checkout-btn");
        checkoutBtn.disabled = false;
        checkoutBtn.textContent = "Proceed to Checkout";
    }
}

// Initialize checkout button
if (document.getElementById("checkout-btn")) {
    document.getElementById("checkout-btn").addEventListener("click", placeOrder);
}
