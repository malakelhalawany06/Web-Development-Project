let currentUserId = null;
let currentCollection = null;

// ── Helpers ──
function getCardData(btn) {
    const card = btn.closest('.user-card');
    return {
        card,
        id: card.dataset.id,
        collection: card.dataset.collection,
        role: card.dataset.role
    };
}

async function apiCall(endpoint, body) {
    try {
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await res.json();
        if (!data.success) alert('Error: ' + (data.error || 'Something went wrong.'));
        return data;
    } catch (err) {
        alert('Network error: ' + err.message);
        return { success: false };
    }
}

// ── Delete User ──
function deleteUser(btn) {
    if (!confirm('Permanently delete this user? This cannot be undone.')) return;
    
    const { id, collection, card } = getCardData(btn);
    
    apiCall('/admin/users/delete', { id, collection }).then(data => {
        if (data.success) {
            card.remove(); 
            showToast('User deleted successfully.', 'success');
        }
    });
}

// ── Edit User ──
function showEditModal(btn) {
    const { id, collection, card } = getCardData(btn);

    const fullName = card.querySelector('.user-info h3')?.textContent.trim() || '';
    const parts = fullName.split(' ');
    const emailText = card.querySelector('.email-line')?.textContent.replace('Email:', '').trim() || '';

    document.getElementById('editUserId').value = id;
    document.getElementById('editUserCollection').value = collection;
    document.getElementById('editFirstName').value = parts[0] || '';
    document.getElementById('editLastName').value = parts.slice(1).join(' ') || '';
    document.getElementById('editEmail').value = emailText === 'N/A' ? '' : emailText;

    document.getElementById('editModal').classList.add('active');
}

function saveEdit() {
    const id = document.getElementById('editUserId').value;
    const collection = document.getElementById('editUserCollection').value;
    const firstName = document.getElementById('editFirstName').value.trim();
    const lastName = document.getElementById('editLastName').value.trim();
    const email = document.getElementById('editEmail').value.trim();

    if (!firstName || !email) { 
        alert('First name and email are required.'); return; 
    }

    apiCall('/admin/users/edit', { id, collection, firstName, lastName, email }).then(data => {
        if (data.success) {
            closeEditModal();
            showToast('User updated successfully!', 'success');
            
            // Update the card visually immediately
            const card = document.querySelector(`.user-card[data-id="${id}"]`);
            if (card) {
                card.querySelector('.user-info h3').textContent = `${firstName} ${lastName}`.trim();
                const emailLine = card.querySelector('.email-line');
                if (emailLine) emailLine.innerHTML = `<span class="email-label">Email:</span> ${email}`;
            }
        }
    });
}

function closeEditModal() {
    document.getElementById('editModal').classList.remove('active');
}

// ── Warning User ──
function showWarningModal(btn) {
    const { id, collection } = getCardData(btn);
    currentUserId = id;
    currentCollection = collection;
    
    document.getElementById('warningMsg').value = '';
    document.getElementById('warningModal').classList.add('active');
}

function sendWarning() {
    const message = document.getElementById('warningMsg').value.trim();
    if (!message) { alert('Please enter a warning message.'); return; }
    
    apiCall('/admin/users/send-warning', {
        id: currentUserId,
        collection: currentCollection,
        message
    }).then(data => {
        if (data.success) {
            closeWarningModal();
            showToast('Warning sent successfully.', 'success');
        }
    });
}

function closeWarningModal() {
    document.getElementById('warningModal').classList.remove('active');
    document.getElementById('warningMsg').value = '';
    currentUserId = null;
    currentCollection = null;
}

// ── Tabs & Search Functionality ──
document.addEventListener('DOMContentLoaded', function () {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const searchInput = document.getElementById('userSearch');
    
    // Variables to track what is currently selected/typed
    let currentTabFilter = 'all';
    let currentSearchQuery = '';

    // Master function to apply BOTH filters at once
    function applyFilters() {
        document.querySelectorAll('.user-card').forEach(card => {
            const cardRole = (card.dataset.role || '').toLowerCase();
            const cardText = card.textContent.toLowerCase();
            
            const matchesTab = (currentTabFilter === 'all' || cardRole === currentTabFilter);
            const matchesSearch = (currentSearchQuery === '' || cardText.includes(currentSearchQuery));

            // Only show the card if it matches BOTH the tab AND the search box
            if (matchesTab && matchesSearch) {
                card.style.display = ''; // Shows the card using your CSS layout
            } else {
                card.style.display = 'none'; // Hides the card
            }
        });
    }

    // 1. Listen for Tab Clicks
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active styling
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Update filter and run
            currentTabFilter = btn.dataset.filter.toLowerCase();
            applyFilters();
        });
    });

    // 2. Listen for Search Typing
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            currentSearchQuery = this.value.toLowerCase();
            applyFilters();
        });
    }

    // Modal background close clicks
    document.querySelectorAll('.um-modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
            }
        });
    });
});

// ── Toast Notifications ──
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `um-toast um-toast-${type}`;
    toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i> ${message}`;
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('visible'));
    setTimeout(() => {
        toast.classList.remove('visible');
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}