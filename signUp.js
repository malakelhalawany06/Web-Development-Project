// signUp.js – complete working version for numeric academic year (1-7)

// Make validateSignUp available globally (called from onclick)
window.validateSignUp = function() {
    // Clear all previous error messages
    const errorSpans = ['fnameError', 'lnameError', 'emailError', 'usernameError', 'passError', 'confirmError', 'yearError'];
    errorSpans.forEach(id => {
        const span = document.getElementById(id);
        if (span) span.innerText = '';
    });

    // Get form elements
    const firstName = document.getElementById('fname').value.trim();
    const lastName = document.getElementById('lname').value.trim();
    const email = document.getElementById('email').value.trim();
    const university = document.getElementById('uni').value;
    const academicYear = document.getElementById('year').value;   // "1", "2", etc.
    const major = document.getElementById('major').value;
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('pass').value;
    const confirm = document.getElementById('confirm').value;
    const role = document.getElementById('role').value === 'Instructor' ? 'instructor' : 'student';

    let isValid = true;

    // First name validation
    if (!firstName) {
        document.getElementById('fnameError').innerText = 'First name is required';
          document.getElementById('fnameError').setAttribute('style','color:red');
        isValid = false;
    } else if (firstName.length < 2) {
        document.getElementById('fnameError').innerText = 'First name must be at least 2 characters';
          document.getElementById('fnameError').setAttribute('style','color:red');
        isValid = false;
    }

    // Last name validation
    if (!lastName) {
        document.getElementById('lnameError').innerText = 'Last name is required';
          document.getElementById('lnameError').setAttribute('style','color:red');
        isValid = false;
    } else if (lastName.length < 2) {
        document.getElementById('lnameError').innerText = 'Last name must be at least 2 characters';
          document.getElementById('lnameError').setAttribute('style','color:red');
        isValid = false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    if (!email) {
        document.getElementById('emailError').innerText = 'Email is required';
          document.getElementById('emailError').setAttribute('style','color:red');
        isValid = false;
    } else if (!emailRegex.test(email)) {
        document.getElementById('emailError').innerText = 'Enter a valid email address';
          document.getElementById('emailError').setAttribute('style','color:red');
        isValid = false;
    } else if (window.UserManager && window.UserManager.getUserByEmail) {
        if (window.UserManager.getUserByEmail(email)) {
            document.getElementById('emailError').innerText = 'Email already registered';
              document.getElementById('emailError').setAttribute('style','color:red');
            isValid = false;
        }
    }

    // Academic year validation (must be between 1 and 7)
    const yearNum = parseInt(academicYear);
    if(role=='student'){
        if (!academicYear || isNaN(yearNum) || yearNum < 1 || yearNum > 7) {
        document.getElementById('yearError').innerText = 'Select a valid academic year (1-7)';
          document.getElementById('yearError').setAttribute('style','color:red');
        isValid = false;
    }
    }
    

    // Username validation
    if (!username) {
        document.getElementById('usernameError').innerText = 'Username is required';
          document.getElementById('usernameError').setAttribute('style','color:red');
        isValid = false;
    } else if (username.length < 3) {
        document.getElementById('usernameError').innerText = 'Username must be at least 3 characters';
          document.getElementById('usernameError').setAttribute('style','color:red');
        isValid = false;
    } else if (window.UserManager && window.UserManager.getUser) {
        if (window.UserManager.getUser(username)) {
            document.getElementById('usernameError').innerText = 'Username already taken';
             document.getElementById('usernameError').setAttribute('style','color:red');
            isValid = false;
        }
    }

    // Password validation
    if (!password) {
        document.getElementById('passError').innerText = 'Password is required';
          document.getElementById('passError').setAttribute('style','color:red');
        isValid = false;
    } else if (password.length < 6) {
        document.getElementById('passError').innerText = 'Password must be at least 6 characters';
         document.getElementById('passError').setAttribute('style','color:red');
        isValid = false;
    }

    // Confirm password
    if (password !== confirm) {
        document.getElementById('confirmError').innerText = 'Passwords do not match';
        document.getElementById('confirmError').setAttribute('style','color:red');
        isValid = false;
    }

    if (!isValid) return isValid;

    // Check UserManager exists
    if (!window.UserManager) {
        alert('System not ready. Please refresh the page.');
        return false;
    }

    // Create user object (matches UserManager.addUser expectations)
    const newUser = {
        username: username,
        firstName: firstName,
        lastName: lastName,
        university: university,
        major: major,
        academicYear: academicYear,   // e.g., "1"
        email: email,
        password: password,
        role: role
    };

    const added = window.UserManager.addUser(newUser);
    if (!added) {
        alert('Sign-up failed. Username or email may already exist.');
        return false;
    }

    // Sync with personalInfo.js localStorage keys
    localStorage.setItem('userFirstName', firstName);
    localStorage.setItem('userLastName', lastName);
    localStorage.setItem('userMajor', major);
    localStorage.setItem('userYear', academicYear);   // numeric string "1", "2", etc.
    localStorage.setItem('userUniversity', university);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userUsername', username);

    // Set current logged-in user
    localStorage.setItem('app_current_user', username);
 
     if (role === 'student') {
        console.log('Redirecting to student-dashboard.html');
        window.location.href = 'student-dashboard.html';
    } else if (role === 'instructor') {
        console.log('Redirecting to instructor-dashboard.html'); // change as needed
        window.location.href = 'instructor-dashboard.html';
    } else if (role === 'admin') {
        console.log('Redirecting to admin-dashboard.html'); // change as needed
        window.location.href = 'index.html';
    } else {
        console.warn('Unknown role, redirecting to index.html');
        window.location.href = 'index.html';
    }
   // window.location.href = 'index.html';
    return true;
};

// Optional: log that script is ready
console.log('signUp.js loaded – validateSignUp is ready');