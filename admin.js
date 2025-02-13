document.addEventListener("DOMContentLoaded", () => {
    const productForm = document.getElementById("product-form");
    const productContainer = document.getElementById("product-list");

    if (!productForm || !productContainer) {
        console.error("âŒ Form or product container not found!");
        return;
    }

    // âœ… Fetch products from the API and display them
    async function fetchProducts() {
        try {
           const API_BASE_URL = "https://vdeck.onrender.com"; // ✅ Use Render backend

const response = await fetch(`${API_BASE_URL}/api/products`); // ✅ Updated API URL
if (!response.ok) throw new Error("❌ Failed to fetch products.");

            const products = await response.json();
            console.log("ðŸ“¦ Products from DB:", products);
            renderProducts(products);
        } catch (error) {
            console.error("âŒ Error fetching products:", error);
        }
    }

    // âœ… Render products dynamically
    function renderProducts(products) {
        productContainer.innerHTML = "";
        products.forEach((product) => {
            const li = document.createElement("li");
            li.innerHTML = `
                <img src="https://vdeck.onrender.com${product.images?.[0]}" 
     alt="${product.name}" 
     width="100" 
     onerror="this.src='placeholder.jpg'">


                <div>
                    <strong>${product.name}</strong> - â‚±${product.price} (${product.category})
                    <p>${product.description || 'No description available'}</p>
                </div>
            `;

            // Edit button
            const editButton = document.createElement("button");
            editButton.textContent = "âœ Edit";
            editButton.addEventListener("click", () => editProduct(product._id));

            // Delete button
            const deleteButton = document.createElement("button");
            deleteButton.textContent = "ðŸ—‘ Delete";
            deleteButton.addEventListener("click", () => deleteProduct(product._id));

            li.appendChild(editButton);
            li.appendChild(deleteButton);
            productContainer.appendChild(li);
        });
    }

    // âœ… Delete Product
    window.deleteProduct = async (id) => {
        console.log("ðŸ›  Deleting Product ID:", id);

        if (!confirm("Are you sure you want to delete this product?")) return;

        try {
            
               const API_BASE_URL = "https://vdeck.onrender.com"; // ✅ Use Render backend

const response = await fetch(`${API_BASE_URL}/api/products/${id}`, { // ✅ Updated API URL
    method: "DELETE",
    headers: { "Accept": "application/json" }
});

            });

            if (!response.ok) throw new Error("âŒ Failed to delete product.");

            alert("âœ… Product deleted successfully!");
            fetchProducts();
        } catch (error) {
            console.error("âŒ Error deleting product:", error);
            alert(error.message);
        }
    };

    // âœ… Handle Product Submission
    productForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("product-name").value.trim();
        const price = parseFloat(document.getElementById("product-price").value.trim());
        const description = document.getElementById("product-description").value.trim();
        const category = document.getElementById("product-category").value;
        const mainImageFile = document.getElementById("product-image").files[0];
        const additionalImages = document.querySelectorAll(".additional-image");

        if (!name || isNaN(price) || !category || !mainImageFile) {
            alert("âŒ Please fill in all required fields.");
            return;
        }

        const formData = new FormData();
        formData.append("name", name);
        formData.append("price", price);
        formData.append("description", description);
        formData.append("category", category);
        formData.append("images", mainImageFile);

        // âœ… Append Additional Images (If Available)
        additionalImages.forEach((input) => {
            if (input.files.length > 0) {
                formData.append("images", input.files[0]);
            }
        });

        try {
            const API_BASE_URL = "https://vdeck.onrender.com"; // ✅ Use Render backend

const response = await fetch(`${API_BASE_URL}/api/products`, { // ✅ Updated API URL
    method: "POST",
    body: formData,
});


            const result = await response.json();
            if (!response.ok) throw new Error(result.error || "âŒ Failed to save product.");

            alert("âœ… Product saved successfully!");
            productForm.reset();
            fetchProducts();
        } catch (error) {
            console.error("âŒ Error saving product:", error);
            alert("âŒ Failed to save product.");
        }
    });

    fetchProducts();
});
