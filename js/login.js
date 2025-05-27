document.addEventListener('DOMContentLoaded', function() 
{
    const loginForm = document.getElementById('login-form');
    const errorMsg = document.getElementById('error-msg');
    const submitButton = loginForm ? loginForm.querySelector('button[type="submit"]') : null;
    
    // Rate limiting config
    const RATE_LIMIT_DURATION = 30000; // 30 sec
    const STORAGE_KEY = 'last_login_attempt';
    
    function checkRateLimit() 
    {
        const lastAttempt = localStorage.getItem(STORAGE_KEY);
        if (!lastAttempt) return true;
        
        const timeSinceLastAttempt = Date.now() - parseInt(lastAttempt);
        return timeSinceLastAttempt >= RATE_LIMIT_DURATION;
    }
    
    function getRemainingTime() 
    {
        const lastAttempt = localStorage.getItem(STORAGE_KEY);
        if (!lastAttempt) return 0;
        
        const timeSinceLastAttempt = Date.now() - parseInt(lastAttempt);
        const remainingTime = RATE_LIMIT_DURATION - timeSinceLastAttempt;
        return Math.max(0, Math.ceil(remainingTime / 1000));
    }
    
    function updateSubmitButton() 
    {
        if (!submitButton) return;
        
        if (checkRateLimit()) 
        {
            submitButton.disabled = false;
            submitButton.textContent = 'Login';
            submitButton.style.opacity = '1';
            submitButton.style.cursor = 'pointer';
            submitButton.style.backgroundColor = '';
        } 
        else 
        {
            const remainingSeconds = getRemainingTime();
            submitButton.disabled = true;
            submitButton.textContent = `Please wait ${remainingSeconds}s`;
            submitButton.style.opacity = '0.6';
            submitButton.style.cursor = 'not-allowed';
            submitButton.style.backgroundColor = '#ccc';
        }
    }
    
    function startCountdown() 
    {
        const countdownInterval = setInterval(() => {
            if (checkRateLimit()) 
            {
                clearInterval(countdownInterval);
                updateSubmitButton();
                if (errorMsg && errorMsg.textContent.includes('Please wait')) 
                {
                    errorMsg.style.display = 'none';
                }
            } 
            else 
            {
                updateSubmitButton();
            }
        }, 1000);
    }
    
    updateSubmitButton();
    if (!checkRateLimit()) 
    {
        startCountdown();
        const remainingSeconds = getRemainingTime();
        errorMsg.textContent = `Please wait ${remainingSeconds} seconds before trying again.`;
        errorMsg.style.color = '#ff8c00';
        errorMsg.style.display = 'block';
    }
    
    if (loginForm) 
    {
        loginForm.addEventListener('submit', function(e) 
        {
            e.preventDefault();
            
            // Check rate limit
            if (!checkRateLimit()) 
            {
                const remainingSeconds = getRemainingTime();
                errorMsg.textContent = `Please wait ${remainingSeconds} seconds before trying again.`;
                errorMsg.style.color = '#ff8c00';
                errorMsg.style.display = 'block';
                return;
            }
            
            // Clear prev err
            errorMsg.style.display = 'none';
            
            // Create rawdata
            const rawData = {
                type: 'Login',
                username: document.getElementById('username').value.trim(),
                password: document.getElementById('password').value.trim()
            };
            
            // Not empty checker
            if (!rawData.username) {
                errorMsg.textContent = "Username is required.";
                errorMsg.style.color = 'red';
                errorMsg.style.display = 'block';
                return;
            }
            
            // Not empty checker
            if (!rawData.password) {
                errorMsg.textContent = "Password is required.";
                errorMsg.style.color = 'red';
                errorMsg.style.display = 'block';
                return;
            }
            
            // Record this login attempt
            localStorage.setItem(STORAGE_KEY, Date.now().toString());
            
            // Disable buttons
            submitButton.disabled = true;
            submitButton.textContent = 'Logging in...';
            submitButton.style.opacity = '0.7';
            
            // Send to endpoint
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
                //successful login
                if (data.status === 'success') 
                {
                    // clear the rate limit
                    localStorage.removeItem(STORAGE_KEY);
                    
                    // Store user data in local
                    localStorage.setItem('user_id', data.data.user_id);
                    localStorage.setItem('username', data.data.username);
                    localStorage.setItem('role', data.data.role);
                    
                    // success message
                    errorMsg.textContent = "Login successful! Redirecting...";
                    errorMsg.style.color = "green";
                    errorMsg.style.display = 'block';
                    
                    // Redirect
                    let redirectPage;
                    switch(data.data.role) 
                    {
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
                    
                    // Redirect after delay
                    setTimeout(() => {
                        window.location.href = redirectPage;
                    }, 1500);
                } 
                else 
                {
                    // Login failed
                    errorMsg.textContent = data.data || 'Login failed. Please try again.';
                    errorMsg.style.color = 'red';
                    errorMsg.style.display = 'block';
                    
                    // Start countdown
                    startCountdown();
                }
            })
            .catch(error => {
                console.error('Error details:', error);
                errorMsg.textContent = 'An error occurred. Please check the console for details.';
                errorMsg.style.color = 'red';
                errorMsg.style.display = 'block';
                
                startCountdown();
            });
        });
    }
});