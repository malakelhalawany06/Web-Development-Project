// admin-users.js

let currentUserId = null;
let currentCollection = null;

// ── Helpers ──────────────────────────────────────────────────────────────────

function getRowData(btn) {
    const row = btn.closest('tr');
    return {
        row,
        id: row.dataset.id,
        collection: row.dataset.collection,
        role: row.dataset.role
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
        if (!data.success) {
            alert('Error: ' + (data.error || 'Something went wrong.'));
        }
        return data;
    } catch (err) {
        alert('Network error: ' + err.message);
        return { success: false };
    }
}

// ── Actions ───────────────────────────────────────────────────────────────────

function changeStatus(btn, status) {
    const { id, collection, row } = getRowData(btn);
    apiCall('/admin/users/status', { id, collection, status }).then(data => {
        if (data.success) {
            const badge = row.querySelector('.status-badge');
            if (badge) {
                badge.className = `status-badge status-${status}`;
                badge.innerHTML = `<i class="fas fa-circle"></i> ${status}`;
            }
        }
    });
}

function deleteUser(btn) {
    if (!confirm('Permanently delete this user? This cannot be undone.')) return;
    const { id, collection, row } = getRowData(btn);
    apiCall('/admin/users/delete', { id, collection }).then(data => {
        if (data.success) row.remove();
    });
}

async function resetPassword(btn) {
    const { id, collection } = getRowData(btn);
    const data = await apiCall('/admin/users/reset-password', { id, collection });
    if (data.success && data.tempPassword) {
        alert(`Temporary password: ${data.tempPassword}\n\nShare this with the user securely.`);
    }
}

function forceReset(btn) {
    const { id, collection } = getRowData(btn);
    apiCall('/admin/users/force-reset', { id, collection }).then(data => {
        if (data.success) alert('User will be forced to reset password on next login.');
    });
}

function logoutAll(btn) {
    const { id } = getRowData(btn);
    apiCall('/admin/users/logout-all', { userId: id }).then(data => {
        if (data.success) alert('User has been logged out from all devices.');
    });
}

function showWarningModal(btn) {
    const { id, collection } = getRowData(btn);
    currentUserId = id;
    currentCollection = collection;
    document.getElementById('warningModal').style.display = 'flex';
}

function sendWarning() {
    const message = document.getElementById('warningMsg').value.trim();
    if (!message) return alert('Please enter a warning message.');
    apiCall('/admin/users/send-warning', {
        id: currentUserId,
        collection: currentCollection,
        message
    }).then(data => {
        if (data.success) {
            closeModal();
            alert('Warning sent successfully.');
        }
    });
}

function toggleRestrict(btn) {
    const { id, collection } = getRowData(btn);
    const restrict = confirm('Restrict this user from posting and commenting?');
    apiCall('/admin/users/restrict', { id, collection, restrict }).then(data => {
        if (data.success) alert(restrict ? 'User restricted.' : 'User unrestricted.');
    });
}

function closeModal() {
    document.getElementById('warningModal').style.display = 'none';
    document.getElementById('warningMsg').value = '';
    currentUserId = null;
    currentCollection = null;
}

// Close modal on outside click
window.addEventListener('click', e => {
    const modal = document.getElementById('warningModal');
    if (e.target === modal) closeModal();
});

// ── Filter Tabs ───────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function () {

    // Tab filtering
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;
            document.querySelectorAll('#usersTable tbody tr').forEach(row => {
                if (filter === 'all' || row.dataset.role === filter) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    });

    // Search
    document.getElementById('userSearch').addEventListener('input', function () {
        const query = this.value.toLowerCase();
        document.querySelectorAll('#usersTable tbody tr').forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(query) ? '' : 'none';
        });
    });

});
