document.addEventListener("DOMContentLoaded", function () {
    // 1. Force the browser to forget any old/empty data
    localStorage.clear(); 
    
    // 2. Force it to load your 6 demo users right now
    UserManager.loadDemoUsers(); 
    
    // 3. Draw the table
    loadUsersIntoTable();
});

function loadUsersIntoTable() {
    const userTableBody = document.getElementById('userTableBody');
    if (!userTableBody) return;

    const allUsers = UserManager.getAllUsers();
    userTableBody.innerHTML = '';

    allUsers.forEach((user, index) => {
        const row = document.createElement('tr');
        
        let roleColor = user.role === 'admin' ? '#ef4444' : (user.role === 'instructor' ? '#a855f7' : '#3b82f6');
        let roleBg = user.role === 'admin' ? 'rgba(239, 68, 68, 0.1)' : (user.role === 'instructor' ? 'rgba(168, 85, 247, 0.1)' : 'rgba(59, 130, 246, 0.1)');

        row.innerHTML = `
            <td>
                <div style="font-weight: 600;">${user.firstName} ${user.lastName}</div>
                <div style="font-size: 0.8em; color: gray;">@${user.username}</div>
            </td>
            <td>${user.email}</td>
            <td>
                <span style="background: ${roleBg}; color: ${roleColor}; padding: 4px 8px; border-radius: 4px; font-size: 0.85em; font-weight: 600;">
                    ${user.role.toUpperCase()}
                </span>
            </td>
            <td>
                <span style="color: #22c55e; font-weight: 500;"><i class="fas fa-circle" style="font-size: 0.6em; margin-right: 4px;"></i> Active</span>
            </td>
            <td>
                <button class="btn btn-small" style="padding: 5px 10px; font-size: 0.85em;" onclick="openModal('${user.username}')"><i class="fas fa-edit"></i> Edit</button>
            </td>
        `;
        
        userTableBody.appendChild(row);
    });
}

function openModal(username = null) {
    document.getElementById('userModal').style.display = 'flex';
    if (username) {
        document.getElementById('modalTitle').innerText = 'Edit User';
        const user = UserManager.getUser(username);
        if (user) {
            document.getElementById('userName').value = user.firstName + ' ' + user.lastName;
            document.getElementById('userEmail').value = user.email;
            const formattedRole = user.role.charAt(0).toUpperCase() + user.role.slice(1);
            document.getElementById('userRole').value = formattedRole;
        }
    } else {
        document.getElementById('modalTitle').innerText = 'Add New User';
        document.getElementById('userForm').reset();
    }
}

function closeModal() {
    document.getElementById('userModal').style.display = 'none';
}

function saveUser(event) {
    event.preventDefault();
    alert("Save functionality clicked! The modal will now close.");
    closeModal();
}