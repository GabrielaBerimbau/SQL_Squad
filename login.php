<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <title>CompareIt - Welcome</title>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="css/login.css" />
    <link rel="stylesheet" href="css/footer.css" />
</head>

<body>
    <a href="index.php" class="back-button">← Back</a>

    <main>
        <section class="login-section">
            <h2>Log In</h2>
            <form id="login-form" method="POST">
                <label for="username">Username:</label>
                <input type="username" id="username" name="username">

                <label for="password">Password:</label>
                <input type="password" id="password" name="password">

                <div id="error-msg" style="color: red; display: none;"></div>

                <button type="submit">Login</button>
            </form>
        </section>
    </main>

    <?php include 'footer.php'; ?>
</body>
</html>
