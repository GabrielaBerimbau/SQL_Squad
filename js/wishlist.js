// wishlist.js - For displaying and managing wishlist items
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const productContainer = document.getElementById('product-container');
    const loadingAnimation = document.getElementById('loading-animation');
    
    // Check if user is logged in
    const userId = localStorage.getItem('user_id');
    if (!userId) {
        // If not logged in, show message and redirect after delay
        productContainer.innerHTML = `
            <div class="auth-message">
                <p>You need to log in to view your wishlist.</p>
                <button onclick="window.location.href='login.php'">Log In</button>
            </div>
        `;
        loadingAnimation.style.display = 'none';
        return;
    }
    
    // If logged in, load wishlist items
    loadWishlistItems();
    
    function loadWishlistItems() {
        // Show loading animation
        loadingAnimation.style.display = 'block';
        productContainer.innerHTML = '';
        
        // Prepare request to get wishlist items
        const requestData = {
            type: 'GetWishlistItems'
        };
        
        // Fetch wishlist items from API
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
                displayWishlistItems(data.data.products);
            } else {
                productContainer.innerHTML = `<p class="error-message">Error loading wishlist: ${data.data}</p>`;
            }
        })
        .catch(error => {
            loadingAnimation.style.display = 'none';
            console.error('Error:', error);
            productContainer.innerHTML = '<p class="error-message">Failed to load wishlist. Please try again later.</p>';
        });
    }
    
    function displayWishlistItems(products) {
        if (products.length === 0) {
            productContainer.innerHTML = `
                <div class="empty-wishlist">
                    <p>Your wishlist is empty.</p>
                    <button onclick="window.location.href='products.php'">Explore Products</button>
                </div>
            `;
            return;
        }
        
        // Create wishlist item container
        const wishlistContainer = document.createElement('div');
        wishlistContainer.className = 'wishlist-items';
        
        // Add wishlist items
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'wishlist-item';
            
            // Format the rating with review count
            const ratingDisplay = product.avg_rating > 0 ? 
                `${parseFloat(product.avg_rating).toFixed(1)} / 5.0 (${product.review_count} reviews)` : 
                'Not Rated Yet';
            
            // Check if product is in stock
            const stockStatus = product.in_stock == 1 ? 
                '<span class="in-stock">In Stock</span>' : 
                '<span class="out-of-stock">Out of Stock</span>';
            
            productCard.innerHTML = `
                <div class="wishlist-item-image">
                    <img src="${product.primary_image}" alt="${product.name}">
                </div>
                <div class="wishlist-item-details">
                    <h3>${product.name}</h3>
                    <p class="item-rating">★ ${ratingDisplay}</p>
                    <p class="item-stock">${stockStatus}</p>
                </div>
                <div class="wishlist-item-actions">
                    <button class="view-details-btn" onclick="window.location.href='product-details.php?id=${product.product_id}'">View Details</button>
                    <button class="remove-wishlist-btn" data-id="${product.product_id}">Remove</button>
                </div>
            `;
            
            wishlistContainer.appendChild(productCard);
        });
        
        // Clear and add to container
        productContainer.innerHTML = '';
        productContainer.appendChild(wishlistContainer);
        
        // Add event listeners for remove buttons
        document.querySelectorAll('.remove-wishlist-btn').forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.getAttribute('data-id');
                removeFromWishlist(productId, this.closest('.wishlist-item'));
            });
        });
    }
    
    function removeFromWishlist(productId, itemElement) {
        // Prepare wishlist data
        const wishlistData = {
            type: 'Wishlist',
            action: 'remove',
            product_id: productId
        };
        
        // Optimistically update UI
        if (itemElement) {
            itemElement.classList.add('removing');
            itemElement.style.opacity = '0.5';
        }
        
        // Send request to API
        fetch('api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(wishlistData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                // Success - remove the item from DOM with animation
                if (itemElement) {
                    itemElement.style.height = itemElement.offsetHeight + 'px';
                    setTimeout(() => {
                        itemElement.style.height = '0';
                        itemElement.style.margin = '0';
                        itemElement.style.padding = '0';
                        
                        setTimeout(() => {
                            itemElement.remove();
                            
                            // Check if any items remain
                            if (document.querySelectorAll('.wishlist-item').length === 0) {
                                // If no items left, show empty message
                                displayWishlistItems([]);
                            }
                        }, 300);
                    }, 100);
                }
            } else {
                // Error - restore UI
                if (itemElement) {
                    itemElement.classList.remove('removing');
                    itemElement.style.opacity = '1';
                }
                
                // Show error toast or alert
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-toast';
                errorDiv.textContent = 'Failed to remove item: ' + data.data;
                document.body.appendChild(errorDiv);
                
                setTimeout(() => {
                    errorDiv.classList.add('show');
                    
                    setTimeout(() => {
                        errorDiv.classList.remove('show');
                        setTimeout(() => {
                            errorDiv.remove();
                        }, 300);
                    }, 3000);
                }, 10);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            
            // Restore UI
            if (itemElement) {
                itemElement.classList.remove('removing');
                itemElement.style.opacity = '1';
            }
            
            // Show error toast or alert
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-toast';
            errorDiv.textContent = 'An error occurred. Please try again.';
            document.body.appendChild(errorDiv);
            
            setTimeout(() => {
                errorDiv.classList.add('show');
                
                setTimeout(() => {
                    errorDiv.classList.remove('show');
                    setTimeout(() => {
                        errorDiv.remove();
                    }, 300);
                }, 3000);
            }, 10);
        });
    }
});