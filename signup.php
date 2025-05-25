<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <title>CompareIt - Welcome</title>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="css/signup.css" />
    <link rel="stylesheet" href="css/footer.css" />
</head>

<body>
    <script src="js/signup.js"></script>
    <a href="index.php" class="back-button">← Back</a>

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
                    <option value="customer">Customer</option>
                    <option value="retailer">Retailer</option>
                </select>

                <div class="company-field" id="company-field">
                    <label for="company">Company Name:</label>
                    <input type="text" id="company" name="company" placeholder="Enter your company name">
                </div>

                <div id="error-msg" style="color: red; display: none;"></div>
                <div id="success-msg" style="color: green; display: none;"></div>

                <button type="submit">Register</button>
            </form>
            
            <div style="margin-top: 20px; text-align: center; color: #32402f;">
                <p>Already have an account? <a href="login.php" style="color: #32402f; text-decoration: underline;">Log in here</a></p>
            </div>
        </section>
    </main>

    <?php include 'footer.php'; ?>
</body>
</html>