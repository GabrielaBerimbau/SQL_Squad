document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('signup-form');
    const errorMsg = document.getElementById('error-msg');
    const successMsg = document.getElementById('success-msg');
    const roleSelect = document.getElementById('role');
    const companyField = document.getElementById('company-field');
    const companyInput = document.getElementById('company');
    
    // Show or hide the company box
    roleSelect.addEventListener('change', function() {
        if (this.value === 'retailer') {
            companyField.classList.add('show');
            companyInput.required = true;
        } else {
            companyField.classList.remove('show');
            companyInput.required = false;
            companyInput.value = '';
        }
    });
    
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get('message');
    
    if (message === 'signup_success') {
        showMessage('Account created successfully! Please log in.', 'success');
    }
    
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        errorMsg.style.display = 'none';
        if (successMsg) successMsg.style.display = 'none';
        
        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const role = document.getElementById('role').value;
        const company = document.getElementById('company').value.trim();
        
        if (!username || !email || !password || !role) {
            showError('Please fill in all required fields.');
            return;
        }
        
        if (role === 'retailer') 
        {
            if (!company) 
            {
                showError('Company name is required for retailers.');
                return;
            }
            
            if (company.length < 2 || company.length > 100) 
            {
                showError('Company name must be between 2-100 characters.');
                return;
            }
        }
        
        if (username.length < 3 || username.length > 50) 
        {
            showError('Username must be between 3-50 characters.');
            return;
        }
        
        // Email Regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showError('Please enter a valid email address.');
            return;
        }
        
        // Password Len
        if (password.length < 6) {
            showError('Password must be at least 6 characters long.');
            return;
        }
        
        // rawData prep
        const signupData = {
            type: 'Register',
            username: username,
            email: email,
            password: password,
            role: role.toLowerCase()
        };
        
        // Add company if retailer
        if (role === 'retailer') 
        {
            signupData.company = company;
        }
        
        console.log('Sending signup data:', signupData); 
        
        fetch('api.php', 
        {
            method: 'POST',
            headers: 
            {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(signupData)
        })
        .then(response => response.json())
        .then(data => {
            console.log('API Response:', data); 
            
            if (data.status === 'success') 
            {
                if (role === 'retailer') 
                {
                    showSuccess('Retailer account created successfully! Your account needs admin approval before you can log in.');
                } 
                else 
                {
                    showSuccess('Account created successfully! Redirecting to login...');
                }
                
                signupForm.reset();
                companyField.classList.remove('show');
                companyInput.required = false;
                
                setTimeout(() => {
                    window.location.href = 'login.php?message=signup_success';
                }, 2000);
            } 
            else 
            {
                showError(data.data || 'Registration failed. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showError('An error occurred. Please try again.');
        });
    });
    
    function showError(message) 
    {
        errorMsg.textContent = message;
        errorMsg.style.display = 'block';
        if (successMsg) successMsg.style.display = 'none';
    }
    
    function showSuccess(message) 
    {
        if (successMsg) 
        {
            successMsg.textContent = message;
            successMsg.style.display = 'block';
        }
        errorMsg.style.display = 'none';
    }
    
    function showMessage(message, type) 
    {
        if (type === 'success') 
        {
            showSuccess(message);
        } 
        else 
        {
            showError(message);
        }
        
        setTimeout(() => {
            errorMsg.style.display = 'none';
            if (successMsg) successMsg.style.display = 'none';
        }, 5000);
    }
});