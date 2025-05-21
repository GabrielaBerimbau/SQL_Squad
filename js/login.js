// login.js
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const errorMsg = document.getElementById('error-msg');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Clear previous error messages
            errorMsg.style.display = 'none';
            
            // Create raw data object with the required format
            const rawData = {
                type: 'Login',  // Matches your API switch case
                username: document.getElementById('username').value.trim(),
                password: document.getElementById('password').value.trim()
            };
            
            // Validate username not empty
            if (!rawData.username) {
                errorMsg.textContent = "Username is required.";
                errorMsg.style.display = 'block';
                return;
            }
            
            // Validate password not empty
            if (!rawData.password) {
                errorMsg.textContent = "Password is required.";
                errorMsg.style.display = 'block';
                return;
            }
            
            // Send login request to the API endpoint
            fetch('api.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(rawData)
            })
            .then(response => {
                console.log('Raw response:', response);
                return response.json();
            })
            .then(data => {
                console.log('Parsed data:', data);
                
                if (data.status === 'success') {
                    // Login successful
                    // Store user data in localStorage for client-side access
                    localStorage.setItem('user_id', data.data.user_id);
                    localStorage.setItem('username', data.data.username);
                    localStorage.setItem('role', data.data.role);
                    
                    // Show success message
                    errorMsg.textContent = "Login successful! Redirecting...";
                    errorMsg.style.color = "green";
                    errorMsg.style.display = 'block';
                    
                    // Redirect based on user role
                    let redirectPage;
                    switch(data.data.role) {
                        case 'customer':
                            redirectPage = 'products.php';
                            break;
                        case 'retailer':
                            redirectPage = 'retailerView.php';
                            break;
                        case 'admin':
                            redirectPage = 'adminView.php';
                            break;
                        default:
                            redirectPage = 'index.php';
                    }
                    
                    // Redirect after a short delay
                    setTimeout(() => {
                        window.location.href = redirectPage;
                    }, 1500);
                } else {
                    // Show error message
                    errorMsg.textContent = data.data || 'Login failed. Please try again.';
                    errorMsg.style.display = 'block';
                }
            })
            .catch(error => {
                console.error('Error details:', error);
                errorMsg.textContent = 'An error occurred. Please check the console for details.';
                errorMsg.style.display = 'block';
            });
        });
    }
});