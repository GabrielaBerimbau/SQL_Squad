<?php
/**
 * Product View page for CompareIt
 */
include('config.php');
include_once 'security.php';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>View - COS221</title>
    <link rel="stylesheet" href="css/view.css"> 
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet">
    <!-- Chart.js for price comparison chart -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js"></script>
</head>
<body>

    <?php include('header.php'); ?>

    <div class="page-layout">
        <!-- Main Product Content -->
        <div class="view-container">
            
            <!-- Image Carousel -->
            <div class="carousel-container">
                <!-- <button id="prev-btn" class="carousel-btn">❮</button> -->
                <div class="carousel">
                </div>
                <!-- <button id="next-btn" class="carousel-btn">❯</button> -->
            </div>

            <!-- Product Details -->
            <div class="product-info">
                <h2 class="product-title"></h2>
                <p class="product-rating"><strong>Rating:</strong> <span id="rating"></span></p>
                <p class="product-price"><strong>Price:</strong> <span id="price"></span></p>
                <p class="product-category"><strong>Category:</strong> <span id="category"></span></p>
                <p class="product-description"><strong>Description:</strong> <span id="description"></span></p>
                <p class="product-features"><strong>Features:</strong> <span id="features"></span></p>
                <ul class="product-characteristics">
                </ul>

                <button class="button add-to-cart">Add to Wishlist</button>
            </div>
        </div>

        <!-- Sidebar for Retailer Listings -->
        <div class="sidebar">
            <h3>Available from these retailers:</h3>
            <!-- Retailer listings will be populated by JavaScript -->
        </div>
    </div>

    <!-- Reviews Section -->
    <div class="reviews-section">
        <h2 class="reviews-title">Customer Reviews</h2>
        <!-- Reviews will be populated by JavaScript -->
    </div>

    <script src="js/view.js"></script> 

</body>
<?php include 'footer.php'; ?>
</html>