//global variables

var RetailerView = {
    userId: null,
    products: [],
    
    //initialize retailerView
    init: function() {
        console.log("Initializing RetailerView");
        
        //get stored id of user logged in
        var storedUserId = null;

         if (typeof(Storage) !== "undefined") {
            // check localStorage
            if (localStorage.getItem('user_id')) {
                storedUserId = localStorage.getItem('user_id');
            }
            //check sessionStorage
            else if (sessionStorage.getItem('user_id')) {
                storedUserId = sessionStorage.getItem('user_id');
            }
            
            if (storedUserId) { //user is logged in
                RetailerView.userId = parseInt(storedUserId, 10);
                console.log("Found user ID:", RetailerView.userId);
            } else {
                console.error("No user logged in");
                alert("Please log in first");
                window.location.href = '/login.php';
                return;
            }
        } else {
            console.error("Browser does not support web storage");
            alert("Your browser does not support web storage"); ////////////////////////////////////////////
            return;
        }
        
        RetailerView.setupEventListeners();
        RetailerView.getProducts();
    },

    //setting up all event listeners for the page
    setupEventListeners: function() {
        //add product button
        var addProductButton = document.querySelector('.add-button');
        if (addProductButton) {
            addProductButton.addEventListener('click', function() {
                RetailerView.openAddModal();
            });
        }

        //add product form submission
        var addProductForm = document.getElementById('addProductForm');
        if (addProductForm) {
            addProductForm.addEventListener('submit', function(e) {
                e.preventDefault();
                RetailerView.handleAddProduct();
            });
        }

        //edit product form submission
        var editProductForm = document.getElementById('editProductForm');
        if (editProductForm) {
            editProductForm.addEventListener('submit', function(e) {
                e.preventDefault();
                RetailerView.handleEditProduct();
            });
        }

        //modal close buttons
        var closeButtons = document.querySelectorAll('.close'); /////////////////////////////////////////CHECK
        for (var i = 0; i < closeButtons.length; i++) {
            closeButtons[i].addEventListener('click', function() {
                RetailerView.closeAllModals();
            });
        }

        //click outside modal to close
        window.addEventListener('click', function(e) {
            if (e.target.classList.contains('modal')) {
                RetailerView.closeAllModals();
            }
        });

        //for edit and delete buttons on products - have to do it like this for when products are dynamically added
        document.addEventListener('click', function(e) {
            if (e.target && e.target.classList.contains('edit-button') || 
                (e.target.parentElement && e.target.parentElement.classList.contains('edit-button'))) {
            var productCard = RetailerView.findParentWithClass(e.target, 'product-card');
                if (productCard) {
                    var productId = parseInt(productCard.getAttribute('data-product-id'), 10);
                    if (!isNaN(productId)) {
                    RetailerView.openEditModal(productId);
                    }
                }
            }
            
            if (e.target && e.target.classList.contains('delete-button') || 
                (e.target.parentElement && e.target.parentElement.classList.contains('delete-button'))) {
            var productCard = RetailerView.findParentWithClass(e.target, 'product-card');
                if (productCard) {
                    var productId = parseInt(productCard.getAttribute('data-product-id'), 10);
                    if (!isNaN(productId)) {
                    RetailerView.confirmDelete(productId);
                    }
                }
            }
        });

        //search input
        var searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('keyup', RetailerView.handleSearch);
        }


        //select all button
        var selectAllButton = document.querySelector('.select-all');
        if (selectAllButton) {
            selectAllButton.addEventListener('click', RetailerView.selectAllProducts);
        }
    },


    //finding parent element with specific class
    findParentWithClass: function(element, className) {
        while (element && !element.classList.contains(className)) {
            element = element.parentElement;
        }
        return element;
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

        RetailerView.setLoading(true); ///////////////////////CHECK
        //creating request
        var request = new XMLHttpRequest();
        request.open('POST', '/api.php', true);
        request.setRequestHeader('Content-Type', 'application/json');

        //when product data response has loaded
        request.onload = function() {
            if (this.readyState === 4 && this.status === 200) {
                //parsing response into a JSON object
                var data = JSON.parse(this.responseText);
                console.log("Product data as JSON object: ", data);

                //checking that the request was successful
                if (data.status === "success") {
                    RetailerView.products = data.data.products || data.data; //populating products array
                    RetailerView.updateProducts(RetailerView.products);
                    RetailerView.updateStatistics();
                    console.log("Product data request Successful");
                    RetailerView.setLoading(false);
                }
                else {
                    console.error("Return Error:", data.data);
                    alert("Error loading products: " + data.data);
                    RetailerView.setLoading(false); ////////////////////////CHECK
                }
            }
            else {
                console.error("Request Error:", this.statusText);
                alert("Network error occurred while loading products");
                RetailerView.setLoading(false); ////////////////////////CHECK
            }
        };

        //creating request body
        var requestData = JSON.stringify({
            "type": 'GetRetailerProducts',
            "user_id": RetailerView.userId
        });

        request.send(requestData);
    },



    //add product via api call
    addProduct: function(productData) {
        RetailerView.setLoading(true); /////////////////////CHECK
        //creating request
        var request = new XMLHttpRequest();
        request.open('POST', '/api.php', true);
        request.setRequestHeader('Content-Type', 'application/json');

        //when add product response has loaded
        request.onload = function() {
            if (this.readyState === 4 && this.status === 200) {
                //parsing response into a JSON object
                var data = JSON.parse(this.responseText);
                console.log("Add product response as JSON object: ", data);

                //checking that the request was successful
                if (data.status === "success") {
                    console.log("Product added successfully:", data.data);
                    //refresh the products list
                    RetailerView.getProducts();
                    //close modal
                    RetailerView.closeAddModal();
                }
                else {
                    console.error("Add Product Error:", data.data);
                    alert("Error adding product: " + data.data);
                    RetailerView.setLoading(false);
                }
            }
            else {
                console.error("Request Error:", this.statusText);
                alert("Network error occurred while adding product");
                RetailerView.setLoading(false);
            }
        };

        //creating request body
        var requestData = JSON.stringify({
            "type": 'AddProduct',
            "user_id": RetailerView.userId,
            "product_name": productData.name,
            "description": productData.description,
            "brand": productData.brand,
            "price": productData.price,
            "category_id": productData.category_id,
            "specification": productData.specification,
            "in_stock": productData.in_stock
        });

        //sending the request
        request.send(requestData);
    },



    //updating product via api call
    updateProduct: function(productId, productData) {
        RetailerView.setLoading(true); ////////////////////CHECK
        //creating request
        var request = new XMLHttpRequest();
        request.open('POST', '/api.php', true);
        request.setRequestHeader('Content-Type', 'application/json');

        //when update product response has loaded
        request.onload = function() {
            if (this.readyState === 4 && this.status === 200) {
                //parsing response into a JSON object
                var data = JSON.parse(this.responseText);
                console.log("Update product response as JSON object: ", data);

                //checking that the request was successful
                if (data.status === "success") {
                    console.log("Product updated successfully:", data.data);
                    // Refresh the products list
                    RetailerView.getProducts();
                    // Close modal
                    RetailerView.closeEditModal();
                }
                else {
                    console.error("Update Product Error:", data.data);
                    alert("Error updating product: " + data.data);
                    RetailerView.setLoading(false); ////////////////////CHECK
                }
            }
            else {
                console.error("Request Error:", this.statusText);
                alert("Network error occurred while updating product");
                RetailerView.setLoading(false); ////////////////////CHECK
            }
        };

        //creating request body
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
            "in_stock": productData.in_stock
        });

        //sending the request
        request.send(requestData);
    },



    //delete product via api call
    deleteProduct: function(productId) {
        RetailerView.setLoading(true); ///////////////////////CHECK
        //creating request
        var request = new XMLHttpRequest();
        request.open('POST', '/api.php', true);
        request.setRequestHeader('Content-Type', 'application/json');

        //when delete product response has loaded
        request.onload = function() {
            if (this.readyState === 4 && this.status === 200) {
                //parsing response into a JSON object
                var data = JSON.parse(this.responseText);
                console.log("Delete product response as JSON object: ", data);

                //checking that the request was successful
                if (data.status === "success") {
                    console.log("Product deleted successfully:", data.data);
                    //refresh the products list
                    RetailerView.getProducts();
                }
                else {
                    console.error("Delete Product Error:", data.data);
                    alert("Error deleting product: " + data.data);
                    RetailerView.setLoading(false); ///////////////////////CHECK
                }
            }
            else {
                console.error("Request Error:", this.statusText);
                alert("Network error occurred while deleting product");
                RetailerView.setLoading(false); ///////////////////////CHECK
            }
        };

        //creating request body
        var requestData = JSON.stringify({
            "type": 'DeleteProduct',
            "user_id": RetailerView.userId,
            "product_id": productId
        });

        //sending the request
        request.send(requestData);
    },

    // Confirm delete with user prompt
    confirmDelete: function(productId) {
        if (confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
            RetailerView.deleteProduct(productId);
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

        //clearing existing products
        var html = '';
        for (var i = 0; i < products.length; i++) {
            html += RetailerView.createProductCard(products[i]);
        }

        productGrid.innerHTML = html;
    },

    //html for single product card
     createProductCard: function(product) {
        var stockStatus = product.in_stock ? 'In Stock' : 'Out of Stock';
        var stockClass = product.in_stock ? 'in-stock' : 'out-of-stock';
        
        return '<div class="product-card" data-product-id="' + product.id + '">' +
                '<div class="product-header">' +
                    '<h3>' + product.name + '</h3>' +
                    '<div class="product-actions">' +
                        '<button class="edit-button" title="Edit Product">' +
                            '<i class="fas fa-edit"></i>' +
                        '</button>' +
                        '<button class="delete-button" title="Delete Product">' +
                            '<i class="fas fa-trash"></i>' +
                        '</button>' +
                    '</div>' +
                '</div>' +
                '<div class="product-details">' +
                    '<p class="product-description">' + (product.description || 'No description') + '</p>' +
                    '<div class="product-info">' +
                        '<span class="product-brand">' + (product.brand || 'No brand') + '</span>' +
                        '<span class="product-price">R' + parseFloat(product.price).toFixed(2) + '</span>' +
                    '</div>' +
                    '<div class="product-specs">' +
                        '<span class="product-specification">' + (product.specification || 'No specifications') + '</span>' +
                    '</div>' +
                    '<div class="product-status">' +
                        '<span class="stock-status ' + stockClass + '">' + stockStatus + '</span>' +
                        '<span class="last-updated">Updated: ' + RetailerView.formatDate(product.updated_at) + '</span>' +
                    '</div>' +
                '</div>' +
            '</div>';
    },

    //format date to be displayed
    formatDate: function(dateString) { /////////////////////////////////CHECK
        if (!dateString) {
            return 'Never';
        }
        var date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    },


    //update retailer stats
    updateStatistics: function() {
        var totalProducts = RetailerView.products.length; ////////////////////////CHECK - should it count all or only avaliable products?
        // var inStockProducts = 0;
        
        // for (var i = 0; i < RetailerView.products.length; i++) {
        //     if (RetailerView.products[i].in_stock) {
        //         inStockProducts++;
        //     }
        // }
        
        var totalElement = document.getElementById('total-products');
        if (totalElement) {
            totalElement.textContent = totalProducts;
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
        //finding product to edit
        for (var i = 0; i < RetailerView.products.length; i++) {
            if (RetailerView.products[i].id === productId) {
                product = RetailerView.products[i];
                break;
            }
        }

        if (!product) { //if product not found
            console.error('Product not found', productId);
            return
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

    //clearing form for adding a new product
    clearAddForm: function() {
        var form = document.getElementById('addProductForm');
        if (form) {
            form.reset();
        }
    },

    //clear form for editing a product
    clearEditForm: function() {
        var form = document.getElementById('editProductForm');
        if (form) {
            form.reset();
        }
    },


    //populating form with existing values in order to update product
    populateEditForm: function(product) {
        var form = document.getElementById('editProductForm');
        if (form) {
            form.setAttribute('data-product-id', product.id);
        }

        //populate form fields with product data
        var fields = {
            'edit_product_name': product.name,
            'edit_description': product.description,
            'edit_brand': product.brand,                
            'edit_price': product.price,                
            'edit_category': product.category_id,       
            'edit_specification': product.specification, 
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
        
    },


    //product handler functions

    //add product
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
            'in_stock': 1
        };

        //form validation
        if (!productData.name || !productData.description || !productData.price) {
            alert('Please fill in all fields');
            return;
        }

        if (isNaN(productData.price) || productData.price <= 0) {
            alert('Please enter a valid price');
            return;
        }

        RetailerView.addProduct(productData);
    },


    //edit product
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
            'in_stock': 1
        };

        //form validation
        if (!productData.name || !productData.description || !productData.price) {
            alert('Please fill in all fields');
            return;
        }

        if (isNaN(productData.price) || productData.price <= 0) {
            alert('Please enter a valid price');
            return;
        }

        RetailerView.updateProduct(productId, productData);
    },

    handleSearch: function() {
        console.log("Search functionality not implemented yet");
    },

    selectAllProducts: function() {
        console.log("Select all functionality not implemented yet");
    },

};

//initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    RetailerView.init();
});
