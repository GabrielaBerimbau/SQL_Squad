//global variables
var RetailerView = {
    userId: null,
    username: null,
    products: [],
    
    //initialize retailerView
    init: function() {
        console.log("Initializing RetailerView");
        
        // Clear any existing event listeners first
        this.cleanup();
        
        //get stored id of user logged in
        var storedUserId = null;
        var storedUsername = null;

        if (typeof(Storage) !== "undefined") {
            // Use a more specific approach to avoid conflicts
            try {
                // check localStorage first
                storedUserId = window.localStorage.getItem('user_id');
                storedUsername = window.localStorage.getItem('username');
                
                if (!storedUserId || !storedUsername) {
                    // check sessionStorage as fallback
                    storedUserId = window.sessionStorage.getItem('user_id');
                    storedUsername = window.sessionStorage.getItem('username');
                }
            } catch (e) {
                console.error("Storage access error:", e);
            }
            
            if (storedUserId && storedUsername) { //user is logged in
                RetailerView.userId = parseInt(storedUserId, 10);
                RetailerView.username = storedUsername;
                console.log("Found user ID:", RetailerView.userId);
                console.log("Found username:", RetailerView.username);
            } else {
                console.error("No user logged in");
                alert("Please log in first");
                window.location.href = '/login.php';
                return;
            }
        } else {
            console.error("Browser does not support web storage");
            alert("Your browser does not support web storage");
            return;
        }
        
        // Initialize components in sequence to avoid conflicts
        setTimeout(() => {
            RetailerView.displayUsername();
            RetailerView.setupEventListeners();
            RetailerView.getProducts();
            RetailerView.searchFunction();
        }, 100);
    },

    // Cleanup function to remove existing event listeners
    cleanup: function() {
        var productsContainer = document.querySelector('.products-container');
        if (productsContainer) {
            // Remove existing event listeners by cloning the element
            var newContainer = productsContainer.cloneNode(true);
            productsContainer.parentNode.replaceChild(newContainer, productsContainer);
        }
    },

    displayUsername: function() {
        console.log("Displaying username:", RetailerView.username); 

        //update username
        var userNameElement = document.querySelector('.user-role');
        if (userNameElement && RetailerView.username) {
            userNameElement.textContent = RetailerView.username;
        }

        //avatar
        var userAvatarElement = document.querySelector('.user-avatar');
        if (userAvatarElement && RetailerView.username) {
            userAvatarElement.textContent = RetailerView.username.charAt(0).toUpperCase();
        }

        console.log("User data displayed successfully");
    },

    //setting up all event listeners for the page - FIXED VERSION
    setupEventListeners: function() {
        console.log("Setting up event listeners...");
        
        // Add Product Modal Events
        var addModal = document.getElementById('addProductModal');
        var addBtn = document.querySelector('.add-button');
        var addCloseBtn = addModal ? addModal.querySelector('.close') : null;
        var addForm = document.getElementById('addProductForm');

        if (addBtn) {
            addBtn.onclick = function(e) {
                e.preventDefault();
                RetailerView.openAddModal();
            };
        }

        if (addCloseBtn) {
            addCloseBtn.onclick = function(e) {
                e.preventDefault();
                RetailerView.closeAddModal();
            };
        }

        if (addForm) {
            addForm.onsubmit = function(e) {
                e.preventDefault();
                RetailerView.handleAddProduct();
            };
        }

        // Edit Product Modal Events
        var editModal = document.getElementById('editProductModal');
        var editCloseBtn = editModal ? editModal.querySelector('.close') : null;
        var editForm = document.getElementById('editProductForm');

        if (editCloseBtn) {
            editCloseBtn.onclick = function(e) {
                e.preventDefault();
                RetailerView.closeEditModal();
            };
        }

        if (editForm) {
            editForm.onsubmit = function(e) {
                e.preventDefault();
                RetailerView.handleEditProduct();
            };
        }

        // Close modals when clicking outside
        window.onclick = function(event) {
            if (event.target === addModal) {
                RetailerView.closeAddModal();
            }
            if (event.target === editModal) {
                RetailerView.closeEditModal();
            }
        };

        //Product Actions 
        var productsContainer = document.querySelector('.products-container');
        if (productsContainer) {
            productsContainer.addEventListener('click', function(e) {
                console.log("Click detected on:", e.target);
                
                // Prevent multiple event triggers
                e.stopPropagation();
                
                var target = e.target;
                var button = null;
                var productId = null;
                
                // More robust button detection
                if (target.classList.contains('edit-button') || target.classList.contains('delete-button')) {
                    button = target;
                } else if (target.parentElement && (target.parentElement.classList.contains('edit-button') || target.parentElement.classList.contains('delete-button'))) {
                    button = target.parentElement;
                } else {
                    // Check up to 3 levels up for the button
                    var currentElement = target;
                    for (var i = 0; i < 3; i++) {
                        if (currentElement.classList.contains('edit-button') || currentElement.classList.contains('delete-button')) {
                            button = currentElement;
                            break;
                        }
                        currentElement = currentElement.parentElement;
                        if (!currentElement) break;
                    }
                }
                
                if (button) {
                    // Get product ID with better error checking
                    productId = button.getAttribute('data-product-id');
                    
                    if (!productId) {
                        var productCard = button.closest('.product-card');
                        if (productCard) {
                            productId = productCard.getAttribute('data-product-id');
                        }
                    }
                    
                    console.log("Button found:", button.className);
                    console.log("Product ID found:", productId);
                    
                    if (productId && productId !== 'null' && productId !== 'undefined') {
                        e.preventDefault();
                        
                        if (button.classList.contains('edit-button')) {
                            console.log("Edit button clicked for product ID:", productId);
                            RetailerView.editProduct(parseInt(productId));
                        } else if (button.classList.contains('delete-button')) {
                            console.log("Delete button clicked for product ID:", productId);
                            // Add confirmation before delete
                            if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
                                RetailerView.deleteProduct(parseInt(productId));
                            }
                        }
                    } else {
                        console.error("No valid product ID found for button:", button);
                        alert("Error: Could not identify product to modify");
                    }
                } else {
                    console.log("No button found in click target");
                }
            });
        }

        // Search functionality
        var searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                RetailerView.filterProducts(this.value);
            });
        }

        // Delete All Button
        var deleteAllBtn = document.querySelector('.delete-all');
        if (deleteAllBtn) {
            deleteAllBtn.onclick = function(e) {
                e.preventDefault();
                RetailerView.deleteAllProducts();
            };
        }
        
        console.log("Event listeners setup completed");
    },

    //loading state
    setLoading: function(isLoading) {
        var loadingIndicator = document.getElementById('loading-indicator');
        var productGrid = document.querySelector('.products-container');
        
        if (loadingIndicator) {
            loadingIndicator.style.display = isLoading ? 'block' : 'none';
        }
        if (productGrid) {
            productGrid.style.opacity = isLoading ? '0.5' : '1';
        }
    },

    //get products via api call
    getProducts: function() {
        console.log("Getting products for user:", RetailerView.userId);
        RetailerView.setLoading(true);
        
        //creating request
        var request = new XMLHttpRequest();
        request.open('POST', 'api.php', true);
        request.setRequestHeader('Content-Type', 'application/json');

        //when product data response has loaded
        request.onload = function() {
            console.log("Response status:", this.status);
            console.log("Response text:", this.responseText);
            
            if (this.readyState === 4) {
                if (this.status === 200) {
                    try {
                        //parsing response into a JSON object
                        var data = JSON.parse(this.responseText);
                        console.log("Product data as JSON object: ", data);

                        //checking that the request was successful
                        if (data.status === "success") {
                            RetailerView.products = data.data.products || data.data;
                            RetailerView.updateProducts(RetailerView.products);
                            RetailerView.updateStatistics();
                            console.log("Product data request Successful");
                        } else {
                            console.error("API Error:", data.data);
                            alert("Error loading products: " + data.data);
                        }
                    } catch (e) {
                        console.error("JSON Parse Error:", e);
                        console.error("Raw response:", this.responseText);
                        alert("Error parsing server response. Check console for details.");
                    }
                } else if (this.status === 404) {
                    console.error("API file not found (404)");
                    alert("API endpoint not found. Please check if api.php exists and is accessible.");
                } else {
                    console.error("HTTP Error:", this.status, this.statusText);
                    alert("Network error: " + this.status + " " + this.statusText);
                }
                RetailerView.setLoading(false);
            }
        };

        request.onerror = function() {
            console.error("Network error occurred");
            alert("Network error occurred. Please check your connection and server.");
            RetailerView.setLoading(false);
        };

        //creating request body
        var requestData = JSON.stringify({
            "type": 'GetRetailerProducts',
            "user_id": RetailerView.userId
        });

        console.log("Sending request:", requestData);
        request.send(requestData);
    },

    //delete product via api call
    deleteProduct: function(productId) {
        console.log("Delete product called with ID:", productId);
        
        //ensure productId is valid and numeric
        if (!productId || isNaN(productId) || productId <= 0) {
            console.error("Invalid product ID:", productId);
            alert("Error: Invalid product ID");
            return;
        }

        RetailerView.setLoading(true);
        
        //creating request
        var request = new XMLHttpRequest();
        request.open('POST', 'api.php', true);
        request.setRequestHeader('Content-Type', 'application/json');

        //when delete product response has loaded
        request.onload = function() {
            console.log("Delete response status:", this.status);
            console.log("Delete response text:", this.responseText);
            
            if (this.readyState === 4) {
                if (this.status === 200) {
                    try {
                        // Parsing response into a JSON object
                        var data = JSON.parse(this.responseText);
                        console.log("Delete product response as JSON object:", data);

                        // Checking that the request was successful
                        if (data.status === "success") {
                            console.log("Product deleted successfully:", data.data);
                            alert("Product deleted successfully!");
                            // Refresh the products list
                            RetailerView.getProducts();
                        } else {
                            console.error("Delete Product Error:", data.data);
                            alert("Error deleting product: " + data.data);
                        }
                    } catch (e) {
                        console.error("JSON Parse Error:", e);
                        console.error("Raw response:", this.responseText);
                        alert("Error parsing server response");
                    }
                } else {
                    console.error("Request Error:", this.status, this.statusText);
                    alert("Network error occurred while deleting product");
                }
                RetailerView.setLoading(false);
            }
        };

        request.onerror = function() {
            console.error("Network error occurred");
            alert("Network error occurred. Please check your connection and server.");
            RetailerView.setLoading(false);
        };

        // Creating request body with proper data types
        var requestData = JSON.stringify({
            "type": "DeleteProduct",
            "user_id": parseInt(RetailerView.userId),
            "product_id": parseInt(productId)
        });

        console.log("Sending delete product request:", requestData);
        request.send(requestData);
    },

    // Edit product function - FIXED
    editProduct: function(productId) {
        console.log("Edit product called with ID:", productId);
        RetailerView.openEditModal(productId);
    },

    addProduct: function(productData) {
        RetailerView.setLoading(true);
        
        var request = new XMLHttpRequest();
        request.open('POST', 'api.php', true);
        request.setRequestHeader('Content-Type', 'application/json');

        request.onload = function() {
            if (this.readyState === 4 && this.status === 200) {
                try {
                    var data = JSON.parse(this.responseText);
                    console.log("Add product response as JSON object: ", data);

                    if (data.status === "success") {
                        console.log("Product added successfully:", data.data);
                        RetailerView.getProducts();
                        RetailerView.closeAddModal();
                    } else {
                        console.error("Add Product Error:", data.data);
                        alert("Error adding product: " + data.data);
                        RetailerView.setLoading(false);
                    }
                } catch (e) {
                    console.error("JSON Parse Error:", e);
                    alert("Error parsing server response");
                    RetailerView.setLoading(false);
                }
            } else {
                console.error("Request Error:", this.statusText);
                alert("Network error occurred while adding product");
                RetailerView.setLoading(false);
            }
        };

        request.onerror = function() {
            console.error("Network error occurred");
            alert("Network error occurred. Please check your connection and server.");
            RetailerView.setLoading(false);
        };

        var requestData = JSON.stringify({
            "type": 'AddProduct',
            "user_id": RetailerView.userId,
            "product_name": productData.name,
            "description": productData.description,
            "brand": productData.brand,
            "price": productData.price,
            "category_id": productData.category_id,
            "specification": productData.specification,
            "image_url": productData.image_url,
            "in_stock": productData.in_stock
        });

        console.log("Sending add product request:", requestData);
        request.send(requestData);
    },

    updateProduct: function(productId, productData) {
        RetailerView.setLoading(true);
        
        var request = new XMLHttpRequest();
        request.open('POST', 'api.php', true);
        request.setRequestHeader('Content-Type', 'application/json');

        request.onload = function() {
            if (this.readyState === 4 && this.status === 200) {
                try {
                    var data = JSON.parse(this.responseText);
                    console.log("Update product response as JSON object: ", data);

                    if (data.status === "success") {
                        console.log("Product updated successfully:", data.data);
                        RetailerView.getProducts();
                        RetailerView.closeEditModal();
                    } else {
                        console.error("Update Product Error:", data.data);
                        alert("Error updating product: " + data.data);
                        RetailerView.setLoading(false);
                    }
                } catch (e) {
                    console.error("JSON Parse Error:", e);
                    alert("Error parsing server response");
                    RetailerView.setLoading(false);
                }
            } else {
                console.error("Request Error:", this.statusText);
                alert("Network error occurred while updating product");
                RetailerView.setLoading(false);
            }
        };

        request.onerror = function() {
            console.error("Network error occurred");
            alert("Network error occurred. Please check your connection and server.");
            RetailerView.setLoading(false);
        };

        var requestData = JSON.stringify({
            "type": 'UpdateProduct',
            "user_id": RetailerView.userId,
            "product_id": productId,
            "product_name": productData.name,
            "description": productData.description,
            "brand": productData.brand,
            "price": productData.price,
            "category_id": productData.category_id,
            "specification": productData.specification,
            "image_url": productData.image_url,
            "in_stock": productData.in_stock
        });

        console.log("Sending update product request:", requestData);
        request.send(requestData);
    },

    //delete all products
    deleteAllProducts: function() {
        if (!confirm('Are you sure you want to delete ALL your products? This action cannot be undone.')) {
            return;
        }
        
        if (!confirm('This will permanently delete ALL your products. Are you absolutely sure?')) {
            return;
        }

        RetailerView.setLoading(true);

        var request = new XMLHttpRequest();
        request.open('POST', 'api.php', true);
        request.setRequestHeader('Content-Type', 'application/json');

        request.onload = function() {
            if (this.readyState === 4 && this.status === 200) {
                try {
                    var data = JSON.parse(this.responseText);
                    console.log("Delete all products response:", data);

                    if (data.status === "success") {
                        console.log("All products deleted successfully:", data.data);
                        alert("All products deleted successfully!");
                        RetailerView.getProducts();
                    } else {
                        console.error("Delete All Products Error:", data.data);
                        alert("Error deleting products: " + data.data);
                    }
                } catch (e) {
                    console.error("JSON Parse Error:", e);
                    alert("Error parsing server response");
                }
            } else {
                console.error("Request Error:", this.status, this.statusText);
                alert("Network error occurred while deleting products");
            }

            RetailerView.setLoading(false);
        };

        request.onerror = function() {
            console.error("Network error occurred");
            alert("Network error occurred. Please check your connection and server.");
            RetailerView.setLoading(false);
        };

        var requestData = JSON.stringify({
            "type": 'DeleteAllProducts',
            "user_id": RetailerView.userId
        });

        console.log("Sending delete all request:", requestData);
        request.send(requestData);
    },

    searchFunction: function() {
        var searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', function(e) {
                RetailerView.handleSearch(e.target.value);
            });

            searchInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    RetailerView.handleSearch(e.target.value);
                }
            });
        }
    },

    //update products display
    updateProducts: function(products) {
        var productGrid = document.querySelector('.products-container');
        if (!productGrid) {
            console.error("Product grid element not found");
            return;
        }

        if (!products || products.length === 0) {
            productGrid.innerHTML = '<div class="no-products">No products found. <button onclick="RetailerView.openAddModal()">Add your first product</button></div>';
            return;
        }

        var html = '';
        for (var i = 0; i < products.length; i++) {
            html += RetailerView.createProductCard(products[i]);
        }

        productGrid.innerHTML = html;
        console.log("Products updated, total:", products.length);
    },

    //html for single product card - FIXED with better data attributes
    createProductCard: function(product) {
        var isInStock = product.in_stock === 1 || product.in_stock === '1' || product.in_stock === true;
        var stockStatus = isInStock ? 'In Stock' : 'Out of Stock';
        var stockClass = isInStock ? 'in-stock' : 'out-of-stock';
        
        // Use a more reliable placeholder or default image
        var imageUrl = product.images && product.images.trim() !== '' 
            ? product.images 
            : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik03NSA2MEMzNi41IDYwIDM2LjUgOTAgNzUgOTBTMTEzLjUgNjAgNzUgNjBaIiBmaWxsPSIjQ0NEMkQ4Ii8+CjxwYXRoIGQ9Ik02MCA4NUgzMFY5MEg2MFY4NVoiIGZpbGw9IiNDQ0QyRDgiLz4KPHA+Tm8gSW1hZ2U8L3A+Cjwvc3ZnPgo=';

        return '<div class="product-card" data-product-id="' + product.id + '">' +
                '<img class="product-image" src="' + imageUrl + '" alt="' + product.name + '" onerror="this.onerror=null; this.src=\'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik03NSA2MEMzNi41IDYwIDM2LjUgOTAgNzUgOTBTMTEzLjUgNjAgNzUgNjBaIiBmaWxsPSIjQ0NEMkQ4Ii8+CjxwYXRoIGQ9Ik02MCA4NUgzMFY5MEg2MFY4NVoiIGZpbGw9IiNDQ0QyRDgiLz4KPHA+Tm8gSW1hZ2U8L3A+Cjwvc3ZnPgo=\'">' +
                '<div class="product-details">' +
                    '<div class="product-status ' + stockClass + '">' +
                        '<div class="status-dot"></div>' +
                        stockStatus +
                    '</div>' +
                    '<h3 class="product-name">' + product.name + '</h3>' +
                    '<div class="product-price">R' + parseFloat(product.price).toFixed(2) + '</div>' +
                    '<div class="product-meta">Updated: ' + RetailerView.formatDate(product.updated_at) + '</div>' +
                    '<div class="product-actions">' +
                        '<button class="action-button edit-button" data-product-id="' + product.id + '" type="button">' +
                            '<i class="fas fa-edit"></i> Edit' +
                        '</button>' +
                        '<button class="action-button delete-button" data-product-id="' + product.id + '" type="button">' +
                            '<i class="fas fa-trash"></i> Delete' +
                        '</button>' +
                    '</div>' +
                '</div>' +
            '</div>';
    },

    //format date to be displayed
    formatDate: function(dateString) {
        if (!dateString) {
            return 'Never';
        }
        var date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    },

    //update retailer stats with average price calculation
    updateStatistics: function() {
        var totalProducts = RetailerView.products.length;
        var totalPrice = 0;
        var averagePrice = 0;
        
        if (totalProducts > 0) {
            for (var i = 0; i < RetailerView.products.length; i++) {
                totalPrice += parseFloat(RetailerView.products[i].price || 0);
            }
            averagePrice = totalPrice / totalProducts;
        }
        
        var totalElement = document.getElementById('total-products');
        if (totalElement) {
            totalElement.textContent = totalProducts;
        }
        
        var avgPriceElements = document.querySelectorAll('.stat-value');
        if (avgPriceElements.length > 1) {
            avgPriceElements[1].textContent = 'R' + averagePrice.toFixed(2);
        }
    },

    //modal functions
    openAddModal: function() {
        var modal = document.getElementById('addProductModal');
        if (modal) {
            RetailerView.clearAddForm();
            modal.style.display = 'flex';
        }
    },

    closeAddModal: function() {
        var modal = document.getElementById('addProductModal');
        if (modal) {
            modal.style.display = 'none';
            RetailerView.clearAddForm();
        }
    },

    openEditModal: function(productId) {
        var product = null;
        for (var i = 0; i < RetailerView.products.length; i++) {
            if (parseInt(RetailerView.products[i].id) === parseInt(productId)) {
                product = RetailerView.products[i];
                break;
            }
        }

        if (!product) {
            console.error('Product not found', productId);
            alert('Product not found');
            return;
        }

        var modal = document.getElementById('editProductModal');
        if (modal) {
            RetailerView.populateEditForm(product);
            modal.style.display = 'flex';
        }
    },

    closeEditModal: function() {
        var modal = document.getElementById('editProductModal');
        if (modal) {
            modal.style.display = 'none';
            RetailerView.clearEditForm();
        }
    },

    closeAllModals: function() {
        RetailerView.closeAddModal();
        RetailerView.closeEditModal();
    },

    //form functions
    clearAddForm: function() {
        var form = document.getElementById('addProductForm');
        if (form) {
            form.reset();
        }
    },

    clearEditForm: function() {
        var form = document.getElementById('editProductForm');
        if (form) {
            form.reset();
        }
    },

    populateEditForm: function(product) {
        var form = document.getElementById('editProductForm');
        if (form) {
            form.setAttribute('data-product-id', product.id);
        }

        var fields = {
            'edit_product_name': product.name,
            'edit_description': product.description,
            'edit_brand': product.brand,                
            'edit_price': product.price,                
            'edit_category': product.category_id,       
            'edit_specification': product.specification,
            'edit_image_url': product.images,
            'edit_stock': product.in_stock 
        };

        for (var fieldId in fields) {
            if (fields.hasOwnProperty(fieldId)) {
                var field = document.getElementById(fieldId);
                if (field) {
                    if (field.type === 'checkbox') {
                        field.checked = fields[fieldId];
                    } else {
                        field.value = fields[fieldId] || '';
                    }
                }
            }
        }

        var imagePreview = document.getElementById('current_image_preview');
        if (imagePreview && product.images) {
            imagePreview.src = product.images;
            imagePreview.style.display = 'block';
            imagePreview.onerror = function() {
                this.src = 'https://via.placeholder.com/100?text=No+Image';
            };
        } else if (imagePreview) {
            imagePreview.style.display = 'none';
        }
    },

    //product handler functions
    handleAddProduct: function() {
        var form = document.getElementById('addProductForm');
        if (!form) {
            return;
        }

        var formData = new FormData(form);
        var productData = {
            'name': formData.get('product_name'),
            'description': formData.get('description'),
            'brand': formData.get('brand'),
            'price': formData.get('price'),
            'category_id': formData.get('category') || 1,
            'specification': formData.get('specification') || '',
            'image_url': formData.get('image_url') || '',
            'in_stock': 1
        };

        if (!productData.name || !productData.description || !productData.price) {
            alert('Please fill in all required fields');
            return;
        }

        if (isNaN(productData.price) || productData.price <= 0) {
            alert('Please enter a valid price');
            return;
        }

        RetailerView.addProduct(productData);
    },

    handleEditProduct: function() {
        var form = document.getElementById('editProductForm');
        if (!form) {
            return;
        }

        var productId = parseInt(form.getAttribute('data-product-id'));
        if (isNaN(productId)) {
            console.error("No product ID found for editing");
            return;
        }

        var formData = new FormData(form);
        var productData = {
            'name': formData.get('product_name'),
            'description': formData.get('description'),
            'brand': formData.get('brand'),
            'price': parseFloat(formData.get('price')),
            'category_id': parseInt(formData.get('category')) || 1,
            'specification': formData.get('specification') || '',
            'image_url': formData.get('image_url') || '',
            'in_stock': formData.get('product_stock') ? 1 : 0
        };

        if (!productData.name || !productData.description || !productData.price) {
            alert('Please fill in all required fields');
            return;
        }

        if (isNaN(productData.price) || productData.price <= 0) {
            alert('Please enter a valid price');
            return;
        }

        RetailerView.updateProduct(productId, productData);
    },

    handleSearch: function(searchText) {
        var filteredProducts = RetailerView.filterProducts(searchText);
        RetailerView.updateProducts(filteredProducts);
    },

    filterProducts: function(searchText) {
        if (!searchText || searchText.trim() === '') {
            return RetailerView.products;
        }
        
        var term = searchText.toLowerCase().trim();
        
        return RetailerView.products.filter(function(product) {
            var searchableText = [
                product.name || '',
                product.description || '',
                product.brand || '',
                product.price ? product.price.toString() : ''
            ].join(' ').toLowerCase();
            
            return searchableText.includes(term);
        });
    },

    clearSearch: function() {
        var searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.value = '';
            RetailerView.handleSearch('');
        }
    },

    selectAllProducts: function() {
        console.log("Select all functionality not implemented yet");
    }
};

//initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded, initializing RetailerView...");
    
    //delay ensures all resources are loaded
    setTimeout(function() {
        try {
            RetailerView.init();
        } catch (error) {
            console.error("Error initializing RetailerView:", error);
            alert("Error initializing the application. Please refresh the page.");
        }
    }, 200);
});