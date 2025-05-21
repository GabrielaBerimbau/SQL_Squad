// signup.js - Updated to use rawData instead of FormData
document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('signup-form');
    const errorMsg = document.getElementById('error-msg');
    
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Clear previous error messages
            errorMsg.style.display = 'none';
            
            // Create raw data object with the required format
            const rawData = {
                type: 'Register',  // This is crucial - matches your API switch case
                username: document.getElementById('username').value.trim(),
                email: document.getElementById('email').value.trim(),
                password: document.getElementById('password').value.trim(),
                role: document.getElementById('role').value
            };
            
            // Validate username (alphanumeric, 3-50 chars)
            const usernameReg = /^[a-zA-Z0-9_]{3,50}$/;
            if (!usernameReg.test(rawData.username)) {
                errorMsg.textContent = "Username must be 3-50 characters and contain only letters, numbers, and underscores.";
                errorMsg.style.display = 'block';
                return;
            }
            
            // Validate email
            const emailReg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailReg.test(rawData.email)) {
                errorMsg.textContent = "Please enter a valid email address.";
                errorMsg.style.display = 'block';
                return;
            }
            
            // Validate password (same regex as server-side)
            const passReg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
            if (!passReg.test(rawData.password)) {
                errorMsg.textContent = "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.";
                errorMsg.style.display = 'block';
                return;
            }
            
            // Map the dropdown values to the backend expected values
            const roleMapping = {
                'Customer': 'customer',
                'Retailer': 'retailer',
            };
            
            // Update the role value to match backend expectations
            rawData.role = roleMapping[rawData.role] || rawData.role;
            
            // Send registration request to the correct endpoint
            fetch('api.php', {  // Direct to api.php, not api/users/register
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(rawData)
            })
            .then(response => {
                // Log the raw response for debugging
                console.log('Raw response:', response);
                return response.json();
            })
            .then(data => {
                // Log the parsed data for debugging
                console.log('Parsed data:', data);
                
                if (data.status === 'success') {
                    // Registration successful
                    localStorage.setItem('user_id', data.data.user_id);
                    window.location.href = 'login.php';
                    
                    // Show success message before redirecting
                    errorMsg.textContent = "Registration successful! Redirecting...";
                    errorMsg.style.color = "green";
                    errorMsg.style.display = 'block';
                    
                    // Redirect after a short delay to show the success message
                    setTimeout(() => {
                        window.location.href = redirectPage;
                    }, 1500);
                } else {
                    // Show error message
                    errorMsg.textContent = data.message || 'Registration failed. Please try again.';
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