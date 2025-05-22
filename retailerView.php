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
                <div class="stat-value" id="total-products">0</div>
                <div class="stat-label">Total Products</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-value">R0.00</div>
                <div class="stat-label">Average Price</div>
            </div>
        </div>

        <!-- add loading indicator -->
        <div id="loading-indicator" style="display: none; text-align: center; padding: 20px;">Loading...</div>

        <div class="actions-bar">
            <input type="text" class="search-input" placeholder="Search products...">
            <button class="add-button" onclick="openAddModal()">
                <i class="fas fa-plus"></i> Add New Product
            </button>
        </div>
        
        <!-- Action Buttons -->
        <div class="button-group">
            <button class="select-all">Select All</button>
            <button class="delete-all">Bulk Edit</button>
        </div>
        
        <!-- Products Section -->
        <div class="products-container">
            <!-- products loaded with js -->
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
                    <label for="brand">Brand</label>
                    <input type="text" id="brand" name="brand" class="form-control">
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
                    <label for="edit_brand">Brand</label>
                    <input type="text" id="edit_brand" name="brand" class="form-control">
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
        localStorage.setItem('user_id', '1'); //////////////////REPLACE LATER
        //keep these for now
        function openAddModal() {
            document.getElementById('addProductModal').style.display = 'block';
        }

        function closeAddModal() {
            document.getElementById('addProductModal').style.display = 'none';
        }

        function openEditModal(productId) {
            // This will be handled by RetailerView.js
            if (typeof RetailerView !== 'undefined') {
                RetailerView.openEditModal(productId);
            }
        }

        function closeEditModal() {
            document.getElementById('editProductModal').style.display = 'none';
        }

        function confirmDelete(productId) {
            // This will be handled by RetailerView.js
            if (typeof RetailerView !== 'undefined') {
                RetailerView.confirmDelete(productId);
            }
        }

        // Close modals when clicking outside
        window.onclick = function(event) {
            if (event.target == document.getElementById('addProductModal')) {
                closeAddModal();
            }
            if (event.target == document.getElementById('editProductModal')) {
                closeEditModal();
            }
        }
    </script>

    <script src="js/retailerView.js"></script>

</body>
<?php include 'footer.php'; ?>