document.addEventListener("DOMContentLoaded", () => {
    const productForm = document.getElementById("product-form");
    const productContainer = document.getElementById("product-list");

    if (!productForm || !productContainer) {
        console.error("❌ Form or product container not found!");
        return;
    }

    const API_BASE_URL = "https://backend-px8c.onrender.com"; // ✅ Use Render backend

    // ✅ Fetch products from the API and display them
    async function fetchProducts() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/products`);
            if (!response.ok) throw new Error("❌ Failed to fetch products.");

            const products = await response.json();
            console.log("📦 Products from DB:", products);
            renderProducts(products);
        } catch (error) {
            console.error("❌ Error fetching products:", error);
        }
    }

    // ✅ Render products dynamically
    function renderProducts(products) {
        productContainer.innerHTML = "";
        products.forEach((product) => {
            const li = document.createElement("li");
            li.innerHTML = `
                <img src="${product.images?.[0] || 'placeholder.jpg'}" 
                     alt="${product.name}" 
                     width="100" 
                     onerror="this.src='placeholder.jpg'">
                <div>
                    <strong>${product.name}</strong> - ₱${product.price} (${product.category})
                    <p>${product.description || 'No description available'}</p>
                </div>
            `;

          

            // Delete button
            const deleteButton = document.createElement("button");
            deleteButton.textContent = "🗑 Delete";
            deleteButton.addEventListener("click", () => deleteProduct(product._id));

           
            li.appendChild(deleteButton);
            productContainer.appendChild(li);
        });
    }

    // ✅ Delete Product (Calls API with DELETE method)
    window.deleteProduct = async (id) => {
        console.log("🛠️ Deleting Product ID:", id);

        if (!confirm("Are you sure you want to delete this product?")) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
                method: "DELETE",
                headers: { "Accept": "application/json" }
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.error || "❌ Failed to delete product.");
            }

            alert("✅ Product and images deleted successfully!");
            fetchProducts();
        } catch (error) {
            console.error("❌ Error deleting product:", error);
            alert(error.message);
        }
    };

    // ✅ Handle Product Submission
    productForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("product-name").value.trim();
        const price = parseFloat(document.getElementById("product-price").value.trim());
        const description = document.getElementById("product-description").value.trim();
        const category = document.getElementById("product-category").value;
        const mainImageFile = document.getElementById("product-image").files[0];
        const additionalImages = document.querySelectorAll(".additional-image");

        if (!name || isNaN(price) || !category || !mainImageFile) {
            alert("❌ Please fill in all required fields.");
            return;
        }

        const formData = new FormData();
        formData.append("name", name);
        formData.append("price", price);
        formData.append("description", description);
        formData.append("category", category);
        formData.append("images", mainImageFile);

        // ✅ Append Additional Images (If Available)
        additionalImages.forEach((input) => {
            if (input.files.length > 0) {
                formData.append("images", input.files[0]);
            }
        });

        try {
            const response = await fetch(`${API_BASE_URL}/api/products`, {
                method: "POST",
                body: formData,
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || "❌ Failed to save product.");

            alert("✅ Product saved successfully!");
            productForm.reset();
            fetchProducts();
        } catch (error) {
            console.error("❌ Error saving product:", error);
            alert("❌ Failed to save product.");
        }
    });

    fetchProducts();
});
