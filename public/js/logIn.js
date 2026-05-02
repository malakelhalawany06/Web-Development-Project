// logIn.js - Fixed for any student login

document.addEventListener('DOMContentLoaded', function() {
    const loginBtn = document.querySelector('button[onclick="validateLogin()"]');
    if (loginBtn) {
        loginBtn.onclick = function(e) {
            e.preventDefault();
            validateLogin();
        };
    }
});

function syncUserToPersonalInfo(user) {
    if (!user) return;
    localStorage.setItem('userFirstName', user.firstName);
    localStorage.setItem('userLastName', user.lastName);
    localStorage.setItem('userMajor', user.major);
    localStorage.setItem('userYear', user.academicYear || '');
    localStorage.setItem('userUniversity', user.university);
    localStorage.setItem('userEmail', user.email);
    localStorage.setItem('userUsername', user.username);
}

function validateLogin() {
    const emailErrorSpan = document.getElementById('emailError');
    const passErrorSpan = document.getElementById('passError');
    
    if (emailErrorSpan) emailErrorSpan.innerText = '';
    if (passErrorSpan) passErrorSpan.innerText = '';

    const emailInput = document.getElementById('email');
    const passInput = document.getElementById('pass');

    if (!emailInput || !passInput) {
        console.error('Login form elements missing');
        alert('Form error');
        return;
    }

    const email = emailInput.value.trim();
    const password = passInput.value;
    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;

    let isValid = true;
    if (!email) {
        if (emailErrorSpan) emailErrorSpan.innerText = 'Email is required';
        emailErrorSpan.setAttribute('style','color:red');
        isValid = false;
    } else if (!emailRegex.test(email)) {
        if (emailErrorSpan) emailErrorSpan.innerText = 'Enter a valid email address';
        emailErrorSpan.setAttribute('style','color:red');
        isValid = false;
    }

    if (!password) {
        if (passErrorSpan) passErrorSpan.innerText = 'Password is required';
        passErrorSpan.setAttribute('style','color:red');
        isValid = false;
    }

    if (!isValid) return isValid;

    if (typeof window.UserManager === 'undefined') {
        alert('System not ready. Refresh page.');
        return;
    }

    const user = window.UserManager.getUserByEmail(email);
    
    if (!user) {
        if (emailErrorSpan) emailErrorSpan.innerText = 'No account found with this email';
        emailErrorSpan.setAttribute('style','color:red');
        return;
    }

    if (user.password !== password) {
        if (passErrorSpan) passErrorSpan.innerText = 'Incorrect password';
        passErrorSpan.setAttribute('style','color:red');
        return;
    }

    // SUCCESSFUL LOGIN
    localStorage.setItem('app_current_user', user.username);
    syncUserToPersonalInfo(user);

    // Debug: log the user's role
    console.log('Logged in user:', user.username, 'Role:', user.role);

    // Redirect based on role (case-insensitive check)
    const role = (user.role || '').toLowerCase();
    
    if (role === 'student') {
        console.log('Redirecting to student-dashboard.html');
        window.location.href = 'student-dashboard.html';
    } else if (role === 'instructor') {
        console.log('Redirecting to instructor-dashboard.html'); // change as needed
        window.location.href = 'instructor-dashboard.html';
    } else if (role === 'admin') {
        console.log('Redirecting to admin-dashboard.html'); // change as needed
        window.location.href = 'main-dashboard.html';
    } else {
        console.warn('Unknown role, redirecting to index.html');
        window.location.href = 'index.html';
    }
}
