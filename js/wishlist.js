document.addEventListener('DOMContentLoaded', function() 
{
    const productContainer = document.getElementById('product-container');
    const loadingAnimation = document.getElementById('loading-animation');
    
    const userId = localStorage.getItem('user_id');

    if (!userId) 
    {
        productContainer.innerHTML = `
            <div class="auth-message">
                <p>You need to log in to view your wishlist.</p>
                <button onclick="window.location.href='login.php'">Log In</button>
            </div>
        `;
        loadingAnimation.style.display = 'none';
        return;
    }
    
    loadWishlistItems();
    
    function loadWishlistItems() 
    {
        loadingAnimation.style.display = 'block';
        productContainer.innerHTML = '';
        
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
    
    function displayWishlistItems(products) 
    {
        if (products.length === 0) 
        {
            productContainer.innerHTML = `
                <div class="empty-wishlist">
                    <p>Your wishlist is empty.</p>
                    <button onclick="window.location.href='products.php'">Explore Products</button>
                </div>
            `;
            return;
        }
        
        const wishlistContainer = document.createElement('div');
        wishlistContainer.className = 'wishlist-items';
        
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'wishlist-item';
            
            const ratingDisplay = product.avg_rating > 0 ? 
                `${parseFloat(product.avg_rating).toFixed(1)} / 5.0 (${product.review_count} reviews)` : 
                'Not Rated Yet';
            
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
                    <button class="view-details-btn" onclick="window.location.href='view.php?id=${product.product_id}'">View Details</button>
                    <button class="remove-wishlist-btn" data-id="${product.product_id}">Remove</button>
                </div>
            `;
            
            wishlistContainer.appendChild(productCard);
        });
        
        productContainer.innerHTML = '';
        productContainer.appendChild(wishlistContainer);
        
        document.querySelectorAll('.remove-wishlist-btn').forEach(button => {
            button.addEventListener('click', function() 
            {
                const productId = this.getAttribute('data-id');
                removeFromWishlist(productId, this.closest('.wishlist-item'));
            });
        });
    }
    
    function removeFromWishlist(productId, itemElement) 
    {
        const wishlistData = 
        {
            type: 'Wishlist',
            action: 'remove',
            product_id: productId
        };
        
        if (itemElement) 
        {
            itemElement.classList.add('removing');
            itemElement.style.opacity = '0.5';
        }
        
        fetch('api.php', {
            method: 'POST',
            headers: 
            {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(wishlistData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') 
                {
                if (itemElement) 
                    {
                    itemElement.style.height = itemElement.offsetHeight + 'px';
                    setTimeout(() => {
                        itemElement.style.height = '0';
                        itemElement.style.margin = '0';
                        itemElement.style.padding = '0';
                        
                        setTimeout(() => {
                            itemElement.remove();
                            
                            if (document.querySelectorAll('.wishlist-item').length === 0) 
                            {
                                displayWishlistItems([]);
                            }
                        }, 300);
                    }, 100);
                }
            } 
            else 
            {
                if (itemElement) 
                {
                    itemElement.classList.remove('removing');
                    itemElement.style.opacity = '1';
                }
                
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
            
            if (itemElement) 
            {
                itemElement.classList.remove('removing');
                itemElement.style.opacity = '1';
            }
            
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