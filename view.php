<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>View - COS221</title>
    <link rel="stylesheet" href="css/view.css"> 
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet">
    
</head>
<body>

    <?php include('header.php'); ?>


    <div class="view-container">
        
        <!-- Image Carousel -->
        <div class="carousel-container">
            <button id="prev-btn" class="carousel-btn">❮</button>
            <div class="carousel">
            </div>
            <button id="next-btn" class="carousel-btn">❯</button>
        </div>

        <!-- Product Details -->
        <div class="product-info">
            <h2 class="product-title"></h2>
            <p class="product-price"><strong>Price:</strong> <span id="price"></span></p>
            <p class="product-category"><strong>Category:</strong> <span id="category"></span></p>
            <p class="product-description"><strong>Description:</strong> <span id="description"></span></p>
            <p class="product-features"><strong>Features:</strong> <span id="features"></span></p>
            <ul class="product-characteristics">
            </ul>

            <button class="button add-to-cart">Add to Cart</button>
        </div>
    </div>


    <script src="js/view.js"></script> 

</body>
</html>