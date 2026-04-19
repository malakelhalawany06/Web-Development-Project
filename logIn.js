// logIn.js - Login page specific logic

// Ensure the DOM is fully loaded before attaching event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Get the login button and attach event listener (safer than onclick in HTML)
    const loginBtn = document.querySelector('button[onclick="validateLogin()"]');
    if (loginBtn) {
        // Replace inline onclick with proper event listener
        loginBtn.onclick = function(e) {
            e.preventDefault();
            validateLogin();
        };
    }
});

// Global validateLogin function
function validateLogin() {
    // Get error span elements
    const emailErrorSpan = document.getElementById('emailError');
    const passErrorSpan = document.getElementById('passError');
    
    // Clear previous errors
    if (emailErrorSpan) emailErrorSpan.innerText = '';
    if (passErrorSpan) passErrorSpan.innerText = '';

    // Get input fields
    const emailInput = document.getElementById('email');
    const passInput = document.getElementById('pass');

    // Debug: check if elements exist
    if (!emailInput || !passInput) {
        console.error('Login form elements not found! Check IDs: "email" and "pass"');
        alert('Form error: missing email or password field. Please check the HTML.');
        return;
    }

    const email = emailInput.value.trim();
    const password = passInput.value;

    // Validation
    let isValid = true;
    if (!email) {
        if (emailErrorSpan) emailErrorSpan.innerText = 'Email is required';
        isValid = false;
    } else if (!email.includes('@') || !email.includes('.')) {
        if (emailErrorSpan) emailErrorSpan.innerText = 'Enter a valid email address';
        isValid = false;
    }

    if (!password) {
        if (passErrorSpan) passErrorSpan.innerText = 'Password is required';
        isValid = false;
    }

    if (!isValid) return;

    // Check if UserManager is available
    if (typeof window.UserManager === 'undefined') {
        console.error('UserManager not loaded. Make sure users.js is included BEFORE logIn.js');
        alert('System not ready. Please refresh the page.');
        return;
    }

    // Attempt login using email
    const user = window.UserManager.getUserByEmail(email);
    
    if (!user) {
        if (emailErrorSpan) emailErrorSpan.innerText = 'No account found with this email';
        console.log(`Login failed: email ${email} not found`);
        return;
    }

    if (user.password !== password) {
        if (passErrorSpan) passErrorSpan.innerText = 'Incorrect password';
        console.log(`Login failed: wrong password for ${email}`);
        return;
    }

    // Success - store session and redirect
    localStorage.setItem('app_current_user', user.username);
    console.log(`Login successful for ${user.username}, redirecting to index.html`);
    
    // Use window.location.href for redirect
    window.location.href = 'index.html';
}