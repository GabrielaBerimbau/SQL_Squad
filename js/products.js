// products.js
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const productContainer = document.getElementById('product-container');
    const searchBar = document.querySelector('.search-bar');
    const categorySelect = document.getElementById('category-select');
    const brandSelect = document.getElementById('brand-select');
    const sortSelect = document.getElementById('sort-select');
    const loadingAnimation = document.getElementById('loading-animation');
    const successAlert = document.getElementById('success-alert');
    
    // Current filter values
    let filters = {
        category_id: 'default',
        brand: 'default',
        sort: 'default',
        search: ''
    };
    
    // Wishlist items cache to track which products are in the wishlist
    let wishlistItems = {};
    
    // Initialize product display
    loadProducts();
    
    // Check if user is logged in
    const isLoggedIn = !!localStorage.getItem('user_id');
    if (isLoggedIn) {
        // If logged in, get user's wishlist items for the UI
        fetchUserWishlist();
    }
    
    // Setup event listeners
    searchBar.addEventListener('input', debounce(function() {
        filters.search = this.value.trim();
        loadProducts();
    }, 500));
    
    categorySelect.addEventListener('change', function() {
        filters.category_id = this.value;
        loadProducts();
    });
    
    brandSelect.addEventListener('change', function() {
        filters.brand = this.value;
        loadProducts();
    });
    
    sortSelect.addEventListener('change', function() {
        filters.sort = this.value;
        loadProducts();
    });
    
    // Add event listener for wishlist buttons
    document.addEventListener('click', function(e) {
        if (e.target && e.target.classList.contains('wishlist-btn')) {
            const productId = e.target.getAttribute('data-id');
            handleWishlistAction(productId, e.target);
        }
    });
    
    // Fetch user's wishlist to know which products are already in wishlist
    function fetchUserWishlist() {
        // Only fetch if logged in
        if (!localStorage.getItem('user_id')) return;
        
        const requestData = {
            type: 'GetWishlistItems'
        };
        
        fetch('api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success' && data.data.products) {
                // Update wishlist cache
                data.data.products.forEach(product => {
                    wishlistItems[product.product_id] = true;
                });
                
                // Update UI for all wishlist buttons
                updateWishlistButtonsUI();
            }
        })
        .catch(error => {
            console.error('Error fetching wishlist:', error);
        });
    }
    
    // Update all wishlist buttons based on cached data
    function updateWishlistButtonsUI() {
        document.querySelectorAll('.wishlist-btn').forEach(button => {
            const productId = button.getAttribute('data-id');
            if (wishlistItems[productId]) {
                button.classList.add('in-wishlist');
                button.textContent = 'Remove from Wishlist';
            } else {
                button.classList.remove('in-wishlist');
                button.textContent = 'Add to Wishlist';
            }
        });
    }
    
    // Handle adding/removing from wishlist
    function handleWishlistAction(productId, button) {
        // Check if user is logged in
        
        if (!localStorage.getItem('user_id')) {
            showAlert('Please log in to add items to your wishlist', 'error');
            setTimeout(() => {
                window.location.href = 'login.php';
            }, 1500);
            return;
        }
        
        // Determine action based on whether product is in wishlist
        const isInWishlist = wishlistItems[productId];
        const action = isInWishlist ? 'remove' : 'add';
        
        // Update UI immediately for better user experience
        if (isInWishlist) {
            button.classList.remove('in-wishlist');
            button.textContent = 'Add to Wishlist';
            delete wishlistItems[productId];
        } else {
            button.classList.add('in-wishlist');
            button.textContent = 'Remove from Wishlist';
            wishlistItems[productId] = true;
        }
        
        const requestData = {
            type: 'Wishlist',
            action: action,
            product_id: productId,
            user_id: localStorage.getItem('user_id')
        };
        
        fetch('api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                // Show success message
                const message = action === 'add' 
                    ? 'Product added to wishlist' 
                    : 'Product removed from wishlist';
                showAlert(message, 'success');
            } else {
                // Revert UI on error
                if (isInWishlist) {
                    button.classList.add('in-wishlist');
                    button.textContent = 'Remove from Wishlist';
                    wishlistItems[productId] = true;
                } else {
                    button.classList.remove('in-wishlist');
                    button.textContent = 'Add to Wishlist';
                    delete wishlistItems[productId];
                }
                
                showAlert('Failed to update wishlist: ' + data.data, 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            
            // Revert UI on error
            if (isInWishlist) {
                button.classList.add('in-wishlist');
                button.textContent = 'Remove from Wishlist';
                wishlistItems[productId] = true;
            } else {
                button.classList.remove('in-wishlist');
                button.textContent = 'Add to Wishlist';
                delete wishlistItems[productId];
            }
            
            showAlert('An error occurred. Please try again.', 'error');
        });
    }
    
    // Load products from API
    function loadProducts() {
        // Show loading animation
        loadingAnimation.style.display = 'block';
        productContainer.innerHTML = '';
        
        // Prepare data for API request
        const requestData = {
            type: 'GetAllProducts',
            ...filters
        };
        
        // Fetch products from API
        fetch('api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        })
        .then(response => response.json())
        .then(data => {
            // Hide loading animation
            loadingAnimation.style.display = 'none';
            
            if (data.status === 'success') {
                displayProducts(data.data.products);
                populateFilterDropdowns(data.data.categories, data.data.brands);
                
                // Update wishlist buttons after products are displayed
                if (localStorage.getItem('user_id')) {
                    updateWishlistButtonsUI();
                }
            } else {
                productContainer.innerHTML = `<p class="error-message">Error loading products: ${data.data}</p>`;
            }
        })
        .catch(error => {
            loadingAnimation.style.display = 'none';
            console.error('Error:', error);
            productContainer.innerHTML = '<p class="error-message">Failed to load products. Please try again later.</p>';
        });
    }
    
    // Display products in the container
    function displayProducts(products) {
        if (products.length === 0) {
            productContainer.innerHTML = '<p class="no-products">No products found matching your criteria.</p>';
            return;
        }
        
        // Clear previous products
        productContainer.innerHTML = '';
        
        // Create product cards
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            
            // Format the rating with review count
            const ratingDisplay = product.avg_rating > 0 ? 
                `${parseFloat(product.avg_rating).toFixed(1)} / 5.0 (${product.review_count} reviews)` : 
                'Not Rated Yet';
            
            // Check if product is in stock
            const stockStatus = product.in_stock == 1 ? 
                '<span class="in-stock">In Stock</span>' : 
                '<span class="out-of-stock">Out of Stock</span>';
            
            // Determine wishlist status based on our cached data
            const isInWishlist = wishlistItems[product.product_id] || false;
            const wishlistBtnClass = isInWishlist ? 'wishlist-btn in-wishlist' : 'wishlist-btn';
            const wishlistBtnText = isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist';
            
            productCard.innerHTML = `
                <img src="${product.primary_image}" alt="${product.name}" class="product-image">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-rating">★ ${ratingDisplay}</p>
                <p class="product-stock">${stockStatus}</p>
                <p class="product-description">${product.description ? product.description.substring(0, 100) + '...' : 'No description available'}</p>
                <button class="${wishlistBtnClass}" data-id="${product.product_id}">
                    ${wishlistBtnText}
                </button>
                <button class="view-details-btn" onclick="window.location.href='product-details.php?id=${product.product_id}'">View Details</button>
            `;
            
            productContainer.appendChild(productCard);
        });
    }
    
    // Populate filter dropdowns with data from API
    function populateFilterDropdowns(categories, brands) {
        // Only populate if this is the first load (to avoid resetting user selections)
        if (categorySelect.options.length <= 1) {
            // Populate categories
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.category_id;
                option.textContent = category.name;
                categorySelect.appendChild(option);
            });
        }
        
        if (brandSelect.options.length <= 1) {
            // Populate brands
            brands.forEach(brand => {
                const option = document.createElement('option');
                option.value = brand;
                option.textContent = brand;
                brandSelect.appendChild(option);
            });
        }
    }
    
    // Show alert message
    function showAlert(message, type) {
        successAlert.textContent = message;
        successAlert.className = 'success-alert ' + type;
        successAlert.style.display = 'block';
        
        setTimeout(() => {
            successAlert.style.display = 'none';
        }, 3000);
    }
    
    // Debounce function for search input
    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func.apply(context, args);
            }, wait);
        };
    }
});