// personalInfo.js – Universal profile manager for LoomHub

(function() {
    // ---------- Helper functions ----------
    function saveToLocalStorage(user) {
        localStorage.setItem('userFirstName', user.firstName);
        localStorage.setItem('userLastName', user.lastName);
        localStorage.setItem('userMajor', user.major);
        localStorage.setItem('userYear', user.year);
        localStorage.setItem('userUniversity', user.university);
    }

    function loadFromLocalStorage() {
        const firstName = localStorage.getItem('userFirstName');
        const lastName = localStorage.getItem('userLastName');
        const major = localStorage.getItem('userMajor');
        const year = localStorage.getItem('userYear');
        const university = localStorage.getItem('userUniversity');
        if (firstName && lastName && major && year && university) {
            return { firstName, lastName, major, year, university };
        }
        return null;
    }

    // Update EVERY possible profile element on the page
    function applyUserDataToPage(user) {
        // 1. Sidebar profile (name, role, avatar initials)
        const sidebarName = document.querySelector('.sidebar-profile .name');
        const sidebarRole = document.querySelector('.sidebar-profile .role');
        const sidebarAvatar = document.querySelector('.sidebar-profile .avatar');
        if (sidebarName) sidebarName.textContent = `${user.firstName} ${user.lastName}`;
        if (sidebarRole) sidebarRole.textContent = `${user.major} · Yr ${user.year}`;
        const initials = (user.firstName.charAt(0) + user.lastName.charAt(0)).toUpperCase();
        if (sidebarAvatar) sidebarAvatar.textContent = initials || 'AK';

        // 2. Top‑bar avatar (small circle, class .avatar.sm inside .topbar-right)
        const topbarAvatar = document.querySelector('.topbar-right .avatar.sm');
        if (topbarAvatar) topbarAvatar.textContent = initials || 'AK';

        // 3. Main profile display on profile.html (inside the card with .profile-info)
        const profileName = document.querySelector('.card .profile-info .name');
        const profileRole = document.querySelector('.card .profile-info .role');
        if (profileName) profileName.textContent = `${user.firstName} ${user.lastName}`;
        if (profileRole) profileRole.textContent = `${user.major} · Yr ${user.year}`;

        // 4. Update any form fields on the edit page (personalInfo.html)
        const fnameInput = document.getElementById('fname');
        const lnameInput = document.getElementById('lname');
        const majorSelect = document.getElementById('major');
        const yearInput = document.getElementById('year');
        const uniSelect = document.getElementById('uni');

        if (fnameInput) fnameInput.value = user.firstName;
        if (lnameInput) lnameInput.value = user.lastName;
        if (yearInput) yearInput.value = user.year;

        if (majorSelect) {
            for (let i = 0; i < majorSelect.options.length; i++) {
                if (majorSelect.options[i].value === user.major) {
                    majorSelect.selectedIndex = i;
                    break;
                }
            }
        }
        if (uniSelect) {
            for (let i = 0; i < uniSelect.options.length; i++) {
                if (uniSelect.options[i].value === user.university) {
                    uniSelect.selectedIndex = i;
                    break;
                }
            }
        }
    }

    // Read hardcoded sidebar values (fallback for first run)
    function getUserFromSidebar() {
        const nameElement = document.querySelector('.sidebar-profile .name');
        const roleElement = document.querySelector('.sidebar-profile .role');
        if (!nameElement || !roleElement) return null;

        const fullName = nameElement.textContent.trim();
        const roleText = roleElement.textContent.trim();
        const nameParts = fullName.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        let major = '', year = '';
        if (roleText.includes('·')) {
            const parts = roleText.split('·').map(p => p.trim());
            major = parts[0] || '';
            const yearMatch = parts[1]?.match(/\d+/);
            year = yearMatch ? yearMatch[0] : '';
        }
        // Default university if not found
        const uniSelect = document.getElementById('uni');
        const university = uniSelect ? uniSelect.value : 'MIU';
        return { firstName, lastName, major, year, university };
    }

    // Initialize the page: load from localStorage, or fallback to sidebar, or use defaults
    function initPage() {
        let user = loadFromLocalStorage();
        if (!user) {
            user = getUserFromSidebar();
            if (!user) {
                user = {
                    firstName: 'Ahmed',
                    lastName: 'Khalid',
                    major: 'Computer Science',
                    year: '3',
                    university: 'MIU'
                };
            }
            saveToLocalStorage(user);
        }
        applyUserDataToPage(user);
    }

    // Save function triggered by the "Save Changes" button (on personalInfo.html)
    window.saveProfileChanges = function() {
        const firstName = document.getElementById('fname')?.value.trim();
        const lastName = document.getElementById('lname')?.value.trim();
        const major = document.getElementById('major')?.value;
        const year = document.getElementById('year')?.value.trim();
        const university = document.getElementById('uni')?.value;

        if (!firstName || !lastName) {
            alert('Please enter both first and last name.');
            return false;
        }
        if (!year || isNaN(parseInt(year))) {
            alert('Please enter a valid year (e.g., 1, 2, 3, 4).');
            return false;
        }

        const updatedUser = {
            firstName: firstName,
            lastName: lastName,
            major: major,
            year: year,
            university: university || 'MIU'
        };

        saveToLocalStorage(updatedUser);
        applyUserDataToPage(updatedUser);  // update current page immediately

        // Visual feedback on the save button
        const saveBtn = document.getElementById('saveChangesBtn');
        if (saveBtn) {
            const originalText = saveBtn.textContent;
            saveBtn.textContent = '✓ Saved!';
            setTimeout(() => {
                saveBtn.textContent = originalText;
            }, 1500);
        }
        return true;
    };

    // Listen for changes made in another tab (so profile page updates live)
    window.addEventListener('storage', function(event) {
        if (event.key && event.key.startsWith('user')) {
            const user = loadFromLocalStorage();
            if (user) applyUserDataToPage(user);
        }
    });

    // Run initialization when DOM is ready
    document.addEventListener('DOMContentLoaded', initPage);
})();