<?php
session_start();

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    if (!empty($_POST['username'])) {
        $_SESSION['username'] = $_POST['username'];
    }

    if (!empty($_POST['role'])) {
        $_SESSION['role'] = $_POST['role'];
    }

    header("Location: products.php");
    exit;
}

header("Location: login.php");
exit;
