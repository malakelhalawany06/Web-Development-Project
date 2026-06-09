// public/js/personalInfo.js – Fixed Profile Manager for LoomHub

(function() {
    // Execute initialization routines as soon as DOM completes layout analysis
    document.addEventListener('DOMContentLoaded', () => {
        console.log("🚀 Custom profile utilities running securely...");
        initPasswordModalEvents();
        initProfileValidationEvents();
    });

    // --- 1. KEYBOARD/CLICK PASSWORD MODAL HANDLERS ---
    function initPasswordModalEvents() {
        const modal = document.getElementById('passwordModal');
        const openBtn = document.getElementById('openPasswordModalBtn');
        const closeBtn = document.getElementById('closeModalBtn');
        const passwordForm = document.getElementById('passwordForm');

        if (!modal) return console.warn("Password modal wrapper container elements are missing.");

        if (openBtn) {
            openBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                modal.style.display = 'block';
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                modal.style.display = 'none';
            });
        }

        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });

        if (passwordForm) {
            passwordForm.addEventListener('submit', async function(e) {
                e.preventDefault();

                const currentPassword = document.getElementById('currentPassword').value;
                const newPassword = document.getElementById('newPassword').value;
                const confirmPassword = document.getElementById('confirmPassword').value;
                const matchErrorSpan = document.getElementById('passwordMatchError');

                if (newPassword !== confirmPassword) {
                    matchErrorSpan.textContent = "❌ Passwords do not match.";
                    matchErrorSpan.style.color = "red";
                    return;
                }
                matchErrorSpan.textContent = "";

                try {
                    const response = await fetch('/personal-info/change-password', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ currentPassword, newPassword })
                    });

                    const result = await response.json();
                    if (response.ok) {
                        alert('🔑 Password updated successfully!');
                        passwordForm.reset();
                        modal.style.display = 'none';
                    } else {
                        alert(result.error || 'Failed to update user security password.');
                    }
                } catch (err) {
                    console.error('Password patch pipeline structural network error:', err);
                }
            });
        }
    }

    // --- 2. DYNAMIC FRONTEND PROFILE ACCURACY DISPATCHER ---
    function initProfileValidationEvents() {
        const profileForm = document.getElementById('profileForm');
        if (!profileForm) return;

        // Listen for the form submission
        profileForm.addEventListener('submit', function(e) {
            
            // 1. Grab all the input values from the page
            const firstName = document.getElementById('fname')?.value.trim();
            const lastName = document.getElementById('lname')?.value.trim();
            const email = document.getElementById('email')?.value.trim();
            const yearInput = document.getElementById('year');

            let emailRegex = /^[\w.-]+@([\w-]+\.)+[\w-]{2,}$/;
            let valid = true;

            // 2. Run your input validation checks
            if (!firstName) {
                showError('fnameError', 'You must enter a first name');
                valid = false;
            } else if (firstName.length < 3) {
                showError('fnameError', 'Name must be more than 3 characters');
                valid = false;
            } else {
                clearError('fnameError');
            }

            if (!lastName) {
                showError('lnameError', 'You must enter a last name');
                valid = false;
            } else if (lastName.length < 3) {
                showError('lnameError', 'Name must be more than 3 characters');
                valid = false;
            } else {
                clearError('lnameError');
            }

            if (yearInput && yearInput.offsetParent !== null) {
                if (!yearInput.value.trim()) {
                    showError('yearError', 'Please enter a valid academic year track.');
                    valid = false;
                } else {
                    clearError('yearError');
                }
            } else {
                clearError('yearError');
            }

            if (!email || !emailRegex.test(email)) {
                showError('emailError', 'Invalid email structure format.');
                valid = false;
            } else {
                clearError('emailError');
            }

            // 3. THE CRITICAL LOGIC POINT:
            // If the data is BAD (valid is false), we call e.preventDefault() to block the save.
            if (!valid) {
                e.preventDefault(); 
                return;
            }

            // If the data is GOOD (valid is true), we DO NOT block it. 
            // We just let the function finish cleanly. 
            // The browser will natively submit the form to your backend,
            // and your backend's res.redirect('/profile') will finally handle the page swap!
        });
    }

    function showError(id, msg) {
        const el = document.getElementById(id);
        if (el) { el.textContent = msg; el.style.color = 'red'; }
    }
    function clearError(id) {
        const el = document.getElementById(id);
        if (el) el.textContent = "";
    }
})();