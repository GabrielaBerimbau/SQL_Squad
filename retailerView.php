<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Retailer Dashboard</title>
    <link rel="stylesheet" href="css/retailerView.css">   
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet">

   <style>
        /* modal container */
        div#addProductModal,
        div#editProductModal {
            display: none !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background-color: rgba(0, 0, 0, 0.7) !important;
            z-index: 9999 !important;
            overflow: auto !important;
            backdrop-filter: blur(5px) !important;
        }

        div#addProductModal.modal[style*="flex"],
        div#editProductModal.modal[style*="flex"] {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            padding: 20px !important;
            box-sizing: border-box !important;
        }

        div#addProductModal div.modal-content,
        div#editProductModal div.modal-content {
            background: #ffffff !important;
            border-radius: 16px !important;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2) !important;
            width: 100% !important;
            max-width: 500px !important;
            max-height: 90vh !important;
            overflow: hidden !important;
            position: relative !important;
            margin: 0 !important;
            animation: modalSlideIn 0.3s ease-out !important;
        }

        @keyframes modalSlideIn {
            from {
                opacity: 0;
                transform: scale(0.9) translateY(-20px);
            }
            to {
                opacity: 1;
                transform: scale(1) translateY(0);
            }
        }

        /* modal Header */
        div#addProductModal div.modal-content h2,
        div#editProductModal div.modal-content h2 {
            margin: 0 !important;
            padding: 24px 24px 16px 24px !important;
            font-size: 24px !important;
            font-weight: 700 !important;
            color: #1a202c !important;
            text-align: center !important;
            border-bottom: 1px solid #e2e8f0 !important;
            background: linear-gradient(135deg, #32402f 0%, #506046 100%) !important;
            -webkit-background-clip: text !important;
            -webkit-text-fill-color: transparent !important;
            background-clip: text !important;
        }

        /* close Button */
        div#addProductModal span.close,
        div#editProductModal span.close {
            position: absolute !important;
            top: 12px !important;
            right: 12px !important;
            width: 32px !important;
            height: 32px !important;
            background: rgba(50, 64, 47, 0.1) !important;
            border-radius: 50% !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            cursor: pointer !important;
            font-size: 18px !important;
            color: #666 !important;
            transition: all 0.2s ease !important;
            z-index: 10 !important;
        }

        div#addProductModal span.close:hover,
        div#editProductModal span.close:hover {
            background: #e74a3b !important;
            color: white !important;
            transform: scale(1.1) !important;
        }

        /* form */
        div#addProductModal form,
        div#editProductModal form {
            padding: 20px 24px 24px 24px !important;
            max-height: calc(90vh - 80px) !important;
            overflow-y: auto !important; /* vertical scroll if needed */
        }

        div#addProductModal .form-group,
        div#editProductModal .form-group {
            margin-bottom: 20px !important; /*space between form groups*/
        }

        /* labels */
        div#addProductModal label,
        div#editProductModal label {
            display: block !important;
            margin-bottom: 6px !important;
            font-weight: 600 !important;
            font-size: 14px !important;
            color: #32402f !important;
            text-transform: uppercase !important;
            letter-spacing: 0.5px !important;
        }

        /* form controls */
        div#addProductModal .form-control,
        div#editProductModal .form-control {
            width: 100% !important;
            padding: 12px 16px !important;
            border: 2px solid #d1d5db !important;
            border-radius: 8px !important;
            font-size: 14px !important;
            font-family: inherit !important;
            background-color: #f9fafb !important;
            transition: all 0.2s ease !important;
            box-sizing: border-box !important;
        }

        div#addProductModal .form-control:focus,
        div#editProductModal .form-control:focus {
            outline: none !important;
            border-color: #32402f !important;
            background-color: #ffffff !important;
            box-shadow: 0 0 0 3px rgba(50, 64, 47, 0.1) !important;
        }

        /* textarea */
        div#addProductModal textarea.form-control,
        div#editProductModal textarea.form-control {
            min-height: 80px !important;
            resize: vertical !important;
        }

        /* File Input */
        div#addProductModal input[type="file"].form-control,
        div#editProductModal input[type="file"].form-control {
            padding: 8px 12px !important;
            background-color: #ffffff !important;
            border-style: dashed !important;
            border-color: #32402f !important;
        }

        div#addProductModal input[type="file"].form-control:hover,
        div#editProductModal input[type="file"].form-control:hover {
            border-color: #506046 !important;
            background-color: #f0f4f0 !important;
        }

        /* Submit Button */
        div#addProductModal .form-submit,
        div#editProductModal .form-submit {
            width: 100% !important;
            padding: 14px 20px !important;
            background: linear-gradient(135deg, #32402f 0%, #506046 100%) !important;
            color: white !important;
            border: none !important;
            border-radius: 8px !important;
            font-size: 16px !important;
            font-weight: 600 !important;
            cursor: pointer !important;
            transition: all 0.2s ease !important;
            margin-top: 8px !important;
            text-transform: uppercase !important;
            letter-spacing: 0.5px !important;
        }

        div#addProductModal .form-submit:hover,
        div#editProductModal .form-submit:hover {
            background: linear-gradient(135deg, #506046 0%, #65875e 100%) !important;
            transform: translateY(-1px) !important;
            box-shadow: 0 8px 25px rgba(50, 64, 47, 0.3) !important;
        }

    </style>
</head>
<body>

    <div class="navbar">
        <a href="#" class="brand">CompareIt</a>
        <div class="user-info">
            <div class="user-details">
                <div class="user-name">Retailer User</div>
                <div class="user-role">Essence Beauty</div>
            </div>
            <div class="user-avatar">R</div>
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
        <input type="text" id="searchInput" placeholder="Search products..." class="search-input">
            <button class="add-button">
                <i class="fas fa-plus"></i> Add New Product
            </button>
        </div>
        
        <!-- Action Buttons -->
        <div class="button-group">
            <button class="delete-all">Delete All</button>
        </div>
        
        <!-- Products Section -->
        <div class="products-container">
            <!-- products loaded with js -->
        </div>
    </div>
    
    <!-- Add Product Modal -->
    <div id="addProductModal" class="modal">
        <div class="modal-content">
            <span class="close">&times;</span>
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
                    <label for="image_url">Product Image URL</label>
                    <input type="url" id="image_url" name="image_url" class="form-control" placeholder="https://example.com/image.jpg">
                </div>
                <button type="submit" class="form-submit">Add Product</button>
            </form>
        </div>
    </div>
        
    <!-- Edit Product Modal -->
    <div id="editProductModal" class="modal">
        <div class="modal-content">
            <span class="close">&times;</span>
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
                    <label for="edit_image_url">Product Image URL</label>
                    <input type="url" id="edit_image_url" name="image_url" class="form-control" placeholder="https://example.com/image.jpg">
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="edit_stock" name="product_stock"> In Stock
                    </label>
                </div>
                <div class="form-group">
                    <img id="current_image_preview" src="" alt="Current product image" style="max-width: 100px; max-height: 100px; display: none; margin-top: 10px; border-radius: 4px;">
                </div>
                <button type="submit" class="form-submit">Update Product</button>
            </form>
        </div>
    </div>

    <script>
        // localStorage.setItem('user_id', '4'); //////////////////REPLACE LATER
        
    </script>

    <script src="js/retailerView.js"></script>

</body>
<?php include 'footer.php'; ?>