// Global tracking variables for the warning modal system
let currentWarningUserId = null;
let currentWarningCollection = null;

// ── 1. EDIT SYSTEM ACTIONS ──

window.showEditModal = function(btn) {
    const card = btn.closest('.user-card');
    if (!card) return;

    // Direct reads from your EJS data attributes
    const id = card.dataset.id;
    const collection = card.dataset.collection;
    
    // Safely reads your email text line while cleaning up the "Email:" label prefix
    const emailLine = card.querySelector('.email-line');
    let emailText = '';
    if (emailLine) {
        emailText = emailLine.textContent.replace(/Email\s*:/i, '').trim();
        if (emailText === 'N/A') emailText = '';
    }

    // Reads whatever text is currently inside your <h3> tag
    const nameHeading = card.querySelector('.user-info h3')?.textContent.trim() || '';
    
    // Splits text safely if a full name happens to be stored inside u.firstName
    const nameParts = nameHeading.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Inserts values precisely into your matching modal input IDs
    document.getElementById('editUserId').value = id || '';
    document.getElementById('editUserCollection').value = collection || '';
    document.getElementById('editFirstName').value = firstName;
    document.getElementById('editLastName').value = lastName;
    document.getElementById('editEmail').value = emailText;

    // Opens up your modal interface wrapper
    document.getElementById('editModal').classList.add('active');
};

window.saveEdit = function() {
    const id = document.getElementById('editUserId').value;
    const collection = document.getElementById('editUserCollection').value;
    const firstName = document.getElementById('editFirstName').value.trim();
    const lastName = document.getElementById('editLastName').value.trim();
    const email = document.getElementById('editEmail').value.trim();

    if (!firstName || !email) {
        alert('First name and email are strictly required.');
        return;
    }

    fetch('/admin/users/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, collection, firstName, lastName, email })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            window.closeEditModal();
            
            // Finds the exact user card in your DOM grid and updates it instantly
            const card = document.querySelector(`.user-card[data-id="${id}"]`);
            if (card) {
                const nameHeading = card.querySelector('.user-info h3');
                if (nameHeading) {
                    nameHeading.textContent = `${firstName} ${lastName}`.trim();
                } 
                
                const emailLine = card.querySelector('.email-line');
                if (emailLine) {
                    emailLine.innerHTML = `<span class="email-label">Email:</span> ${email}`;
                }
            }
            alert('User profile has been updated successfully!');
        } else {
            alert('Update failed: ' + (data.error || 'Unknown error occurred.'));
        }
    })
    .catch(err => {
        console.error(err);
        alert('Network connection error trying to save.');
    });
};

window.closeEditModal = function() {
    document.getElementById('editModal').classList.remove('active');
};


// ── 2. WARNING SYSTEM ACTIONS ──

window.showWarningModal = function(btn) {
    const card = btn.closest('.user-card');
    if (!card) return;

    currentWarningUserId = card.dataset.id;
    currentWarningCollection = card.dataset.collection;

    document.getElementById('warningMsg').value = '';
    document.getElementById('warningModal').classList.add('active');
};

window.sendWarning = function() {
    const message = document.getElementById('warningMsg').value.trim();
    if (!message) {
        alert('Please provide a short warning message description.');
        return;
    }

    // This fetch cleanly maps parameters over to your updated adminController.js handler!
    fetch('/admin/users/send-warning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id: currentWarningUserId,
            collection: currentWarningCollection,
            message: message
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            window.closeWarningModal();
            alert('Warning message deployed and email notification sent successfully.');
        } else {
            alert('Error dispatching warning: ' + (data.error || 'Submission error.'));
        }
    })
    .catch(err => {
        console.error(err);
        alert('Network connection error trying to notify user.');
    });
};

window.closeWarningModal = function() {
    document.getElementById('warningModal').classList.remove('active');
};


// ── 3. DELETE ACTIONS ──

window.deleteUser = function(btn) {
    const card = btn.closest('.user-card');
    if (!card) return;

    const id = card.dataset.id;
    const collection = card.dataset.collection;

    if (!confirm('Are you absolutely sure you want to permanently delete this user?')) return;

    fetch('/admin/users/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, collection })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            card.remove();
            alert('User removed from the tracking grid database.');
        } else {
            alert('Delete failed: ' + (data.error || 'Server rejected request.'));
        }
    })
    .catch(err => {
        console.error(err);
        alert('Network connection failure during deletion query.');
    });
};


// ── 4. TABS & FILTER ENGINE ──

document.addEventListener('DOMContentLoaded', function () {
    const tabBtns = document.querySelectorAll('.filter-tabs .tab-btn');
    const searchInput = document.getElementById('userSearch');
    const cards = document.querySelectorAll('.users-grid .user-card');

    let activeFilterTab = 'all';
    let activeSearchQuery = '';

    function runInterfaceFilters() {
        cards.forEach(card => {
            const roleAttribute = (card.dataset.role || '').toLowerCase().trim();
            const textContentDump = card.textContent.toLowerCase();

            const matchesTab = (activeFilterTab === 'all' || roleAttribute === activeFilterTab);
            const matchesSearch = (activeSearchQuery === '' || textContentDump.includes(activeSearchQuery));

            if (matchesTab && matchesSearch) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    }

    // Handles category changing across layout filtering tabs
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            activeFilterTab = this.dataset.filter.toLowerCase().trim();
            runInterfaceFilters();
        });
    });

    // Listens to keyboard inputs typing inside search bar query field
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            activeSearchQuery = this.value.toLowerCase().trim();
            runInterfaceFilters();
        });
    }

    // Click on modal background overlay space to clear it out safely
    document.querySelectorAll('.um-modal').forEach(modal => {
        modal.addEventListener('click', function (e) {
            if (e.target === this) {
                this.classList.remove('active');
            }
        });
    });
});