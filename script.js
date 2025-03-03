document.addEventListener("DOMContentLoaded", () => {
    loadProducts();
    renderCart();
});

async function loadProducts() {
    try {
        const API_BASE_URL = "https://backend-px8c.onrender.com";
        const response = await fetch(`${API_BASE_URL}/api/products`);

        if (!response.ok) throw new Error("❌ Failed to fetch products.");

        const products = await response.json();
        console.log("📦 Products from DB:", products);
        renderProducts(products);
    } catch (error) {
        console.error("❌ Error fetching products:", error);
    }
}

function renderProducts(products) {
    const containers = {
        "playing-cards": document.getElementById("playing-cards"),
        "poker-chips": document.getElementById("poker-chips"),
        "accessories": document.getElementById("accessories")
    };

    // Ensure all category containers exist
    if (!containers["playing-cards"] || !containers["poker-chips"] || !containers["accessories"]) {
        console.error("❌ Product containers not found!");
        return;
    }

    // Clear all containers before inserting new products
    Object.values(containers).forEach(container => container.innerHTML = "");

    products.forEach((product) => {
        const category = product.category?.toLowerCase() || "accessories"; // Default to 'accessories'
        const imageUrl = product.images?.[0] || "placeholder.jpg";

        if (!containers[category]) {
            console.warn(`⚠️ Unknown category: ${category}, placing in 'accessories'.`);
        }

        const targetContainer = containers[category] || containers["accessories"]; // Fallback to accessories

const productHTML = `
    <div class="product-card">
     <img src="${imageUrl}" alt="${product.name}" onerror="this.src='placeholder.jpg'"
                 onclick="goToProductDetails('${product._id}', '${product.name}', ${product.price}, '${imageUrl}')">
            <h3>${product.name}</h3>
            <p>₱${product.price.toFixed(2)}</p>
          </div>`;

        targetContainer.insertAdjacentHTML("beforeend", productHTML);
    });
}


// Navigate to product details page when clicking on the image
function goToProductDetails(id, name, price, image) {
    window.location.href = `product-details.html?id=${id}&name=${encodeURIComponent(name)}&price=${price}&image=${encodeURIComponent(image)}`;
}

window.addToCart = (id, name, price) => {
    if (!id || !name || isNaN(price)) {
        console.error("❌ Invalid product data:", { id, name, price });
        return;
    }

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingProduct = cart.find(item => item.id === id);

    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.push({ id, name, price, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    alert(`${name} added to cart!`);
    renderCart();
};

function renderCart() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const cartItemsContainer = document.getElementById("cart-items");
    const cartTotalSpan = document.getElementById("cart-total");
    const cartCountSpan = document.getElementById("cart-count");
    const selectedProductTextArea = document.getElementById("selected-product");
    const orderTotalInput = document.getElementById("order-total");

    if (!cartItemsContainer || !cartTotalSpan || !cartCountSpan || !selectedProductTextArea || !orderTotalInput) {
        console.error("❌ One or more cart elements not found!");
        return;
    }

    cartItemsContainer.innerHTML = "";
    let total = 0;
    let orderSummaryText = "";

    cart.forEach((item, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
            ${item.name} - ₱${item.price.toFixed(2)} x ${item.quantity}
            <button onclick="removeFromCart(${index})">❌ Remove</button>
        `;
        cartItemsContainer.appendChild(li);
        total += item.price * item.quantity;
        orderSummaryText += `${item.quantity}x ${item.name} - ₱${(item.price * item.quantity).toFixed(2)}\n`;
    });

    cartTotalSpan.textContent = total.toFixed(2);
    cartCountSpan.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    selectedProductTextArea.value = orderSummaryText.trim();
    orderTotalInput.value = total.toFixed(2);
}

window.removeFromCart = (index) => {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (index >= 0 && index < cart.length) {
        const removedProduct = cart.splice(index, 1)[0];
        localStorage.setItem("cart", JSON.stringify(cart));
        renderCart();
        alert(`${removedProduct.name} removed from cart!`);
    }
};

document.getElementById("order-form")?.addEventListener("submit", async function (e) {
    e.preventDefault();

    const fullname = document.getElementById("fullname")?.value.trim();
    const gcash = document.getElementById("gcash")?.value.trim();
    const address = document.getElementById("address")?.value.trim();
    const orderTotal = document.getElementById("order-total")?.value;
    const paymentProof = document.getElementById("payment-proof")?.files[0];

    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (!fullname || !gcash || !address || cart.length === 0 || !orderTotal || !paymentProof) {
        alert("❌ Please complete all fields.");
        return;
    }

    const submitButton = document.getElementById("submit-order");
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Processing...";
    }

    const formData = new FormData();
    formData.append("fullname", fullname);
    formData.append("gcash", gcash);
    formData.append("address", address);
    formData.append("items", JSON.stringify(cart));
    formData.append("total", parseFloat(orderTotal).toFixed(2));
    formData.append("paymentProof", paymentProof);

    try {
        const API_BASE_URL = "https://backend-px8c.onrender.com";
        const response = await fetch(`${API_BASE_URL}/api/orders`, {
            method: "POST",
            body: formData,
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "❌ Failed to place order.");

        alert("✅ Order placed successfully!");
        localStorage.removeItem("cart");
        renderCart();
        document.getElementById("order-form")?.reset();
    } catch (error) {
        console.error("❌ Order Submission Error:", error);
        alert(error.message);
    } finally {
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = "Place Order";
        }
    }
});