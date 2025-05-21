<?php
//adminView.php

$pageTitle = "Admin - Manage Retailers";
session_start();

$isAdmin = true; 

$retailers = [
    [
        'id' => 1,
        'name' => 'Dischem',
        'logo' => 'images/dischem_logo.png',
        'status' => 'allowed',
        'products_count' => 1245,
        'last_updated' => '2025-05-15'
    ],
    [
        'id' => 2,
        'name' => 'Clicks',
        'logo' => 'images/clicks_logo.png',
        'status' => 'allowed',
        'products_count' => 987,
        'last_updated' => '2025-05-18'
    ],
    [
        'id' => 3,
        'name' => 'Edgars',
        'logo' => 'images/edgars_logo.png',
        'status' => 'restricted',
        'products_count' => 756,
        'last_updated' => '2025-05-10'
    ],
    [
        'id' => 4,
        'name' => 'Woolworths Beauty',
        'logo' => 'images/woolworths_logo.png',
        'status' => 'allowed',
        'products_count' => 632,
        'last_updated' => '2025-05-12'
    ],
    [
        'id' => 5,
        'name' => 'RedSquare',
        'logo' => 'images/redsquare_logo.png',
        'status' => 'allowed',
        'products_count' => 879,
        'last_updated' => '2025-05-17'
    ],
    [
        'id' => 6,
        'name' => 'MAC Cosmetics',
        'logo' => 'images/mac_logo.png',
        'status' => 'restricted',
        'products_count' => 423,
        'last_updated' => '2025-05-08'
    ]
];
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $pageTitle; ?> | Compare It</title>
    <link rel="stylesheet" href="css/adminView.css">   
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet">
 
</head>
<body>
<div class="navbar">
        <a href="#" class="brand">CompareIt</a>
        <div class="user-info">
            <div class="user-details">
                <div class="user-name">Retailer User</div>
                <div class="user-role">Essence Beauty</div>
            </div>
            <div class="user-avatar">E</div>
            <a href="index.php" class="logout-button" title="Log out">Logout</a>
        </div>
    </div>

    <div class="container">
        <h1 class="page-title">Manage Retailers</h1>

        <div class="stats-container">
            <div class="stat-card">
                <div class="stat-number"><?php echo count($retailers); ?></div>
                <div class="stat-label">Total Retailers</div>
            </div>
            <div class="stat-card">
                <div class="stat-number"><?php echo count(array_filter($retailers, function($r) { return $r['status'] === 'allowed'; })); ?></div>
                <div class="stat-label">Active Retailers</div>
            </div>
            <div class="stat-card">
                <div class="stat-number"><?php echo count(array_filter($retailers, function($r) { return $r['status'] === 'restricted'; })); ?></div>
                <div class="stat-label">Restricted Retailers</div>
            </div>
            <div class="stat-card">
                <div class="stat-number"><?php echo array_sum(array_column($retailers, 'products_count')); ?></div>
                <div class="stat-label">Total Products</div>
            </div>
        </div>

        <div class="card">
            <div class="card-header">
                <div class="search-box">
                    <i class="fas fa-search"></i>
                    <input type="text" placeholder="Search retailers...">
                </div>
                <button class="add-retailer-btn">
                    <i class="fas fa-plus"></i> Add New Retailer
                </button>
            </div>

            <div class="bulk-actions">
                <button class="bulk-btn"><i class="fas fa-check-square"></i> Select All</button>
                <button class="bulk-btn"><i class="fas fa-toggle-on"></i> Allow Selected</button>
                <button class="bulk-btn"><i class="fas fa-toggle-off"></i> Restrict Selected</button>
            </div>

            <div class="retailers-list">
                <?php foreach ($retailers as $retailer): ?>
                <div class="retailer-item">
                    <div class="retailer-logo">
                        <i class="fas fa-store"></i>
                        <!-- In production, use the actual logo: -->
                        <!-- <img src="<?php echo $retailer['logo']; ?>" alt="<?php echo $retailer['name']; ?>"> -->
                    </div>
                    <div class="retailer-info">
                        <div class="retailer-name">
                            <span class="status-indicator status-<?php echo $retailer['status']; ?>"></span>
                            <?php echo $retailer['name']; ?>
                        </div>
                        <div class="retailer-meta">
                            <span><i class="fas fa-tags"></i> <?php echo $retailer['products_count']; ?> products</span>
                            <span><i class="fas fa-calendar-alt"></i> Updated: <?php echo $retailer['last_updated']; ?></span>
                        </div>
                    </div>
                    <div class="toggle-container">
                        <input type="checkbox" id="toggle-<?php echo $retailer['id']; ?>" class="toggle" <?php echo ($retailer['status'] === 'allowed') ? 'checked' : ''; ?>>
                        <label class="toggle-label" for="toggle-<?php echo $retailer['id']; ?>">
                            <span class="toggle-inner"></span>
                            <span class="toggle-switch"></span>
                        </label>
                    </div>
                </div>
                <?php endforeach; ?>
            </div>
        </div>

        
    </div>

    <script>
        // This would be expanded in a real application to handle AJAX calls
        // when toggle buttons are clicked
        document.querySelectorAll('.toggle').forEach(toggle => {
            toggle.addEventListener('change', function() {
                const retailerId = this.id.split('-')[1];
                const newStatus = this.checked ? 'allowed' : 'restricted';
                
                console.log(`Retailer ID ${retailerId} status changed to ${newStatus}`);
                // In a real application, this would send an AJAX request to update the status
                // Example:
                // fetch('/api/retailers/update-status', {
                //     method: 'POST',
                //     headers: {
                //         'Content-Type': 'application/json',
                //     },
                //     body: JSON.stringify({
                //         retailerId: retailerId,
                //         status: newStatus
                //     })
                // })
                // .then(response => response.json())
                // .then(data => console.log('Success:', data))
                // .catch(error => console.error('Error:', error));
            });
        });

        // Search functionality
        document.querySelector('.search-box input').addEventListener('keyup', function() {
            const searchTerm = this.value.toLowerCase();
            document.querySelectorAll('.retailer-item').forEach(item => {
                const retailerName = item.querySelector('.retailer-name').textContent.toLowerCase();
                if (retailerName.includes(searchTerm)) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    </script>
</body>
</html>