<?php
require_once 'config.php';

class API 
{
    private $conn;
    
    public function __construct() 
    {
        $this->conn = Config::getConnection();
    }
    
    public function processRequest() 
    {
        session_start();

        if (empty($_POST) && $_SERVER['CONTENT_TYPE'] === 'application/json') 
        {
            $json = file_get_contents('php://input');
            $data = json_decode($json, true);
        } 
        else 
        {
            $data = $_POST;
        }
        
        if (empty($data)) 
        {
            $this->returnError("Missing parameters", 400);
            return;
        }
        
        if (!isset($data['type'])) 
        {
            $this->returnError("Missing type", 400);
            return;
        }
        
        // In api.php, update the switch statement in processRequest method to include Wishlist
    switch ($data['type']) {
        case 'Register':
            $this->register($data);
            break;
        case 'Login':
            $this->login($data);
            break;
        case 'GetAllProducts':
            $this->getAllProducts($data);
            break;
        case 'GetWishlistItems':
            $this->getWishlistItems();
            break;
        case 'Wishlist':  // Add this case
            $this->handleWishlist($data);
            break;

         //retaileView cases
        case 'GetRetailerProducts':
            $this->getRetailerProducts($data);
            break;
        case 'AddProduct':
            $this->addProduct($data);
            break;
        case 'UpdateProduct':
            $this->updateProduct($data);
            break;
        case 'DeleteProduct':
            $this->deleteProduct($data);
            break;

//VIEW PAGE CASES 
        case 'GetProductDetails':
                $this->getProductDetails($data);
                break;
        case 'GetProductListings':
                $this->getProductListings($data);
                break;
        case 'GetProductReviews':
                $this->getProductReviews($data);
                break;
        case 'AddReview':
                $this->addReview($data);
                break;
            
    //highest review cases
    case 'GetTopRatedProducts':
        $this->getTopRatedProducts($data);
        break;
    
        default:
            $this->returnError("Invalid type", 400);
            break;
    }
    }

    private function register($data) 
    {
        $reqFields = ['username', 'email', 'password', 'role'];
        
        foreach ($reqFields as $field) 
        {
            if (!isset($data[$field]) || trim($data[$field]) === '') 
            {
                $this->returnError("$field required", 400);
                return;
            }
        }
        
        // Check if email already exists
        $stmt = $this->conn->prepare("SELECT user_id FROM USERS WHERE email = ?");
        $stmt->bind_param("s", $data['email']);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) 
        {
            $this->returnError("Email exists", 409);
            return;
        }
        
        // Check if username already exists
        $stmt = $this->conn->prepare("SELECT user_id FROM USERS WHERE username = ?");
        $stmt->bind_param("s", $data['username']);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) 
        {
            $this->returnError("Username exists", 409);
            return;
        }
        
        // Hash the password 
        $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
        
        // Set default value for is_active
        $isActive = 1;
        
        // Insert the new user
        $stmt = $this->conn->prepare("INSERT INTO USERS (username, email, password, role, is_active) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("ssssi", $data['username'], $data['email'], $hashedPassword, $data['role'], $isActive);
        
        if ($stmt->execute()) 
        {
            $userId = $this->conn->insert_id;
            
            // Now add user to role-specific tables before returning success
            if ($data['role'] === 'customer') {
                try {
                    // Insert into CUSTOMER table
                    $customerStmt = $this->conn->prepare("INSERT INTO CUSTOMER (user_id) VALUES (?)");
                    $customerStmt->bind_param("i", $userId);
                    $customerStmt->execute();
                } catch (Exception $e) {
                    // Log the error but don't exit yet
                    error_log("Error adding user to CUSTOMER table: " . $e->getMessage());
                    // You could delete the user from the USERS table here if you want to ensure consistency
                }
            }
            
            if ($data['role'] === 'retailer') {
                try {
                    // Insert into RETAILER table
                    $retailerStmt = $this->conn->prepare("INSERT INTO RETAILER (user_id, company_name) VALUES (?, ?)");
                    $retailerStmt->bind_param("is", $userId, $data['username']);
                    $retailerStmt->execute();
                } catch (Exception $e) {
                    // Log the error but don't exit yet
                    error_log("Error adding user to RETAILER table: " . $e->getMessage());
                    // You could delete the user from the USERS table here if you want to ensure consistency
                }
            }
            
            // Now return success after all operations are complete
            $this->returnSuccess(['user_id' => $userId]);
        } 
        else 
        {
            $this->returnError("Registration failed: " . $stmt->error, 500);
        }
    }

    private function getWishlistItems() 
    {
        // Check if user is logged in via session
        if (!isset($_SESSION['user_id'])) {
            $this->returnError("You must be logged in to view your wishlist", 401);
            return;
        }
        
        $userId = $_SESSION['user_id'];
        
        // Query to get all wishlist items with product details, removing price information
        $query = "
            SELECT 
                p.*,
                l.in_stock,
                l.listing_id,
                l.user_id AS seller_id,
                COALESCE(r.avg_rating, 0) AS avg_rating,
                COALESCE(r.review_count, 0) AS review_count
            FROM 
                WISHLIST w
            JOIN 
                PRODUCT p ON w.product_id = p.product_id
            LEFT JOIN 
                LISTING l ON l.listing_id = (
                    SELECT MIN(listing_id) 
                    FROM LISTING 
                    WHERE product_id = p.product_id
                )
            LEFT JOIN (
                SELECT 
                    product_id,
                    AVG(rating) AS avg_rating,
                    COUNT(rating) AS review_count
                FROM 
                    REVIEW
                GROUP BY 
                    product_id
            ) r ON p.product_id = r.product_id
            WHERE 
                w.user_id = ?
            ORDER BY 
                p.name ASC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        // Fetch all products in wishlist
        $products = [];
        while ($row = $result->fetch_assoc()) {
            // Process images field (assuming it's stored as JSON)
            if (!empty($row['images'])) {
                // Try to decode as JSON first
                $imageArray = json_decode($row['images'], true);
                if ($imageArray) {
                    $row['primary_image'] = $imageArray[0] ?? 'img/default-product.jpg';
                } else {
                    // If not JSON, try as comma-separated
                    $imageArray = explode(',', $row['images']);
                    $row['primary_image'] = trim($imageArray[0]) ?: 'img/default-product.jpg';
                }
            } else {
                $row['primary_image'] = 'img/default-product.jpg';
            }
            
            // Format rating only
            $row['avg_rating'] = round($row['avg_rating'] ?? 0, 1);
            
            $products[] = $row;
        }
        
        // Return the data
        $this->returnSuccess([
            'products' => $products,
            'count' => count($products)
        ]);
        
        $stmt->close();
    }

    private function login($data) 
    {
        // Check required fields
        if (!isset($data['username']) || !isset($data['password'])) 
        {
            $this->returnError("Username and password required", 400);
            return;
        }

        $username = trim($data['username']);
        $password = $data['password'];

        // Validate username not empty
        if (empty($username)) {
            $this->returnError("Username cannot be empty", 400);
            return;
        }

        // Query to check if username exists and get user details
        $stmt = $this->conn->prepare("SELECT user_id, username, password, role, is_active FROM USERS WHERE username = ?");
        $stmt->bind_param("s", $username);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) 
        {
            // Username not found
            $this->returnError("Invalid username or password", 401);
            return;
        }

        $user = $result->fetch_assoc();
        
        // Check if account is active
        if ($user['is_active'] != 1) 
        {
            $this->returnError("Account is inactive", 403);
            return;
        }

        // Verify password
        if (password_verify($password, $user['password'])) 
        {
            // Password is correct, create session
            $_SESSION['user_id'] = $user['user_id'];
            $_SESSION['username'] = $user['username'];
            $_SESSION['role'] = $user['role'];
            
            // Return success with user info
            $userData = [
                'user_id' => $user['user_id'],
                'username' => $user['username'],
                'role' => $user['role']
            ];
            
            $this->returnSuccess($userData);
        } 
        else 
        {
            // Password is incorrect
            $this->returnError("Invalid username or password", 401);
        }
        
        $stmt->close();
    }

    private function getAllProducts($data) 
    {
        // Initialize the WHERE clause and parameters array
        $whereClause = [];
        $params = [];
        $types = "";
        
        // Check for category_id filter
        if (isset($data['category_id']) && !empty($data['category_id']) && $data['category_id'] !== 'default') {
            $whereClause[] = "p.category_id = ?";
            $params[] = $data['category_id'];
            $types .= "i";  // Integer for category_id
        }
        
        // Check for brand filter
        if (isset($data['brand']) && !empty($data['brand']) && $data['brand'] !== 'default') {
            $whereClause[] = "p.brand = ?";
            $params[] = $data['brand'];
            $types .= "s";
        }
        
        // Check for search term
        if (isset($data['search']) && !empty($data['search'])) {
            $searchTerm = "%" . $data['search'] . "%";
            $whereClause[] = "(p.name LIKE ? OR p.description LIKE ?)";
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $types .= "ss";
        }
        
        // Build the WHERE clause string
        $whereClauseStr = !empty($whereClause) ? "WHERE " . implode(" AND ", $whereClause) : "";
        
        // Simpler query that still gets the necessary data
        $query = "
            SELECT 
                p.*,
                l.in_stock,
                COALESCE(AVG(r.rating), 0) AS avg_rating,
                COUNT(r.rating) AS review_count
            FROM 
                PRODUCT p
            LEFT JOIN 
                LISTING l ON p.product_id = l.product_id
            LEFT JOIN 
                REVIEW r ON p.product_id = r.product_id
            $whereClauseStr
            GROUP BY 
                p.product_id, l.listing_id
        ";
        
        // Add sorting options
        if (isset($data['sort']) && $data['sort'] !== 'default') {
            switch ($data['sort']) {
                case 'rating-high':
                    $query .= " ORDER BY avg_rating DESC";
                    break;
                case 'rating-low':
                    $query .= " ORDER BY avg_rating ASC";
                    break;
                default:
                    $query .= " ORDER BY p.product_id ASC";
                    break;
            }
        } else {
            $query .= " ORDER BY p.product_id ASC";
        }
        
        // Prepare and execute the statement
        $stmt = $this->conn->prepare($query);
        
        // Bind parameters if any
        if (!empty($params)) {
            $stmt->bind_param($types, ...$params);
        }
        
        $stmt->execute();
        $result = $stmt->get_result();
        
        // Store products by their ID to remove duplicates
        $productMap = [];
        while ($row = $result->fetch_assoc()) {
            $productId = $row['product_id'];
            
            // Only add this product if we haven't seen it before
            if (!isset($productMap[$productId])) {
                // Process images field
                if (!empty($row['images'])) {
                    // Try to decode as JSON first
                    $imageArray = json_decode($row['images'], true);
                    if ($imageArray) {
                        $row['primary_image'] = $imageArray[0] ?? 'img/default-product.jpg';
                    } else {
                        // If not JSON, try as comma-separated
                        $imageArray = explode(',', $row['images']);
                        $row['primary_image'] = trim($imageArray[0]) ?: 'img/default-product.jpg';
                    }
                } else {
                    $row['primary_image'] = 'img/default-product.jpg';
                }
                
                $row['avg_rating'] = round($row['avg_rating'] ?? 0, 1);
                
                $productMap[$productId] = $row;
            }
        }
        
        // Convert map to array
        $products = array_values($productMap);
        
        // Get categories for filter dropdown
        $categoryQuery = "SELECT category_id, name FROM CATEGORY ORDER BY name";
        $categoryResult = $this->conn->query($categoryQuery);
        $categories = [];
        if ($categoryResult) {
            while ($row = $categoryResult->fetch_assoc()) {
                $categories[] = $row;
            }
        }
        
        // Get unique brands for filter dropdown
        $brandQuery = "SELECT DISTINCT brand FROM PRODUCT WHERE brand IS NOT NULL AND brand != '' ORDER BY brand";
        $brandResult = $this->conn->query($brandQuery);
        $brands = [];
        if ($brandResult) {
            while ($row = $brandResult->fetch_assoc()) {
                $brands[] = $row['brand'];
            }
        }
        
        // Return the data
        $this->returnSuccess([
            'products' => $products,
            'categories' => $categories,
            'brands' => $brands
        ]);
        
        $stmt->close();
    }

    private function handleWishlist($data) 
{
    // Get user ID from session or request
    $userId = null;
    if (isset($_SESSION['user_id'])) {
        $userId = $_SESSION['user_id'];
    } else if (isset($data['user_id'])) {
        $userId = $data['user_id'];
        // Save to session for future requests
        $_SESSION['user_id'] = $userId;
    }
    
    if (!$userId) {
        $this->returnError("You must be logged in to manage your wishlist", 401);
        return;
    }
    
    // Get the corresponding CUSTOMER.user_id for this user
    $customerStmt = $this->conn->prepare("SELECT user_id FROM CUSTOMER WHERE user_id = ?");
    $customerStmt->bind_param("i", $userId);
    $customerStmt->execute();
    $customerResult = $customerStmt->get_result();
    
    if ($customerResult->num_rows === 0) {
        $this->returnError("User is not registered as a customer", 400);
        return;
    }
    
    $customerRow = $customerResult->fetch_assoc();
    $customerId = $customerRow['user_id'];
    
    // Check required parameters
    if (!isset($data['action']) || !isset($data['product_id'])) {
        $this->returnError("Missing required parameters", 400);
        return;
    }
    
    $productId = $data['product_id'];
    $action = $data['action'];
    
    // Verify the product exists
    $productCheck = $this->conn->prepare("SELECT product_id FROM PRODUCT WHERE product_id = ?");
    $productCheck->bind_param("i", $productId);
    $productCheck->execute();
    $productResult = $productCheck->get_result();
    
    if ($productResult->num_rows === 0) {
        $this->returnError("Product not found", 404);
        return;
    }
    
    switch ($action) {
        case 'add':
            // Check if item is already in wishlist
            $checkStmt = $this->conn->prepare("SELECT * FROM WISHLIST WHERE user_id = ? AND product_id = ?");
            $checkStmt->bind_param("ii", $customerId, $productId);
            $checkStmt->execute();
            $checkResult = $checkStmt->get_result();
            
            if ($checkResult->num_rows > 0) {
                $this->returnError("Product already in wishlist", 409);
                return;
            }
            
            // Add to wishlist
            $addStmt = $this->conn->prepare("INSERT INTO WISHLIST (user_id, product_id) VALUES (?, ?)");
            $addStmt->bind_param("ii", $customerId, $productId);
            
            if ($addStmt->execute()) {
                $this->returnSuccess(["message" => "Product added to wishlist"]);
            } else {
                $this->returnError("Failed to add product to wishlist: " . $addStmt->error, 500);
            }
            break;
            
        case 'remove':
            // Remove from wishlist
            $removeStmt = $this->conn->prepare("DELETE FROM WISHLIST WHERE user_id = ? AND product_id = ?");
            $removeStmt->bind_param("ii", $customerId, $productId);
            
            if ($removeStmt->execute()) {
                if ($this->conn->affected_rows > 0) {
                    $this->returnSuccess(["message" => "Product removed from wishlist"]);
                } else {
                    $this->returnError("Product was not in wishlist", 404);
                }
            } else {
                $this->returnError("Failed to remove product from wishlist", 500);
            }
            break;
            
        case 'check':
            // Check if product is in wishlist
            $checkStmt = $this->conn->prepare("SELECT * FROM WISHLIST WHERE user_id = ? AND product_id = ?");
            $checkStmt->bind_param("ii", $customerId, $productId);
            $checkStmt->execute();
            $checkResult = $checkStmt->get_result();
            
            $this->returnSuccess([
                "in_wishlist" => $checkResult->num_rows > 0
            ]);
            break;
            
        default:
            $this->returnError("Invalid action", 400);
            break;
    }
}

// =========================== GABI - API ==========================

private function getRetailerProducts($data) {
    if (!isset($data['user_id'])) {
        $this->returnError("User ID required", 400);
        return;
    }

    $userId = $data['user_id'];

    // check if user is a retailer
    $checkStmt = $this->conn->prepare("SELECT user_id FROM RETAILER WHERE user_id = ?");
    $checkStmt->bind_param("i", $userId);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();

    if ($checkResult->num_rows === 0) {
        $this->returnError("User is not a retailer", 403);
        return;
    }

    //db query
    $query = "
        SELECT 
            p.product_id as id,
            p.name,
            p.description,
            p.brand,
            p.specification,
            p.category_id,
            l.price,
            l.in_stock,
            l.listing_id,
            l.last_updated as updated_at
        FROM 
            LISTING l
        JOIN 
            PRODUCT p ON l.product_id = p.product_id
        WHERE 
            l.user_id = ?
        ORDER BY 
            p.name ASC
    ";

    $stmt = $this->conn->prepare($query);
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();

    //fetching all the products
    $products = [];
    while ($row = $result->fetch_assoc()) {
        // Get product images from PRODUCT_IMAGES table
        $imageQuery = "SELECT product_id FROM PRODUCT_IMAGES WHERE product_id = ? LIMIT 1";
        $imageStmt = $this->conn->prepare($imageQuery);
        $productId = $row['id'];
        $imageStmt->bind_param("i", $productId);
        $imageStmt->execute();
        $imageResult = $imageStmt->get_result();
        
        if ($imageResult->num_rows > 0) {
            $row['image'] = 'img/products/' . $row['id'] . '.jpg'; // Assume standard naming convention
        } else {
            $row['image'] = 'img/default-product.jpg';
        }

         // Format price
        $row['price'] = floatval($row['price']);
        
        $products[] = $row;
    }
    
    // Return the data
    $this->returnSuccess([
        'products' => $products,
        'count' => count($products)
    ]);
    
    $stmt->close();
}   
    

// add new product as a retailer
private function addProduct($data) {

    //check user logged in
    if (!isset($data['user_id'])) {
        $this->returnError("User ID required", 400);
        return;
    }
    
    $userId = $data['user_id'];

     //check user is a retailer
    $checkStmt = $this->conn->prepare("SELECT user_id FROM RETAILER WHERE user_id = ?");
    $checkStmt->bind_param("i", $userId);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();

    if ($checkResult->num_rows === 0) {
        $this->returnError("User is not a retailer", 403);
        return;
    }

    //validate required fields
    $requiredFields = ['product_name', 'price', 'description'];
    foreach ($requiredFields as $field) {
        if (!isset($data[$field]) || trim($data[$field]) === '') {
            $this->returnError("$field is required", 400);
            return;
        }
    }

    //start transaction
    $this->conn->begin_transaction();
    
    try {
        //insert into PRODUCT table
        $productStmt = $this->conn->prepare("
            INSERT INTO PRODUCT 
            (name, description, brand, category_id, specification) 
            VALUES (?, ?, ?, ?, ?)
        ");
        
        $productName = $data['product_name'];
        $description = $data['description'];
        $brand = $data['brand'] ?? null;
        $categoryId = $data['category_id'] ?? 1; // Default category if not provided
        $specification = $data['specification'] ?? null;
        
        $productStmt->bind_param("sssis", $productName, $description, $brand, $categoryId, $specification);
        $productStmt->execute();
        
        $productId = $this->conn->insert_id;
        
        //===================CHECK====================
        // Handle images/file upload
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $targetDir = "img/products/";
            
            // Create directory if it doesn't exist
            if (!file_exists($targetDir)) {
                mkdir($targetDir, 0777, true);
            }
            
            // Use product_id for image name for consistency
            $filename = $productId . '.jpg';
            $targetFilePath = $targetDir . $filename;
            
            // Upload file
            if (move_uploaded_file($_FILES['image']['tmp_name'], $targetFilePath)) {
                // Add entry to PRODUCT_IMAGES table
                $imageStmt = $this->conn->prepare("INSERT INTO PRODUCT_IMAGES (product_id) VALUES (?)");
                $imageStmt->bind_param("i", $productId);
                $imageStmt->execute();
            }
        }
        
        //insert into LISTING table
        $listingStmt = $this->conn->prepare("
            INSERT INTO LISTING 
            (product_id, user_id, price, in_stock, last_updated) 
            VALUES (?, ?, ?, ?, NOW())
        ");
        
        $price = floatval($data['price']);
        $inStock = isset($data['in_stock']) ? 1 : 1; // Default to in stock
        
        $listingStmt->bind_param("iidi", $productId, $userId, $price, $inStock);
        $listingStmt->execute();
        
        $listingId = $this->conn->insert_id;
        
        // ==================== Price History ====================
        //insert into PRICE_HISTORY table for the initial price
        $historyStmt = $this->conn->prepare("
            INSERT INTO PRICE_HISTORY 
            (listing_id, price, recorded_date) 
            VALUES (?, ?, NOW())
        ");
        
        $historyStmt->bind_param("id", $listingId, $price);
        $historyStmt->execute();
        
        // Commit transaction
        $this->conn->commit();
        
        $this->returnSuccess([
            'product_id' => $productId,
            'listing_id' => $listingId,
            'message' => 'Product added successfully'
        ]);
    } catch (Exception $e) {
        // Rollback on error
        $this->conn->rollback();
        $this->returnError("Error adding product: " . $e->getMessage(), 500);
    }
}

private function updateProduct($data) {
    //check user logged in
    if (!isset($data['user_id'])) {
        $this->returnError("User ID required", 400);
        return;
    }
    
    $userId = $data['user_id'];

    //check if product_id is provided
    if (!isset($data['product_id'])) {
        $this->returnError("Product ID required", 400);
        return;
    }
    
    $productId = $data['product_id'];

    //check user is a retailer
    $checkStmt = $this->conn->prepare("SELECT user_id FROM RETAILER WHERE user_id = ?");
    $checkStmt->bind_param("i", $userId);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();

    if ($checkResult->num_rows === 0) {
        $this->returnError("User is not a retailer", 403);
        return;
    }

    //check that the product listing belongs to the user
     $checkProductStmt = $this->conn->prepare("
        SELECT l.listing_id 
        FROM LISTING l 
        WHERE l.product_id = ? AND l.user_id = ?
    ");
    $checkProductStmt->bind_param("ii", $productId, $userId);
    $checkProductStmt->execute();
    $checkProductResult = $checkProductStmt->get_result();
    
    if ($checkProductResult->num_rows === 0) {
        $this->returnError("Product not found or does not belong to this retailer", 404);
        return;
    }

    $listingRow = $checkProductResult->fetch_assoc();
    $listingId = $listingRow['listing_id'];

    //start transaction
    $this->conn->begin_transaction();

    try {
        //update PRODUCT table
        $updateProductQuery = "UPDATE PRODUCT SET ";
        $updateProductParams = [];
        $updateProductTypes = "";

        //check fields to update
        if (isset($data['product_name']) && !empty($data['product_name'])) {
            $updateProductQuery .= "name = ?, ";
            $updateProductParams[] = $data['product_name'];
            $updateProductTypes .= "s";
        }
        
        if (isset($data['description']) && !empty($data['description'])) {
            $updateProductQuery .= "description = ?, ";
            $updateProductParams[] = $data['description'];
            $updateProductTypes .= "s";
        }
        
        if (isset($data['brand'])) {
            $updateProductQuery .= "brand = ?, ";
            $updateProductParams[] = $data['brand'];
            $updateProductTypes .= "s";
        }
        
        if (isset($data['category_id'])) {
            $updateProductQuery .= "category_id = ?, ";
            $updateProductParams[] = $data['category_id'];
            $updateProductTypes .= "i";
        }
        
        if (isset($data['specification'])) {
            $updateProductQuery .= "specification = ?, ";
            $updateProductParams[] = $data['specification'];
            $updateProductTypes .= "s";
        }
        
        // =================== CHECK ====================
        //handle images/file upload
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $targetDir = "img/products/";
            
            // Create directory if it doesn't exist
            if (!file_exists($targetDir)) {
                mkdir($targetDir, 0777, true);
            }
            
            // Use product_id for image name for consistency
            $filename = $productId . '.jpg';
            $targetFilePath = $targetDir . $filename;
            
            // Upload file
            if (move_uploaded_file($_FILES['image']['tmp_name'], $targetFilePath)) {
                // Check if entry exists in PRODUCT_IMAGES
                $checkImageStmt = $this->conn->prepare("SELECT product_id FROM PRODUCT_IMAGES WHERE product_id = ?");
                $checkImageStmt->bind_param("i", $productId);
                $checkImageStmt->execute();
                $checkImageResult = $checkImageStmt->get_result();
                
                if ($checkImageResult->num_rows === 0) {
                    // Add entry to PRODUCT_IMAGES table if it doesn't exist
                    $imageStmt = $this->conn->prepare("INSERT INTO PRODUCT_IMAGES (product_id) VALUES (?)");
                    $imageStmt->bind_param("i", $productId);
                    $imageStmt->execute();
                }
            }
        }
        
        //remove trailing comma and space
        $updateProductQuery = rtrim($updateProductQuery, ", ");
        
        //add WHERE clause
        $updateProductQuery .= " WHERE product_id = ?";
        $updateProductParams[] = $productId;
        $updateProductTypes .= "i";
        
        //fields aren't empty and need to be updated
        if (count($updateProductParams) > 1) { // More than just the product_id
            $productStmt = $this->conn->prepare($updateProductQuery);
            $productStmt->bind_param($updateProductTypes, ...$updateProductParams);
            $productStmt->execute();
        }
        
        //update LISTING table
        if (isset($data['price']) && !empty($data['price'])) {
            $price = floatval($data['price']);
            
            //update listing price
            $listingStmt = $this->conn->prepare("UPDATE LISTING SET price = ?, last_updated = NOW() WHERE listing_id = ?");
            $listingStmt->bind_param("di", $price, $listingId);
            $listingStmt->execute();
            
            //add to price history
            $historyStmt = $this->conn->prepare("
                INSERT INTO PRICE_HISTORY 
                (listing_id, price, recorded_date) 
                VALUES (?, ?, NOW())
            ");
            $historyStmt->bind_param("id", $listingId, $price);
            $historyStmt->execute();
        }
        
        if (isset($data['in_stock'])) {
            $inStock = $data['in_stock'] ? 1 : 0;
            $listingStmt = $this->conn->prepare("UPDATE LISTING SET in_stock = ?, last_updated = NOW() WHERE listing_id = ?");
            $listingStmt->bind_param("ii", $inStock, $listingId);
            $listingStmt->execute();
        }
        
        //update timestamp
        $this->conn->query("UPDATE LISTING SET last_updated = NOW() WHERE listing_id = $listingId");
        
        //commit transaction
        $this->conn->commit();
        
        $this->returnSuccess([
            'product_id' => $productId,
            'listing_id' => $listingId,
            'message' => 'Product updated successfully'
        ]);
    } catch (Exception $e) {
        // Rollback on error
        $this->conn->rollback();
        $this->returnError("Error updating product: " . $e->getMessage(), 500);
    }
}

private function deleteProduct($data) 
{
    // Check if user is logged in and is a retailer
    if (!isset($data['user_id'])) {
        $this->returnError("User ID required", 400);
        return;
    }
    
    $userId = $data['user_id'];
    
    // Check if product_id is provided
    if (!isset($data['product_id'])) {
        $this->returnError("Product ID required", 400);
        return;
    }
    
    $productId = $data['product_id'];
    
    // Check if user is a retailer
    $checkRetailerStmt = $this->conn->prepare("SELECT user_id FROM RETAILER WHERE user_id = ?");
    $checkRetailerStmt->bind_param("i", $userId);
    $checkRetailerStmt->execute();
    $checkRetailerResult = $checkRetailerStmt->get_result();
    
    if ($checkRetailerResult->num_rows === 0) {
        $this->returnError("User is not a retailer", 403);
        return;
    }
    
    // Check if product belongs to this retailer
    $checkProductStmt = $this->conn->prepare("
        SELECT l.listing_id 
        FROM LISTING l 
        WHERE l.product_id = ? AND l.user_id = ?
    ");
    $checkProductStmt->bind_param("ii", $productId, $userId);
    $checkProductStmt->execute();
    $checkProductResult = $checkProductStmt->get_result();
    
    if ($checkProductResult->num_rows === 0) {
        $this->returnError("Product not found or does not belong to this retailer", 404);
        return;
    }
    
    $listingRow = $checkProductResult->fetch_assoc();
    $listingId = $listingRow['listing_id'];
    
    // Start transaction
    $this->conn->begin_transaction();
    
    try {
        // Delete from PRICE_HISTORY table first (foreign key constraint)
        $deletePriceHistoryStmt = $this->conn->prepare("DELETE FROM PRICE_HISTORY WHERE listing_id = ?");
        $deletePriceHistoryStmt->bind_param("i", $listingId);
        $deletePriceHistoryStmt->execute();
        
        // Delete from LISTING table
        $deleteListingStmt = $this->conn->prepare("DELETE FROM LISTING WHERE listing_id = ?");
        $deleteListingStmt->bind_param("i", $listingId);
        $deleteListingStmt->execute();
        
        // Check if the product is listed by other retailers
        $checkOtherListingsStmt = $this->conn->prepare("SELECT COUNT(*) as count FROM LISTING WHERE product_id = ?");
        $checkOtherListingsStmt->bind_param("i", $productId);
        $checkOtherListingsStmt->execute();
        $checkOtherListingsResult = $checkOtherListingsStmt->get_result();
        $checkOtherListingsRow = $checkOtherListingsResult->fetch_assoc();
        
        // If no other listings exist, delete the product
        if ($checkOtherListingsRow['count'] == 0) {
            // Delete from PRODUCT_IMAGES table
            $deleteImagesStmt = $this->conn->prepare("DELETE FROM PRODUCT_IMAGES WHERE product_id = ?");
            $deleteImagesStmt->bind_param("i", $productId);
            $deleteImagesStmt->execute();
            
            // Delete image file if it exists
            $imagePath = "img/products/" . $productId . ".jpg";
            if (file_exists($imagePath)) {
                unlink($imagePath);
            }
            
            // Delete from WISHLIST table
            $deleteWishlistStmt = $this->conn->prepare("DELETE FROM WISHLIST WHERE product_id = ?");
            $deleteWishlistStmt->bind_param("i", $productId);
            $deleteWishlistStmt->execute();
            
            // Delete from REVIEW table
            $deleteReviewStmt = $this->conn->prepare("DELETE FROM REVIEW WHERE product_id = ?");
            $deleteReviewStmt->bind_param("i", $productId);
            $deleteReviewStmt->execute();
            
            // Finally, delete from PRODUCT table
            $deleteProductStmt = $this->conn->prepare("DELETE FROM PRODUCT WHERE product_id = ?");
            $deleteProductStmt->bind_param("i", $productId);
            $deleteProductStmt->execute();
        }
        
        // Commit transaction
        $this->conn->commit();
        
        $this->returnSuccess([
            'message' => 'Product deleted successfully'
        ]);
    } catch (Exception $e) {
        // Rollback on error
        $this->conn->rollback();
        $this->returnError("Error deleting product: " . $e->getMessage(), 500);
    }
}

// =========================== END OF GABI ==========================


    private function returnError($msg, $statusCode = 400) 
    {
        http_response_code($statusCode);
        
        $resp = [
            'status' => 'error',
            'timestamp' => round(microtime(true) * 1000),
            'data' => $msg
        ];
        
        $this->sendResponse($resp);
    }
    
    private function returnSuccess($data) 
    {
        http_response_code(200);
        
        $resp = [
            'status' => 'success',
            'timestamp' => round(microtime(true) * 1000),
            'data' => $data
        ];
        
        $this->sendResponse($resp);
    }
    
    private function sendResponse($resp) 
    {
        header('Content-Type: application/json');
        echo json_encode($resp);
        exit;
    }


///--------------------------------------NEW METHODS FOR VIEW PAGE



private function getProductDetails($data) 
{
    if (!isset($data['product_id'])) {
        $this->returnError("Product ID required", 400);
        return;
    }
    
    $productId = $data['product_id'];
    
    // Get product details with category name
    $query = "
        SELECT 
            p.*,
            c.name as category_name,
            COALESCE(AVG(r.rating), 0) AS avg_rating,
            COUNT(r.rating) AS review_count
        FROM 
            PRODUCT p
        LEFT JOIN 
            CATEGORY c ON p.category_id = c.category_id
        LEFT JOIN 
            REVIEW r ON p.product_id = r.product_id
        WHERE 
            p.product_id = ?
        GROUP BY 
            p.product_id
    ";
    
    $stmt = $this->conn->prepare($query);
    $stmt->bind_param("i", $productId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        $this->returnError("Product not found", 404);
        return;
    }
    
    $product = $result->fetch_assoc();
    
    // Process images
    if (!empty($product['images'])) {
        $imageArray = json_decode($product['images'], true);
        if ($imageArray) {
            $product['image_list'] = $imageArray;
        } else {
            $imageArray = explode(',', $product['images']);
            $product['image_list'] = array_map('trim', $imageArray);
        }
    } else {
        $product['image_list'] = ['img/default-product.jpg'];
    }
    
    $product['avg_rating'] = round($product['avg_rating'] ?? 0, 1);
    
    $this->returnSuccess($product);
    $stmt->close();
}

private function getProductListings($data) 
{
    if (!isset($data['product_id'])) {
        $this->returnError("Product ID required", 400);
        return;
    }
    
    $productId = $data['product_id'];
    
    // Get all listings for this product with retailer info
    $query = "
        SELECT 
            l.listing_id,
            l.price,
            l.in_stock,
            l.last_updated,
            r.company_name as retailer_name,
            u.username as retailer_username
        FROM 
            LISTING l
        JOIN 
            RETAILER r ON l.user_id = r.user_id
        JOIN 
            USERS u ON r.user_id = u.user_id
        WHERE 
            l.product_id = ?
        ORDER BY 
            l.price ASC
    ";
    
    $stmt = $this->conn->prepare($query);
    $stmt->bind_param("i", $productId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $listings = [];
    while ($row = $result->fetch_assoc()) {
        $row['price'] = floatval($row['price']);
        $listings[] = $row;
    }
    
    $this->returnSuccess([
        'listings' => $listings,
        'count' => count($listings)
    ]);
    
    $stmt->close();
}

private function getProductReviews($data) 
{
    if (!isset($data['product_id'])) {
        $this->returnError("Product ID required", 400);
        return;
    }
    
    $productId = $data['product_id'];
    
    // Get reviews with user information
    $query = "
        SELECT 
            r.rating,
            r.comment,
            r.review_date,
            u.username
        FROM 
            REVIEW r
        JOIN 
            USERS u ON r.user_id = u.user_id
        WHERE 
            r.product_id = ?
        ORDER BY 
            r.review_date DESC
    ";
    
    $stmt = $this->conn->prepare($query);
    $stmt->bind_param("i", $productId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $reviews = [];
    while ($row = $result->fetch_assoc()) {
        $reviews[] = $row;
    }
    
    $this->returnSuccess([
        'reviews' => $reviews,
        'count' => count($reviews)
    ]);
    
    $stmt->close();
}

private function addReview($data) 
{
    // Check if user is logged in
    if (!isset($_SESSION['user_id'])) {
        $this->returnError("You must be logged in to add a review", 401);
        return;
    }
    
    $userId = $_SESSION['user_id'];
    
    // Validate required fields
    $requiredFields = ['product_id', 'rating'];
    foreach ($requiredFields as $field) {
        if (!isset($data[$field]) || $data[$field] === '') {
            $this->returnError("$field is required", 400);
            return;
        }
    }
    
    $productId = $data['product_id'];
    $rating = intval($data['rating']);
    $comment = $data['comment'] ?? '';
    
    // Validate rating range
    if ($rating < 1 || $rating > 5) {
        $this->returnError("Rating must be between 1 and 5", 400);
        return;
    }
    
    // Check if user is a customer
    $customerCheck = $this->conn->prepare("SELECT user_id FROM CUSTOMER WHERE user_id = ?");
    $customerCheck->bind_param("i", $userId);
    $customerCheck->execute();
    $customerResult = $customerCheck->get_result();
    
    if ($customerResult->num_rows === 0) {
        $this->returnError("Only customers can add reviews", 403);
        return;
    }
    
    // Check if product exists
    $productCheck = $this->conn->prepare("SELECT product_id FROM PRODUCT WHERE product_id = ?");
    $productCheck->bind_param("i", $productId);
    $productCheck->execute();
    $productResult = $productCheck->get_result();
    
    if ($productResult->num_rows === 0) {
        $this->returnError("Product not found", 404);
        return;
    }
    
    // Check if user already reviewed this product
    $reviewCheck = $this->conn->prepare("SELECT * FROM REVIEW WHERE user_id = ? AND product_id = ?");
    $reviewCheck->bind_param("ii", $userId, $productId);
    $reviewCheck->execute();
    $reviewResult = $reviewCheck->get_result();
    
    if ($reviewResult->num_rows > 0) {
        $this->returnError("You have already reviewed this product", 409);
        return;
    }
    
    // Insert the review
    $stmt = $this->conn->prepare("INSERT INTO REVIEW (user_id, product_id, rating, comment, review_date) VALUES (?, ?, ?, ?, NOW())");
    $stmt->bind_param("iiis", $userId, $productId, $rating, $comment);
    
    if ($stmt->execute()) {
        $this->returnSuccess(['message' => 'Review added successfully']);
    } else {
        $this->returnError("Failed to add review: " . $stmt->error, 500);
    }
    
    $stmt->close();
}
//-------------------highest review api


private function getTopRatedProducts($data) 
{
    // Initialize the WHERE clause and parameters array
    $whereClause = [];
    $params = [];
    $types = "";
    
    // Check for category_id filter
    if (isset($data['category_id']) && !empty($data['category_id']) && $data['category_id'] !== 'default') {
        $whereClause[] = "p.category_id = ?";
        $params[] = $data['category_id'];
        $types .= "i";
    }
    
    // Check for brand filter
    if (isset($data['brand']) && !empty($data['brand']) && $data['brand'] !== 'default') {
        $whereClause[] = "p.brand = ?";
        $params[] = $data['brand'];
        $types .= "s";
    }
    
    // Check for minimum rating filter
    if (isset($data['min_rating']) && !empty($data['min_rating']) && $data['min_rating'] > 0) {
        $whereClause[] = "COALESCE(AVG(r.rating), 0) >= ?";
        $params[] = floatval($data['min_rating']);
        $types .= "d";
    }
    
    // Check for search term
    if (isset($data['search']) && !empty($data['search'])) {
        $searchTerm = "%" . $data['search'] . "%";
        $whereClause[] = "(p.name LIKE ? OR p.description LIKE ?)";
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $types .= "ss";
    }
    
    // Build the WHERE clause string
    $whereClauseStr = !empty($whereClause) ? "WHERE " . implode(" AND ", $whereClause) : "";
    
    // Query to get top rated products with their ratings and listings
    $query = "
        SELECT 
            p.*,
            l.in_stock,
            l.price,
            l.listing_id,
            COALESCE(AVG(r.rating), 0) AS avg_rating,
            COUNT(r.rating) AS review_count
        FROM 
            PRODUCT p
        LEFT JOIN 
            LISTING l ON p.product_id = l.product_id
        LEFT JOIN 
            REVIEW r ON p.product_id = r.product_id
        $whereClauseStr
        GROUP BY 
            p.product_id
        HAVING 
            COUNT(r.rating) > 0
    ";
    
    // Add sorting options
    if (isset($data['sort']) && $data['sort'] !== 'default') {
        switch ($data['sort']) {
            case 'rating-high':
                $query .= " ORDER BY avg_rating DESC, review_count DESC";
                break;
            case 'review-count':
                $query .= " ORDER BY review_count DESC, avg_rating DESC";
                break;
            case 'price-low':
                $query .= " ORDER BY l.price ASC";
                break;
            case 'price-high':
                $query .= " ORDER BY l.price DESC";
                break;
            default:
                $query .= " ORDER BY avg_rating DESC, review_count DESC";
                break;
        }
    } else {
        $query .= " ORDER BY avg_rating DESC, review_count DESC";
    }
    
    // Limit to top rated products (minimum 3.0 rating by default)
    if (!isset($data['min_rating']) || $data['min_rating'] == 0) {
        $query .= " HAVING avg_rating >= 3.0";
    }
    
    // Prepare and execute the statement
    $stmt = $this->conn->prepare($query);
    
    // Bind parameters if any
    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    
    // Store products by their ID to remove duplicates and get best price
    $productMap = [];
    while ($row = $result->fetch_assoc()) {
        $productId = $row['product_id'];
        
        // Only add this product if we haven't seen it before, or if this listing has a better price
        if (!isset($productMap[$productId]) || 
            (isset($row['price']) && $row['price'] < $productMap[$productId]['price'])) {
            
            // Process images field
            if (!empty($row['images'])) {
                $imageArray = json_decode($row['images'], true);
                if ($imageArray) {
                    $row['primary_image'] = $imageArray[0] ?? 'img/default-product.jpg';
                } else {
                    $imageArray = explode(',', $row['images']);
                    $row['primary_image'] = trim($imageArray[0]) ?: 'img/default-product.jpg';
                }
            } else {
                $row['primary_image'] = 'img/default-product.jpg';
            }
            
            $row['avg_rating'] = round($row['avg_rating'] ?? 0, 1);
            $row['price'] = $row['price'] ? floatval($row['price']) : null;
            
            $productMap[$productId] = $row;
        }
    }
    
    // Convert map to array and sort again by rating
    $products = array_values($productMap);
    
    // Sort the final array by rating (since we might have lost order during deduplication)
    usort($products, function($a, $b) use ($data) {
        if (isset($data['sort'])) {
            switch ($data['sort']) {
                case 'rating-high':
                    if ($b['avg_rating'] == $a['avg_rating']) {
                        return $b['review_count'] - $a['review_count'];
                    }
                    return $b['avg_rating'] <=> $a['avg_rating'];
                case 'review-count':
                    if ($b['review_count'] == $a['review_count']) {
                        return $b['avg_rating'] <=> $a['avg_rating'];
                    }
                    return $b['review_count'] - $a['review_count'];
                case 'price-low':
                    return ($a['price'] ?? PHP_INT_MAX) <=> ($b['price'] ?? PHP_INT_MAX);
                case 'price-high':
                    return ($b['price'] ?? 0) <=> ($a['price'] ?? 0);
                default:
                    if ($b['avg_rating'] == $a['avg_rating']) {
                        return $b['review_count'] - $a['review_count'];
                    }
                    return $b['avg_rating'] <=> $a['avg_rating'];
            }
        } else {
            // Default sort: highest rating first, then most reviews
            if ($b['avg_rating'] == $a['avg_rating']) {
                return $b['review_count'] - $a['review_count'];
            }
            return $b['avg_rating'] <=> $a['avg_rating'];
        }
    });
    
    // Get categories for filter dropdown
    $categoryQuery = "SELECT category_id, name FROM CATEGORY ORDER BY name";
    $categoryResult = $this->conn->query($categoryQuery);
    $categories = [];
    if ($categoryResult) {
        while ($row = $categoryResult->fetch_assoc()) {
            $categories[] = $row;
        }
    }
    
    // Get unique brands for filter dropdown
    $brandQuery = "SELECT DISTINCT brand FROM PRODUCT WHERE brand IS NOT NULL AND brand != '' ORDER BY brand";
    $brandResult = $this->conn->query($brandQuery);
    $brands = [];
    if ($brandResult) {
        while ($row = $brandResult->fetch_assoc()) {
            $brands[] = $row['brand'];
        }
    }
    
    // Return the data
    $this->returnSuccess([
        'products' => $products,
        'categories' => $categories,
        'brands' => $brands,
        'total_count' => count($products)
    ]);
    
    $stmt->close();
}


//--------------------------------------------

}
$api = new API();
$api->processRequest();
?>