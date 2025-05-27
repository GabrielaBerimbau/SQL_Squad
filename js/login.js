// login.js with client-side rate limiting only
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const errorMsg = document.getElementById('error-msg');
    const submitButton = loginForm ? loginForm.querySelector('button[type="submit"]') : null;
    
    // Rate limiting configuration
    const RATE_LIMIT_DURATION = 30000; // 30 sec
    const STORAGE_KEY = 'last_login_attempt';
    
    function checkRateLimit() {
        const lastAttempt = localStorage.getItem(STORAGE_KEY);
        if (!lastAttempt) return true;
        
        const timeSinceLastAttempt = Date.now() - parseInt(lastAttempt);
        return timeSinceLastAttempt >= RATE_LIMIT_DURATION;
    }
    
    function getRemainingTime() {
        const lastAttempt = localStorage.getItem(STORAGE_KEY);
        if (!lastAttempt) return 0;
        
        const timeSinceLastAttempt = Date.now() - parseInt(lastAttempt);
        const remainingTime = RATE_LIMIT_DURATION - timeSinceLastAttempt;
        return Math.max(0, Math.ceil(remainingTime / 1000));
    }
    
    function updateSubmitButton() {
        if (!submitButton) return;
        
        if (checkRateLimit()) {
            submitButton.disabled = false;
            submitButton.textContent = 'Login';
            submitButton.style.opacity = '1';
            submitButton.style.cursor = 'pointer';
            submitButton.style.backgroundColor = '';
        } else {
            const remainingSeconds = getRemainingTime();
            submitButton.disabled = true;
            submitButton.textContent = `Please wait ${remainingSeconds}s`;
            submitButton.style.opacity = '0.6';
            submitButton.style.cursor = 'not-allowed';
            submitButton.style.backgroundColor = '#ccc';
        }
    }
    
    function startCountdown() {
        const countdownInterval = setInterval(() => {
            if (checkRateLimit()) {
                clearInterval(countdownInterval);
                updateSubmitButton();
                // Clear rate limit message if it's showing
                if (errorMsg && errorMsg.textContent.includes('Please wait')) {
                    errorMsg.style.display = 'none';
                }
            } else {
                updateSubmitButton();
            }
        }, 1000);
    }
    
    // Initialize button state on page load
    updateSubmitButton();
    if (!checkRateLimit()) {
        startCountdown();
        // Show rate limit message on page load if still in cooldown
        const remainingSeconds = getRemainingTime();
        errorMsg.textContent = `Please wait ${remainingSeconds} seconds before trying again.`;
        errorMsg.style.color = '#ff8c00';
        errorMsg.style.display = 'block';
    }
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Check rate limit before proceeding
            if (!checkRateLimit()) {
                const remainingSeconds = getRemainingTime();
                errorMsg.textContent = `Please wait ${remainingSeconds} seconds before trying again.`;
                errorMsg.style.color = '#ff8c00';
                errorMsg.style.display = 'block';
                return;
            }
            
            // Clear previous error messages
            errorMsg.style.display = 'none';
            
            // Create raw data object with the required format
            const rawData = {
                type: 'Login',
                username: document.getElementById('username').value.trim(),
                password: document.getElementById('password').value.trim()
            };
            
            // Validate username not empty
            if (!rawData.username) {
                errorMsg.textContent = "Username is required.";
                errorMsg.style.color = 'red';
                errorMsg.style.display = 'block';
                return;
            }
            
            // Validate password not empty
            if (!rawData.password) {
                errorMsg.textContent = "Password is required.";
                errorMsg.style.color = 'red';
                errorMsg.style.display = 'block';
                return;
            }
            
            // Record this login attempt BEFORE making the request
            localStorage.setItem(STORAGE_KEY, Date.now().toString());
            
            // Disable button and show loading state
            submitButton.disabled = true;
            submitButton.textContent = 'Logging in...';
            submitButton.style.opacity = '0.7';
            
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
                    // Login successful - clear the rate limit
                    localStorage.removeItem(STORAGE_KEY);
                    
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
                    // Login failed - show error and start countdown
                    errorMsg.textContent = data.data || 'Login failed. Please try again.';
                    errorMsg.style.color = 'red';
                    errorMsg.style.display = 'block';
                    
                    // Start the countdown for the rate limit
                    startCountdown();
                }
            })
            .catch(error => {
                console.error('Error details:', error);
                errorMsg.textContent = 'An error occurred. Please check the console for details.';
                errorMsg.style.color = 'red';
                errorMsg.style.display = 'block';
                
                // Start the countdown for the rate limit even on network errors
                startCountdown();
            });
        });
    }
});