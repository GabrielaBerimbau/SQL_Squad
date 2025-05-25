// highest-reviews.js - Top Rated Products Page
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const productContainer = document.getElementById('product-container');
    const searchBar = document.querySelector('.search-bar');
    const categorySelect = document.getElementById('category-select');
    const brandSelect = document.getElementById('brand-select');
    const ratingFilter = document.getElementById('rating-filter');
    const sortSelect = document.getElementById('sort-select');
    const loadingAnimation = document.getElementById('loading-animation');
    const successAlert = document.getElementById('success-alert');
    
    // Current filter values
    let filters = {
        category_id: 'default',
        brand: 'default',
        min_rating: 0,
        sort: 'rating-high',
        search: ''
    };
    
    // Wishlist items cache
    let wishlistItems = {};
    
    // Initialize page
    loadTopRatedProducts();
    
    // Check if user is logged in
    const isLoggedIn = !!localStorage.getItem('user_id');
    if (isLoggedIn) {
        fetchUserWishlist();
    }
    
    // Setup event listeners
    searchBar.addEventListener('input', debounce(function() {
        filters.search = this.value.trim();
        loadTopRatedProducts();
    }, 500));
    
    categorySelect.addEventListener('change', function() {
        filters.category_id = this.value;
        loadTopRatedProducts();
    });
    
    brandSelect.addEventListener('change', function() {
        filters.brand = this.value;
        loadTopRatedProducts();
    });
    
    ratingFilter.addEventListener('change', function() {
        filters.min_rating = parseFloat(this.value) || 0;
        loadTopRatedProducts();
    });
    
    sortSelect.addEventListener('change', function() {
        filters.sort = this.value;
        loadTopRatedProducts();
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
                button.textContent = 'In Wishlist';
            } else {
                button.classList.remove('in-wishlist');
                button.textContent = 'Add to Wishlist';
            }
        });
    }
    
    // Handle adding/removing from wishlist
    function handleWishlistAction(productId, button) {
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
            button.textContent = 'In Wishlist';
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
                const message = action === 'add' 
                    ? 'Product added to wishlist' 
                    : 'Product removed from wishlist';
                showAlert(message, 'success');
            } else {
                // Revert UI on error
                if (isInWishlist) {
                    button.classList.add('in-wishlist');
                    button.textContent = 'In Wishlist';
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
                button.textContent = 'In Wishlist';
                wishlistItems[productId] = true;
            } else {
                button.classList.remove('in-wishlist');
                button.textContent = 'Add to Wishlist';
                delete wishlistItems[productId];
            }
            
            showAlert('An error occurred. Please try again.', 'error');
        });
    }
    
    // Load top rated products from API
    function loadTopRatedProducts() {
        // Show loading animation
        loadingAnimation.style.display = 'block';
        productContainer.innerHTML = '';
        
        // Prepare data for API request
        const requestData = {
            type: 'GetTopRatedProducts',
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
            productContainer.innerHTML = '<p class="no-products">No top-rated products found matching your criteria.</p>';
            return;
        }
        
        // Clear previous products
        productContainer.innerHTML = '';
        
        // Create product cards
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            
            // Generate star rating display
            const stars = generateStarRating(product.avg_rating);
            const ratingDisplay = `${parseFloat(product.avg_rating).toFixed(1)} / 5.0`;
            
            // Check if product is in stock
            const stockStatus = product.in_stock == 1 ? 
                '<span class="in-stock">In Stock</span>' : 
                '<span class="out-of-stock">Out of Stock</span>';
            
            // Format price
            const priceDisplay = product.price ? 
                `<div class="product-price">From R${product.price.toFixed(2)}</div>` : 
                '<div class="product-price">Price not available</div>';
            
            // Determine wishlist status
            const isInWishlist = wishlistItems[product.product_id] || false;
            const wishlistBtnClass = isInWishlist ? 'wishlist-btn in-wishlist' : 'wishlist-btn';
            const wishlistBtnText = isInWishlist ? 'In Wishlist' : 'Add to Wishlist';
            
            productCard.innerHTML = `
                <img src="${product.primary_image}" alt="${product.name}" class="product-image">
                <div class="product-name">${product.name}</div>
                <div class="product-rating">
                    <span class="rating-stars">${stars}</span>
                    <div class="rating-text">${ratingDisplay} (${product.review_count} reviews)</div>
                </div>
                ${priceDisplay}
                <div class="product-stock">${stockStatus}</div>
                <div class="product-description">${product.description ? product.description.substring(0, 100) + '...' : 'No description available'}</div>
                <div class="product-actions">
                    <button class="${wishlistBtnClass}" data-id="${product.product_id}">
                        ${wishlistBtnText}
                    </button>
                    <button class="view-details-btn" onclick="window.location.href='view.php?id=${product.product_id}'">View Details</button>
                </div>
            `;
            
            productContainer.appendChild(productCard);
        });
    }
    
    // Generate star rating display
    function generateStarRating(rating) {
        let stars = '';
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        
        // Add full stars
        for (let i = 0; i < fullStars; i++) {
            stars += '★';
        }
        
        // Add half star if needed
        if (hasHalfStar) {
            stars += '☆';
        }
        
        // Add empty stars to make 5 total
        const remainingStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        for (let i = 0; i < remainingStars; i++) {
            stars += '☆';
        }
        
        return stars;
    }
    
    // Populate filter dropdowns with data from API
    function populateFilterDropdowns(categories, brands) {
        // Only populate if this is the first load
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