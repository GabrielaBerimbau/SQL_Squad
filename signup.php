<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <title>CompareIt - Welcome</title>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="css/signup.css" />
    <link rel="stylesheet" href="css/footer.css" />
    <script src="js/signup.js"></script>
</head>

<main>
    <section class="signup-section">
        <h2>Create Your Account</h2>
        <form id="signup-form" method="POST">
            <label for="username">Username:</label>
            <input type="text" id="username" name="username" required>

            <label for="email">Email:</label>
            <input type="email" id="email" name="email" required>

            <label for="password">Password:</label>
            <input type="password" id="password" name="password" required>

            <label for="role">Role:</label>
            <select id="role" name="role" required>
                <option value="Customer">Customer</option>
                <option value="Retailer">Retailer</option>
            </select>

            <div id="error-msg" style="color: red; display: none;"></div>

            <button type="submit">Register</button>
        </form>
    </section>
</main>

<?php include 'footer.php'; ?>
