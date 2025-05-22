<?php

$retailer_name = "Dischem Retailer";
$products = [
    [
        'id' => 1,
        'name' => 'Essence Lash Princess Mascara',
        'price' => 144.99,
        'image' => 'https://via.placeholder.com/150',
        'description' => 'False lash effect mascara for dramatic volume'
    ],
    [
        'id' => 2,
        'name' => 'Essence Pure Nude Highlighter',
        'price' => 169.99,
        'image' => 'https://via.placeholder.com/150',
        'description' => 'Natural glow highlighter for a radiant finish'
    ],
    [
        'id' => 3,
        'name' => 'Essence Soft Touch Mousse Foundation',
        'price' => 150.99,
        'image' => 'https://via.placeholder.com/150',
        'description' => 'Lightweight mousse foundation with matte finish'
    ],
    [
        'id' => 4,
        'name' => 'Essence Long Lasting Eye Pencil',
        'price' => 120.99,
        'image' => 'https://via.placeholder.com/150',
        'description' => 'Waterproof eye pencil for precise application'
    ],
    [
        'id' => 5,
        'name' => 'Essence Shine Shine Shine Lipgloss',
        'price' => 3.49,
        'image' => 'https://via.placeholder.com/150',
        'description' => 'High-shine lip gloss with non-sticky formula'
    ],
    [
        'id' => 6,
        'name' => 'Essence Make Me Brow Gel',
        'price' => 2.99,
        'image' => 'https://via.placeholder.com/150',
        'description' => 'Tinted brow gel with fibers for fuller-looking brows'
    ]
];

// Calculate statistics
$total_products = count($products);
$average_price = array_sum(array_column($products, 'price')) / $total_products;
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Retailer Dashboard</title>
    <link rel="stylesheet" href="css/retailerView.css">   
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet">
    </head>
<body>

    <div class="navbar">
        <a href="#" class="brand">CompareIt</a>
        <div class="user-info">
            <div class="user-details">
                <div class="user-name">Retailer User</div>
                <div class="user-role">Essence Beauty</div>
            </div>
            <div class="user-avatar">E</div>
            <a href="index.php" class="logout-button" title="Log out">Logout</a>
        </div>
    </div>

    <div class="container">
         <h1 class="page-title">Manage Products</h1>
        
        <!-- Statistics Section -->
        <div class="stats-container">
            <div class="stat-card">
                <div class="stat-value"><?php echo count($products); ?></div>
                <div class="stat-label">Total Products</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-value">R<?php echo number_format(array_sum(array_column($products, 'price')) / count($products), 2); ?></div>
                <div class="stat-label">Average Price</div>
            </div>
        </div>

        <div class="actions-bar">
            <input type="text" class="search-input" placeholder="Search products...">
            <button class="add-button" onclick="openAddModal()">
                <i class="fas fa-plus"></i> Add New Product
            </button>
        </div>
        
        <!-- Action Buttons -->
        <div class="button-group">
            <button>Select All</button>
            <button>Bulk Edit</button>
        </div>
        
        <!-- Products Section -->
        <div class="products-container">
            <?php foreach ($products as $product): ?>
            <div class="product-card">
                <img class="product-image" src="<?php echo $product['image']; ?>" alt="<?php echo $product['name']; ?>">
                <div class="product-details">
                    <div class="product-status">
                        <div class="status-dot"></div>
                        Active
                    </div>
                    <h3 class="product-name"><?php echo $product['name']; ?></h3>
                    <div class="product-price">R<?php echo number_format($product['price'], 2); ?></div>
                    <div class="product-meta">Updated: 2025-05-19</div>
                    <div class="product-actions">
                        <button class="action-button edit-button" onclick="openEditModal(<?php echo $product['id']; ?>)">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="action-button delete-button" onclick="confirmDelete(<?php echo $product['id']; ?>)">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            </div>
            <?php endforeach; ?>
        </div>
    </div>
    
    <!-- Add Product Modal -->
    <div id="addProductModal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="closeAddModal()">&times;</span>
            <h2>Add New Product</h2>
            <form id="addProductForm">
                <div class="form-group">
                    <label for="product_name">Product Name</label>
                    <input type="text" id="product_name" name="product_name" class="form-control" required>
                </div>
                <div class="form-group">
                    <label for="price">Price (R)</label>
                    <input type="number" id="price" name="price" class="form-control" step="0.01" min="0" required>
                </div>
                <div class="form-group">
                    <label for="description">Description</label>
                    <textarea id="description" name="description" class="form-control" rows="3" required></textarea>
                </div>
                <div class="form-group">
                    <label for="image">Product Image</label>
                    <input type="file" id="image" name="image" class="form-control" accept="image/*">
                </div>
                <button type="submit" class="form-submit">Add Product</button>
            </form>
        </div>
    </div>
    
    <!-- Edit Product Modal -->
    <div id="editProductModal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="closeEditModal()">&times;</span>
            <h2>Edit Product</h2>
            <form id="editProductForm">
                <input type="hidden" id="edit_product_id" name="product_id">
                <div class="form-group">
                    <label for="edit_product_name">Product Name</label>
                    <input type="text" id="edit_product_name" name="product_name" class="form-control" required>
                </div>
                <div class="form-group">
                    <label for="edit_price">Price (R)</label>
                    <input type="number" id="edit_price" name="price" class="form-control" step="0.01" min="0" required>
                </div>
                <div class="form-group">
                    <label for="edit_description">Description</label>
                    <textarea id="edit_description" name="description" class="form-control" rows="3" required></textarea>
                </div>
                <div class="form-group">
                    <label for="edit_image">Product Image</label>
                    <input type="file" id="edit_image" name="image" class="form-control" accept="image/*">
                </div>
                <div class="form-group">
                    <img id="current_image_preview" src="" alt="Current product image" style="max-width: 100px; max-height: 100px; display: block; margin-top: 10px;">
                </div>
                <button type="submit" class="form-submit">Update Product</button>
            </form>
        </div>
    </div>
    
    <script>
        // Add Product Modal Functions
        function openAddModal() {
            document.getElementById('addProductModal').style.display = 'block';
        }
        
        function closeAddModal() {
            document.getElementById('addProductModal').style.display = 'none';
        }
        
        // Edit Product Modal Functions
        function openEditModal(productId) {
            // In a real application, you would fetch the product details from the server
            // For demonstration, we'll use the mock data
            <?php
            echo "const products = " . json_encode($products) . ";\n";
            ?>
            
            const product = products.find(p => p.id === productId);
            
            if (product) {
                document.getElementById('edit_product_id').value = product.id;
                document.getElementById('edit_product_name').value = product.name;
                document.getElementById('edit_price').value = product.price;
                document.getElementById('edit_description').value = product.description;
                document.getElementById('current_image_preview').src = product.image;
                
                document.getElementById('editProductModal').style.display = 'block';
            }
        }
        
        function closeEditModal() {
            document.getElementById('editProductModal').style.display = 'none';
        }
        
        // Delete Product Function
        function confirmDelete(productId) {
            if (confirm("Are you sure you want to delete this product?")) {
                // In a real application, you would send a request to the server to delete the product
                alert("Product deletion would be processed (Product ID: " + productId + ")");
            }
        }
        
        // Close modals when clicking outside of them
        window.onclick = function(event) {
            if (event.target == document.getElementById('addProductModal')) {
                closeAddModal();
            }
            if (event.target == document.getElementById('editProductModal')) {
                closeEditModal();
            }
        }
        
        // Form submissions (would normally send data to server)
        document.getElementById('addProductForm').addEventListener('submit', function(e) {
            e.preventDefault();
            alert("New product would be added.");
            closeAddModal();
        });
        
        document.getElementById('editProductForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const productId = document.getElementById('edit_product_id').value;
            alert("Product " + productId + " would be updated.");
            closeEditModal();
        });
    </script>
</body>
<?php include 'footer.php'; ?>