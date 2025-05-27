<?php
//adminView.php

$pageTitle = "Admin Dashboard";
session_start();

// check if the user is an admin
if(!isset($_SESSION['user_id']) || !isset($_SESSION['role']) || $_SESSION['role'] !== 'admin'){
    header('Location: login.php');
    exit();
}

$isAdmin = true; 

?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $pageTitle; ?> | Compare It</title>
    <link rel="stylesheet" href="css/adminView.css">   
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">

</head>
<body>

    <div class="navbar">
        <a href="#" class="brand">CompareIt</a>
        <div class="navbar-user-info">
            <div class="navbar-user-details">
                <div class="navbar-user-name">admin</div>
                <div class="navbar-user-role">System Administrator</div>
            </div>
            <div class="navbar-user-avatar">A</div>
            <a href="index.php" class="logout-button" title="Log out">Logout</a>
        </div>
    </div>

    <div class="container">
        <div class="admin-header">
            <h1 class="page-title">Admin Dashboard</h1>
            <div class="admin-tabs">
                <button class="tab-btn active" data-tab="users">User Management</button>
                <button class="tab-btn" data-tab="stats">Analytics</button>
                <button class="tab-btn" data-tab="system">Review Management</button>
            </div>
        </div>

        <div class="stats-container" id="stats-overview">
            <!-- loaded dynamically here -->
        </div>

        <!-- user management -->
        <div class="tab-content active" id="users-tab">
            <div class="card">
                <div class="card-header">
                    <div class="filters-section">
                        <div class="search-box">
                            <i class="fas fa-search"></i>
                            <input type="text" id="search-users" placeholder="Search users by name or email...">
                        </div>
                        <select id="role-filter">
                            <option value="all">All Roles</option>
                            <option value="customer">Customers</option>
                            <option value="retailer">Retailers</option>
                        </select>
                        <select id="status-filter">
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                        <button id="refresh-users" class="refresh-btn">
                            <i class="fas fa-sync-alt"></i> Refresh
                        </button>
                    </div>
                </div>

                <div class="bulk-actions">
                    <button class="bulk-btn" id="select-all-users">
                        <i class="fas fa-check-square"></i> Select All
                    </button>
                    <button class="bulk-btn" id="activate-selected">
                        <i class="fas fa-toggle-on"></i> Activate Selected
                    </button>
                    <button class="bulk-btn" id="deactivate-selected">
                        <i class="fas fa-toggle-off"></i> Deactivate Selected
                    </button>
                </div>

                <div class="users-list" id="users-container">
                    <!-- users loaded dynamically -->
                </div>

                <div class="pagination" id="pagination">
                    <!-- pagination if needed -->
                </div>
            </div>
        </div>

         <!-- analytics -->
        <div class="tab-content" id="stats-tab">
            <div class="analytics-grid">
                <div class="analytics-card">
                    <h3>User Registration Trends</h3>
                    <div id="registration-chart" class="chart-container">
                        <!-- chart implemented here -->
                        <p>Registration trends chart will be displayed here</p>
                    </div>
                </div>
                <div class="analytics-card">
                    <h3>Platform Activity</h3>
                    <div id="activity-chart" class="chart-container">
                        <p>Activity metrics will be displayed here</p>
                    </div>
                </div>
            </div>
        </div>

        
        <!-- review management -->
        <div class="tab-content" id="system-tab">
            <div class="card">
                <div class="card-header">
                    <h3>Review Management</h3>
                    <div class="filters-section">
                        <div class="search-box">
                            <i class="fas fa-search"></i>
                            <input type="text" id="search-reviews" placeholder="Search reviews, products, or users...">
                        </div>
                        <select id="rating-filter">
                            <option value="all">All Ratings</option>
                            <option value="5">5 Stars</option>
                            <option value="4">4 Stars</option>
                            <option value="3">3 Stars</option>
                            <option value="2">2 Stars</option>
                            <option value="1">1 Star</option>
                        </select>
                        <button id="refresh-reviews" class="refresh-btn">
                            <i class="fas fa-sync-alt"></i> Refresh
                        </button>
                    </div>
                </div>

                <div class="reviews-list" id="reviews-container">
                    <!-- reviews loaded dynamically -->
                </div>

                <div class="pagination" id="reviews-pagination">
                    <!-- pagination if needed -->
                </div>
            </div>
        </div>
    </div>

    <!-- confirm modal -->
    <div id="confirmation-modal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3 id="modal-title">Confirm Action</h3>
                <span class="close">&times;</span>
            </div>

            <div class="modal-body">
                <p id="modal-message">Are you sure you want to perform this action?</p>
                <div class="modal-user-info" id="modal-user-info">
                    <!-- user information displayde -->
                </div>
            </div>

            <div class="modal-footer">
                <button id="modal-cancel" class="btn btn-secondary">Cancel</button>
                <button id="modal-confirm" class="btn btn-primary">Confirm</button>
            </div>
        </div>
    </div>

    <!-- user detail modal -->
    <div id="user-details-modal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3>User Details</h3>
                <span class="close">&times;</span>
            </div>

            <div class="modal-body" id="user-details-content">
                <!-- user deets loaded -->
            </div>

            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal('user-details-modal')">Close</button>
            </div>
        </div>
    </div>

    <script src="js/adminView.js"></script>

</body>

</html>