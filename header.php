<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if(!isset($_SESSION['user_id'])){
    header('Location: login.php');
    exit();
}

?>
<nav class="navbar">
    <ul>
        <?php
        
        $currentPage = basename($_SERVER['PHP_SELF']);
        
        $navItems = [
            'products.php' => 'Products',
            'wishlist.php' => 'Wishlist',
            'highestReviews.php' => 'Top Rated',
        ];
        
        foreach ($navItems as $url => $label) {
            $activeClass = ($currentPage === $url) ? ' active' : '';
            echo '<li><a href="' . $url . '" class="nav-link' . $activeClass . '">' . $label . '</a></li>';
        }
        
        if (isset($_SESSION['user_id']) && !empty($_SESSION['user_id'])) {
            echo '<li><span class="user-greeting" style="color: 
            white; display: inline-block; font-size: 20px;">Welcome, ' 
            . htmlspecialchars($_SESSION['username']) . '</span></li>';
            echo '<li><a href="logout.php" class="nav-link">Logout</a></li>';
        } else {
            $loginActiveClass = ($currentPage === 'login.php') ? ' active' : '';
            $signupActiveClass = ($currentPage === 'signup.php') ? ' active' : '';
            
            echo '<li><a href="login.php" class="nav-link' . $loginActiveClass . '">Login</a></li>';
            echo '<li><a href="signup.php" class="nav-link' . $signupActiveClass . '">Sign Up</a></li>';
        }
        ?>
    </ul>
</nav>