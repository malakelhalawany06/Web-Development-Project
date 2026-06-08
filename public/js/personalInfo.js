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
                    });const response = await fetch('/personal-info/change-password', { // <-- FIXED endpoint
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

        profileForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const firstName = document.getElementById('fname')?.value.trim();
            const lastName = document.getElementById('lname')?.value.trim();
            const year = document.getElementById('year')?.value.trim();
            const email = document.getElementById('email')?.value.trim();
            const username = document.getElementById('username')?.value.trim();
            const major = document.getElementById('major')?.value;
            const uni = document.getElementById('uni')?.value;

            let emailRegex = /^[\w.-]+@([\w-]+\.)+[\w-]{2,}$/;
            let valid = true;

            // First Name Validation Check
            if (!firstName) {
                showError('fnameError', 'You must enter a first name');
                valid = false;
            } else if (firstName.length < 3) {
                showError('fnameError', 'Name must be more than 3 characters');
                valid = false;
            } else {
                clearError('fnameError');
            }

            // Last Name Validation Check
            if (!lastName) {
                showError('lnameError', 'You must enter a last name');
                valid = false;
            } else if (lastName.length < 3) {
                showError('lnameError', 'Name must be more than 3 characters');
                valid = false;
            } else {
                clearError('lnameError');
            }

            // Academic Year Input Check
            // Inside your public/js/personalInfo.js validation block check:
const yearInput = document.getElementById('year');

// Only run strict verification if the year field exists and is visible on screen!
if (yearInput && yearInput.offsetParent !== null) {
    if (!yearInput.value.trim()) {
        showError('yearError', 'Please enter a valid academic year track.');
        valid = false;
    } else {
        clearError('yearError');
    }
} else {
    // If hidden or missing (for instructors), bypass validation entirely
    clearError('yearError');
}

            // Email Address Format Check
            if (!email || !emailRegex.test(email)) {
                showError('emailError', 'Invalid email structure format.');
                valid = false;
            } else {
                clearError('emailError');
            }

            if (!valid) return;

            try {
               const response = await fetch('/personal-info/update', { // <-- FIXED endpoint
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fname: firstName, lname: lastName, username, email, major, year, uni })
});

                const result = await response.json();
                if (response.ok) {
                    const saveBtn = document.getElementById('saveChangesBtn');
                    if (saveBtn) {
                        const baseText = saveBtn.textContent;
                        saveBtn.textContent = '✓ Profile Saved!';
                        setTimeout(() => { saveBtn.textContent = baseText; }, 1500);
                    }
                } else {
                    alert(result.error || 'General transaction modification error.');
                }
            } catch (err) {
                console.error(err);
            }
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

