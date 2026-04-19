// signUp.js – working version for numeric academic year

// Make validateSignUp a global function (called by onclick)
window.validateSignUp = function() {
    console.log('validateSignUp called');

    // Clear all previous error messages
    const errorSpans = ['fnameError', 'lnameError', 'emailError', 'usernameError', 'passError', 'confirmError', 'yearError'];
    errorSpans.forEach(id => {
        const span = document.getElementById(id);
        if (span) span.innerText = '';
    });

    // Get form values
    const firstName = document.getElementById('fname').value.trim();
    const lastName = document.getElementById('lname').value.trim();
    const email = document.getElementById('email').value.trim();
    const university = document.getElementById('uni').value;
    const academicYear = document.getElementById('year').value;   // e.g., "1", "2", ...
    const major = document.getElementById('major').value;
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('pass').value;
    const confirmPassword = document.getElementById('confirm').value;
    const role = document.getElementById('role').value === 'Instructor' ? 'instructor' : 'student';

    let isValid = true;

    // First name
    if (!firstName) {
        document.getElementById('fnameError').innerText = 'First name is required';
        isValid = false;
    } else if (firstName.length < 2) {
        document.getElementById('fnameError').innerText = 'First name must be at least 2 characters';
        isValid = false;
    }

    // Last name
    if (!lastName) {
        document.getElementById('lnameError').innerText = 'Last name is required';
        isValid = false;
    } else if (lastName.length < 2) {
        document.getElementById('lnameError').innerText = 'Last name must be at least 2 characters';
        isValid = false;
    }

    // Email
    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    if (!email) {
        document.getElementById('emailError').innerText = 'Email is required';
        isValid = false;
    } else if (!emailRegex.test(email)) {
        document.getElementById('emailError').innerText = 'Enter a valid email address';
        isValid = false;
    } else if (window.UserManager && window.UserManager.getUserByEmail) {
        if (window.UserManager.getUserByEmail(email)) {
            document.getElementById('emailError').innerText = 'Email already registered';
            isValid = false;
        }
    }

    // Academic year – ensure it's a number between 1 and 7
    const yearNum = parseInt(academicYear);
    if (!academicYear || isNaN(yearNum) || yearNum < 1 || yearNum > 7) {
        document.getElementById('yearError').innerText = 'Please select a valid academic year';
        isValid = false;
    }

    // Username
    if (!username) {
        document.getElementById('usernameError').innerText = 'Username is required';
        isValid = false;
    } else if (username.length < 3) {
        document.getElementById('usernameError').innerText = 'Username must be at least 3 characters';
        isValid = false;
    } else if (window.UserManager && window.UserManager.getUser) {
        if (window.UserManager.getUser(username)) {
            document.getElementById('usernameError').innerText = 'Username already taken';
            isValid = false;
        }
    }

    // Password
    if (!password) {
        document.getElementById('passError').innerText = 'Password is required';
        isValid = false;
    } else if (password.length < 6) {
        document.getElementById('passError').innerText = 'Password must be at least 6 characters';
        isValid = false;
    }

    // Confirm password
    if (!confirmPassword) {
        document.getElementById('confirmError').innerText = 'Please confirm your password';
        isValid = false;
    } else if (password !== confirmPassword) {
        document.getElementById('confirmError').innerText = 'Passwords do not match';
        isValid = false;
    }

    if (!isValid) {
        console.log('Validation failed');
        return false;
    }

    // Check UserManager availability
    if (!window.UserManager) {
        alert('System error: UserManager not loaded. Please refresh.');
        console.error('UserManager missing');
        return false;
    }

    // Create user object (matches UserManager expectations)
    const newUser = {
        username: username,
        firstName: firstName,
        lastName: lastName,
        university: university,
        major: major,
        academicYear: academicYear,   // "1", "2", etc. (string)
        email: email,
        password: password,
        role: role
    };

    console.log('Adding user:', newUser);
    const added = window.UserManager.addUser(newUser);

    if (!added) {
        alert('Sign-up failed. Username or email may already exist.');
        return false;
    }

    console.log('User added successfully');

    // Sync with personalInfo.js storage
    localStorage.setItem('userFirstName', firstName);
    localStorage.setItem('userLastName', lastName);
    localStorage.setItem('userMajor', major);
    localStorage.setItem('userYear', academicYear);   // numeric string like "1"
    localStorage.setItem('userUniversity', university);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userUsername', username);

    // Set current logged-in user
    localStorage.setItem('app_current_user', username);

    console.log('Redirecting to index.html');
    window.location.href = 'index.html';
    return true;
};

// Optional: log that script loaded
console.log('signUp.js loaded – validateSignUp is ready');