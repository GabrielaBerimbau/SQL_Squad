<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
?>
<nav class="navbar">
    <ul>
        <?php
        
        $currentPage = basename($_SERVER['PHP_SELF']);
        
       
        $navItems = [
            'products.php' => 'Products',
            'deals.php' => 'Best Deals',
            'wishlist.php' => 'Wishlist',
        ];
        
        
        foreach ($navItems as $url => $label) {
           
            $activeClass = ($currentPage === $url) ? ' active' : '';
            
            echo '<li><a href="' . $url . '" class="nav-link' . $activeClass . '">' . $label . '</a></li>';
        }
        
        if(isset($_SESSION['user_logged_in']) && $_SESSION['user_logged_in'] === true) {
            echo '<li><span class="user-greeting">Welcome, ' . htmlspecialchars($_SESSION['username']) . '</span></li>';
            echo '<li><a href="logout.php" class="nav-link">Logout</a></li>';
        }
        ?>
    </ul>
</nav>