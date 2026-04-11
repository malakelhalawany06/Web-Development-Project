// personalInfo.js

(function() {
  // Storage keys
  const STORAGE_KEYS = {
    firstName: 'userFirstName',
    lastName: 'userLastName',
    major: 'userMajor',
    year: 'userYear',
    university: 'userUniversity'
  };

  // Default values (used only if nothing is saved and sidebar is empty)
  const DEFAULT_USER = {
    firstName: 'Ahmed',
    lastName: 'Khalid',
    major: 'Computer Science',
    year: '3',
    university: 'MIU'
  };

  // Helper: get saved data from localStorage
  function loadSavedUser() {
    return {
      firstName: localStorage.getItem(STORAGE_KEYS.firstName),
      lastName: localStorage.getItem(STORAGE_KEYS.lastName),
      major: localStorage.getItem(STORAGE_KEYS.major),
      year: localStorage.getItem(STORAGE_KEYS.year),
      university: localStorage.getItem(STORAGE_KEYS.university)
    };
  }

  // Helper: save full user object
  function persistUser(user) {
    localStorage.setItem(STORAGE_KEYS.firstName, user.firstName);
    localStorage.setItem(STORAGE_KEYS.lastName, user.lastName);
    localStorage.setItem(STORAGE_KEYS.major, user.major);
    localStorage.setItem(STORAGE_KEYS.year, user.year);
    localStorage.setItem(STORAGE_KEYS.university, user.university);
  }

  // Update sidebar, topbar avatar, and form fields from a user object
  function updateUI(user) {
    // Update sidebar name and role
    const sidebarName = document.querySelector('.sidebar-profile .name');
    const sidebarRole = document.querySelector('.sidebar-profile .role');
    const sidebarAvatar = document.querySelector('.sidebar-profile .avatar');
    const topbarAvatar = document.querySelector('.topbar-right .avatar.sm');

    if (sidebarName) sidebarName.innerText = `${user.firstName} ${user.lastName}`;
    if (sidebarRole) sidebarRole.innerText = `${user.major} · Yr ${user.year}`;

    const initials = (user.firstName.charAt(0) + user.lastName.charAt(0)).toUpperCase();
    if (sidebarAvatar) sidebarAvatar.innerText = initials || 'AK';
    if (topbarAvatar) topbarAvatar.innerText = initials || 'AK';

    // Update form fields
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

  // Extract user data from the sidebar (hardcoded HTML fallback)
  function getUserFromSidebar() {
    const nameElement = document.querySelector('.sidebar-profile .name');
    const roleElement = document.querySelector('.sidebar-profile .role');

    if (!nameElement || !roleElement) return null;

    const fullName = nameElement.textContent.trim();
    const roleText = roleElement.textContent.trim();

    const nameParts = fullName.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    let major = '';
    let year = '';
    if (roleText.includes('·')) {
      const parts = roleText.split('·').map(p => p.trim());
      major = parts[0] || '';
      const yearPart = parts[1] || '';
      const yearMatch = yearPart.match(/\d+/);
      year = yearMatch ? yearMatch[0] : '';
    }

    // University is not in sidebar, so we keep default or existing
    const uniSelect = document.getElementById('uni');
    let university = 'MIU';
    if (uniSelect && uniSelect.value) university = uniSelect.value;

    return { firstName, lastName, major, year, university };
  }

  // Initialize the page: prefer saved data, otherwise fallback to sidebar text
  function initPage() {
    const saved = loadSavedUser();
    // Check if we have all required saved fields
    if (saved.firstName && saved.lastName && saved.major && saved.year && saved.university) {
      // Use saved data
      updateUI(saved);
    } else {
      // No saved data: read from sidebar (hardcoded HTML) and optionally save it
      const sidebarUser = getUserFromSidebar();
      if (sidebarUser) {
        // Ensure university is set (from select if available, else default)
        if (!sidebarUser.university) sidebarUser.university = DEFAULT_USER.university;
        updateUI(sidebarUser);
        persistUser(sidebarUser);  // store so next time it persists
      } else {
        // Ultimate fallback
        updateUI(DEFAULT_USER);
        persistUser(DEFAULT_USER);
      }
    }
  }

  // Save function called when button is clicked
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
      university: university || DEFAULT_USER.university
    };

    // Update localStorage
    persistUser(updatedUser);

    // Update all visible UI (sidebar, topbar, form – though form already has values)
    updateUI(updatedUser);

    // Visual feedback
    const saveBtn = document.getElementById('saveChangesBtn');
    if (saveBtn) {
      const originalText = saveBtn.innerText;
      saveBtn.innerText = '✓ Saved!';
      setTimeout(() => {
        saveBtn.innerText = originalText;
      }, 1500);
    }

    return true;
  };

  // Run initialization when DOM is ready
  document.addEventListener('DOMContentLoaded', initPage);
})();