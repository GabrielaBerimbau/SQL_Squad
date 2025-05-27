// view.js - Product Details Page
document.addEventListener('DOMContentLoaded', function() {
    // Get product ID from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) {
        document.body.innerHTML = '<div class="error-message">Product ID is required</div>';
        return;
    }
    
    // Elements
    const carouselContainer = document.querySelector('.carousel');
    const productTitle = document.querySelector('.product-title');
    const productPrice = document.querySelector('#price');
    const productCategory = document.querySelector('#category');
    const productDescription = document.querySelector('#description');
    const productFeatures = document.querySelector('#features');
    const sidebar = document.querySelector('.sidebar');
    const reviewsSection = document.querySelector('.reviews-section');
    const wishlistBtn = document.querySelector('.add-to-cart');
    
    // Data storage
    let currentProduct = null;
    let productListings = [];
    let productReviews = [];
    let currentImageIndex = 0;
    
    // Initialize the page
    loadProductDetails();
    
    // Check if user is logged in for wishlist functionality
    const isLoggedIn = !!localStorage.getItem('user_id');
    
    function loadProductDetails() {
        // Show loading state
        showLoading();
        
        // Load product details
        fetchProductDetails();
        fetchProductListings();
        fetchProductReviews();
    }
    
    function fetchProductDetails() {
        const requestData = {
            type: 'GetProductDetails',
            product_id: productId
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
                currentProduct = data.data;
                displayProductDetails();
            } else {
                showError('Failed to load product details: ' + data.data);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showError('Failed to load product details');
        });
    }
    
    function fetchProductListings() {
        const requestData = {
            type: 'GetProductListings',
            product_id: productId
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
                productListings = data.data.listings;
                displayRetailerListings();
                createPriceComparisonChart(); // Add this line
            } else {
                console.error('Failed to load listings:', data.data);
            }
        })
        .catch(error => {
            console.error('Error loading listings:', error);
        });
    }
    
    function fetchProductReviews() {
        const requestData = {
            type: 'GetProductReviews',
            product_id: productId
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
                productReviews = data.data.reviews;
                displayReviews();
            } else {
                console.error('Failed to load reviews:', data.data);
            }
        })
        .catch(error => {
            console.error('Error loading reviews:', error);
        });
    }
    
    function displayProductDetails() {
        if (!currentProduct) return;
        
        // Update page title
        document.title = currentProduct.name + ' - CompareIt';
        
        // Display product information
        if (productTitle) productTitle.textContent = currentProduct.name;
        if (productCategory) productCategory.textContent = currentProduct.category_name || 'Unknown Category';
        if (productDescription) productDescription.textContent = currentProduct.description || 'No description available';
        if (productFeatures) productFeatures.textContent = currentProduct.specification || 'No specifications available';
        
        // Display original price (you might want to show lowest price from listings)
        if (productPrice && productListings.length > 0) {
            const lowestPrice = Math.min(...productListings.map(listing => listing.price));
            productPrice.textContent = `From R${lowestPrice.toFixed(2)}`;
        } else if (productPrice) {
            productPrice.textContent = 'Price not available';
        }
        
        // Display rating
        const ratingElement = document.querySelector('.product-rating');
        if (ratingElement) {
            const rating = currentProduct.avg_rating || 0;
            const reviewCount = currentProduct.review_count || 0;
            ratingElement.innerHTML = `★ ${rating}/5.0 (${reviewCount} reviews)`;
        }
        
        // Display images
        displayProductImages();
        
        // Update wishlist button
        if (wishlistBtn && isLoggedIn) {
            wishlistBtn.textContent = 'Add to Wishlist';
            wishlistBtn.onclick = () => handleWishlistAction();
            checkWishlistStatus();
        } else if (wishlistBtn) {
            wishlistBtn.textContent = 'Login to Add to Wishlist';
            wishlistBtn.onclick = () => window.location.href = 'login.php';
        }
        
        hideLoading();
    }
    
    function displayProductImages() {
        if (!currentProduct || !carouselContainer) return;
        
        const images = currentProduct.image_list || ['img/default-product.jpg'];
        carouselContainer.innerHTML = '';
        
        images.forEach((imageSrc, index) => {
            const img = document.createElement('img');
            img.src = imageSrc;
            img.alt = currentProduct.name + ' Image ' + (index + 1);
            img.className = 'carousel-image';
            img.onclick = () => openImageModal(imageSrc);
            carouselContainer.appendChild(img);
        });
    }
    
    function displayRetailerListings() {
        if (!sidebar) return;
        
        // Clear existing listings
        sidebar.innerHTML = '';
        
        if (productListings.length === 0) {
            sidebar.innerHTML = '<div class="no-listings">No retailers currently selling this product</div>';
            return;
        }
        
        productListings.forEach(listing => {
            const retailerBlock = document.createElement('div');
            retailerBlock.className = 'retailer-block';
            
            const stockStatus = listing.in_stock ? 'In Stock' : 'Out of Stock';
            const stockClass = listing.in_stock ? 'in-stock' : 'out-of-stock';
            
            retailerBlock.innerHTML = `
                <div class="retailer-name">${listing.retailer_name || listing.retailer_username}</div>
                <div class="price-container">
                    <span class="new-price">R${listing.price.toFixed(2)}</span>
                </div>
                <div class="stock-status ${stockClass}">${stockStatus}</div>
                <div class="last-updated">Updated: ${formatDate(listing.last_updated)}</div>
            `;
            
            sidebar.appendChild(retailerBlock);
        });
    }
    
    function displayReviews() {
        if (!reviewsSection) return;
        
        // Create reviews container if it doesn't exist
        let reviewsContainer = document.querySelector('.reviews-container');
        if (!reviewsContainer) {
            reviewsContainer = document.createElement('div');
            reviewsContainer.className = 'reviews-container';
            reviewsSection.appendChild(reviewsContainer);
        }
        
        reviewsContainer.innerHTML = '';
        
        // Add review button at the top if user is logged in
        if (isLoggedIn) {
            const reviewButtonContainer = document.createElement('div');
            reviewButtonContainer.className = 'review-button-container';
            reviewButtonContainer.innerHTML = `
                <button class="review-button" onclick="openReviewModal()">Write a Review</button>
            `;
            reviewsContainer.appendChild(reviewButtonContainer);
        }
        
        if (productReviews.length === 0) {
            const noReviewsDiv = document.createElement('div');
            noReviewsDiv.className = 'no-reviews';
            noReviewsDiv.innerHTML = isLoggedIn ? 
                'No reviews yet. Be the first to review this product!' : 
                'No reviews yet. <a href="login.php">Log in</a> to be the first to review this product!';
            reviewsContainer.appendChild(noReviewsDiv);
        } else {
            productReviews.forEach(review => {
                const reviewElement = document.createElement('div');
                reviewElement.className = 'review';
                
                const stars = generateStarRating(review.rating);
                
                reviewElement.innerHTML = `
                    <div class="review-header">
                        <span class="review-author">${review.username}</span>
                        <span class="review-date">${formatDate(review.review_date)}</span>
                    </div>
                    <div class="stars">${stars}</div>
                    ${review.comment ? `<div class="review-comment">${review.comment}</div>` : ''}
                `;
                
                reviewsContainer.appendChild(reviewElement);
            });
        }
    }
    //--------------------chart

// Function to create price comparison chart
function createPriceComparisonChart() {
    if (productListings.length <= 1) {
        // Don't show chart if only one retailer or no retailers
        return;
    }

    // Create chart container
    const chartContainer = document.createElement('div');
    chartContainer.className = 'price-chart-container';
    chartContainer.innerHTML = `
        <h3 class="chart-title">Price Comparison Across Retailers</h3>
        <div class="chart-wrapper">
            <canvas id="priceComparisonChart" width="400" height="200"></canvas>
        </div>
        <div class="chart-summary">
            <div class="price-stats">
                <div class="stat">
                    <span class="stat-label">Lowest Price:</span>
                    <span class="stat-value lowest-price">R${Math.min(...productListings.map(l => l.price)).toFixed(2)}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Highest Price:</span>
                    <span class="stat-value highest-price">R${Math.max(...productListings.map(l => l.price)).toFixed(2)}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Price Difference:</span>
                    <span class="stat-value price-diff">R${(Math.max(...productListings.map(l => l.price)) - Math.min(...productListings.map(l => l.price))).toFixed(2)}</span>
                </div>
            </div>
        </div>
    `;

    // Insert chart after the main view container but before reviews
    const reviewsSection = document.querySelector('.reviews-section');
    if (reviewsSection) {
        reviewsSection.parentNode.insertBefore(chartContainer, reviewsSection);
    }

    // Prepare data for chart
    const retailers = productListings.map(listing => listing.retailer_name || listing.retailer_username);
    const prices = productListings.map(listing => listing.price);
    const stockStatus = productListings.map(listing => listing.in_stock);

    // Create colors matching your site's aesthetic
    const backgroundColors = prices.map((price, index) => {
        const minPrice = Math.min(...prices);
        
        if (!stockStatus[index]) {
            return 'rgba(128, 128, 128, 0.7)'; // Gray for out of stock
        }
        
        // Dark green for cheapest, lighter gray-green for more expensive
        if (price === minPrice) {
            return 'rgba(50, 64, 47, 0.9)'; // Dark green for best price
        } else {
            return 'rgba(101, 135, 94, 0.8)'; // Lighter green for other prices
        }
    });

    const borderColors = backgroundColors.map(color => {
        if (color.includes('128, 128, 128')) {
            return 'rgba(128, 128, 128, 1)'; // Gray border
        } else if (color.includes('50, 64, 47')) {
            return 'rgba(50, 64, 47, 1)'; // Dark green border
        } else {
            return 'rgba(101, 135, 94, 1)'; // Light green border
        }
    });

    // Create the chart
    const ctx = document.getElementById('priceComparisonChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: retailers,
            datasets: [{
                label: 'Price (R)',
                data: prices,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const listing = productListings[context.dataIndex];
                            const stockText = listing.in_stock ? 'In Stock' : 'Out of Stock';
                            return [
                                `Price: R${context.parsed.y.toFixed(2)}`,
                                `Status: ${stockText}`,
                                `Updated: ${formatDate(listing.last_updated)}`
                            ];
                        }
                    },
                    backgroundColor: 'rgba(50, 64, 47, 0.95)',
                    titleColor: 'white',
                    bodyColor: 'white',
                    borderColor: '#32402f',
                    borderWidth: 2,
                    cornerRadius: 8
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    min: Math.min(...prices) * 0.95,
                    ticks: {
                        callback: function(value) {
                            return 'R' + value.toFixed(2);
                        },
                        color: '#32402f',
                        font: {
                            family: 'Playfair Display',
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: 'rgba(50, 64, 47, 0.1)',
                        lineWidth: 1
                    }
                },
                x: {
                    ticks: {
                        color: '#32402f',
                        font: {
                            family: 'Playfair Display',
                            weight: 'bold'
                        },
                        maxRotation: 45
                    },
                    grid: {
                        display: false
                    }
                }
            },
            animation: {
                duration: 1200,
                easing: 'easeOutQuart'
            }
        }
    });
}

// Simple CSS-only bar chart with updated colors
function createSimplePriceChart() {
    if (productListings.length <= 1) return;

    const chartContainer = document.createElement('div');
    chartContainer.className = 'simple-price-chart';
    
    const minPrice = Math.min(...productListings.map(l => l.price));
    const maxPrice = Math.max(...productListings.map(l => l.price));
    
    let chartHTML = `
        <h3 class="chart-title">Price Comparison Across Retailers</h3>
        <div class="simple-chart-container">
    `;
    
    productListings.forEach(listing => {
        const percentage = ((listing.price - minPrice) / (maxPrice - minPrice)) * 100 || 0;
        const barHeight = Math.max(percentage, 15); // Minimum height for visibility
        
        let barColor = '#808080'; // Gray for out of stock
        if (listing.in_stock) {
            barColor = listing.price === minPrice ? '#32402f' : '#65875e'; // Dark green for best price, light green for others
        }
        
        chartHTML += `
            <div class="price-bar-item">
                <div class="retailer-label">${listing.retailer_name || listing.retailer_username}</div>
                <div class="price-bar-container">
                    <div class="price-bar ${!listing.in_stock ? 'out-of-stock' : (listing.price === minPrice ? 'best-price' : 'other-price')}" 
                         style="height: ${barHeight}%; background-color: ${barColor}">
                    </div>
                </div>
                <div class="price-label">R${listing.price.toFixed(2)}</div>
                <div class="stock-indicator ${listing.in_stock ? 'in-stock' : 'out-of-stock'}">
                    ${listing.in_stock ? '✓ In Stock' : '✗ Out of Stock'}
                </div>
            </div>
        `;
    });
    
    chartHTML += `
        </div>
        <div class="chart-legend">
            <span class="legend-item"><span class="legend-color best-price"></span> Best Price</span>
            <span class="legend-item"><span class="legend-color other-price"></span> Other Prices</span>
            <span class="legend-item"><span class="legend-color out-of-stock"></span> Out of Stock</span>
        </div>
    `;
    
    chartContainer.innerHTML = chartHTML;
    
    // Insert after the main view container but before reviews
    const reviewsSection = document.querySelector('.reviews-section');
    if (reviewsSection) {
        reviewsSection.parentNode.insertBefore(chartContainer, reviewsSection);
    }
}

//----------

    function generateStarRating(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars += '★';
            } else {
                stars += '<span class="empty-star">★</span>';
            }
        }
        return stars;
    }
    
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }
    
    function handleWishlistAction() {
        if (!isLoggedIn) {
            window.location.href = 'login.php';
            return;
        }
        
        const requestData = {
            type: 'Wishlist',
            action: 'add',
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
                wishlistBtn.textContent = 'Added to Wishlist';
                wishlistBtn.disabled = true;
                showAlert('Product added to wishlist!', 'success');
            } else {
                showAlert('Failed to add to wishlist: ' + data.data, 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showAlert('An error occurred. Please try again.', 'error');
        });
    }
    
    function checkWishlistStatus() {
        if (!isLoggedIn) return;
        
        const requestData = {
            type: 'Wishlist',
            action: 'check',
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
            if (data.status === 'success' && data.data.in_wishlist) {
                wishlistBtn.textContent = 'In Wishlist';
                wishlistBtn.disabled = true;
            }
        })
        .catch(error => {
            console.error('Error checking wishlist status:', error);
        });
    }
    
    function openImageModal(imageSrc) {
        const modal = document.createElement('div');
        modal.className = 'image-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <img src="${imageSrc}" alt="Product Image" class="modal-image">
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.onclick = (e) => {
            if (e.target === modal || e.target.classList.contains('close-modal')) {
                document.body.removeChild(modal);
            }
        };
    }
    
    // Global function for review modal
    window.openReviewModal = function() {
        const modal = document.createElement('div');
        modal.className = 'review-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h3>Review ${currentProduct.name}</h3>
                <form id="reviewForm">
                    <div class="rating-input">
                        <label>Rating:</label>
                        <div class="star-rating">
                            ${[1,2,3,4,5].map(i => `<span class="star" data-rating="${i}">★</span>`).join('')}
                        </div>
                        <input type="hidden" id="rating" required>
                    </div>
                    <div class="comment-input">
                        <label for="comment">Comment (optional):</label>
                        <textarea id="comment" rows="4" placeholder="Share your experience with this product..."></textarea>
                    </div>
                    <button type="submit">Submit Review</button>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Handle star rating selection
        const stars = modal.querySelectorAll('.star');
        const ratingInput = modal.querySelector('#rating');
        
        stars.forEach(star => {
            star.onclick = () => {
                const rating = star.getAttribute('data-rating');
                ratingInput.value = rating;
                
                stars.forEach((s, index) => {
                    if (index < rating) {
                        s.classList.add('selected');
                    } else {
                        s.classList.remove('selected');
                    }
                });
            };
        });
        
        // Handle form submission
        const form = modal.querySelector('#reviewForm');
        form.onsubmit = (e) => {
            e.preventDefault();
            submitReview(modal);
        };
        
        // Handle modal close
        modal.onclick = (e) => {
            if (e.target === modal || e.target.classList.contains('close-modal')) {
                document.body.removeChild(modal);
            }
        };
    };
    
    function submitReview(modal) {
        const rating = modal.querySelector('#rating').value;
        const comment = escapeHtml(modal.querySelector('#comment').value);
        
        if (!rating) {
            showAlert('Please select a rating', 'error');
            return;
        }
        
        const requestData = {
            type: 'AddReview',
            product_id: productId,
            rating: parseInt(rating),
            comment: comment
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
                document.body.removeChild(modal);
                showAlert('Review submitted successfully!', 'success');
                // Reload reviews
                fetchProductReviews();
                fetchProductDetails(); // To update average rating
            } else {
                showAlert('Failed to submit review: ' + data.data, 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showAlert('An error occurred. Please try again.', 'error');
        });
    }
    
    function showLoading() {
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'loading';
        loadingDiv.className = 'loading';
        loadingDiv.innerHTML = '<img src="img/loading.gif" alt="Loading..." />';
        document.body.appendChild(loadingDiv);
    }
    
    function hideLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.remove();
        }
    }
    
    function showError(message) {
        hideLoading();
        document.body.innerHTML = `<div class="error-message">${message}</div>`;
    }
    
    function showAlert(message, type) {
        const alert = document.createElement('div');
        alert.className = `alert ${type}`;
        alert.textContent = message;
        document.body.appendChild(alert);
        
        setTimeout(() => {
            if (alert.parentNode) {
                alert.parentNode.removeChild(alert);
            }
        }, 3000);
    }
});