// Mock Data for Users
let users = [
    { id: 1, name: "Alice Johnson", email: "alice.j@student.edu", role: "Student", status: "Active" },
    { id: 2, name: "Dr. Robert Smith", email: "r.smith@faculty.edu", role: "Instructor", status: "Active" },
    { id: 3, name: "Michael Chang", email: "m.chang@student.edu", role: "Student", status: "Suspended" },
    { id: 4, name: "Sarah Connor", email: "admin.sarah@loomhub.edu", role: "Admin", status: "Active" }
];

// Render Table
function renderUsers() {
    const tbody = document.getElementById('userTableBody');
    tbody.innerHTML = '';

    users.forEach(user => {
        const statusClass = user.status === 'Active' ? 'badge-active' : 'badge-suspended';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${user.name}</strong></td>
            <td>${user.email}</td>
            <td>${user.role}</td>
            <td><span class="badge ${statusClass}">${user.status}</span></td>
            <td>
                <button class="btn btn-small btn-primary-outline" onclick="openModal(${user.id})" title="Edit User">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-small btn-warning" onclick="resetPassword(${user.id})" title="Reset Password">
                    <i class="fas fa-key"></i>
                </button>
                <button class="btn btn-small btn-danger" onclick="deleteUser(${user.id})" title="Delete User">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Modal Logic
function openModal(userId = null) {
    const modal = document.getElementById('userModal');
    const title = document.getElementById('modalTitle');
    const form = document.getElementById('userForm');

    form.reset();

    if (userId) {
        title.innerText = "Edit User";
        const user = users.find(u => u.id === userId);
        document.getElementById('userId').value = user.id;
        document.getElementById('userName').value = user.name;
        document.getElementById('userEmail').value = user.email;
        document.getElementById('userRole').value = user.role;
        document.getElementById('userStatus').value = user.status;
    } else {
        title.innerText = "Add New User";
        document.getElementById('userId').value = "";
    }

    modal.style.display = 'flex';
}

function closeModal() {
    document.getElementById('userModal').style.display = 'none';
}

// Form Submission (Add / Edit)
function saveUser(event) {
    event.preventDefault();
    
    const id = document.getElementById('userId').value;
    const name = document.getElementById('userName').value;
    const email = document.getElementById('userEmail').value;
    const role = document.getElementById('userRole').value;
    const status = document.getElementById('userStatus').value;

    if (id) {
        // Update existing user
        const index = users.findIndex(u => u.id == id);
        users[index] = { id: parseInt(id), name, email, role, status };
    } else {
        // Add new user
        const newId = users.length ? Math.max(...users.map(u => u.id)) + 1 : 1;
        users.push({ id: newId, name, email, role, status });
    }

    closeModal();
    renderUsers();
}

// Action: Delete User
function deleteUser(id) {
    if(confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
        users = users.filter(u => u.id !== id);
        renderUsers();
    }
}

// Action: Reset Password
function resetPassword(id) {
    const user = users.find(u => u.id === id);
    if(confirm(`Send password reset email to ${user.email}?`)) {
        alert(`Password reset link sent to ${user.email}!`);
    }
}

// Initial render
document.addEventListener('DOMContentLoaded', renderUsers);