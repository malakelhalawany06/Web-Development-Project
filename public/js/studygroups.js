// Search functionality
const searchInput = document.getElementById('groupSearchInput');
let groupCards = document.querySelectorAll('.group-card');

if (searchInput) {
    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        
        groupCards.forEach(card => {
            const title = card.querySelector('h3')?.innerText.toLowerCase() || '';
            const course = card.querySelector('.group-info p')?.innerText.toLowerCase() || '';
            
            if (title.includes(searchTerm) || course.includes(searchTerm)) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    });
}

const modal = document.getElementById('createGroupModal');
const form = document.getElementById('createGroupForm');

function openCreateGroupModal() {
    if (modal) {
        modal.classList.add('show');
    }
}

function closeCreateGroupModal() {
    if (modal) {
        modal.classList.remove('show');
    }
    if (form) {
        form.reset();
    }
}

window.onclick = function(event) {
    if (modal && event.target === modal) {
        closeCreateGroupModal();
    }
}

// ===== API FUNCTIONS =====


// Load groups from server
async function loadUserStudyGroups() {
    try {
        const response = await fetch('/api/groups');
        if (!response.ok) throw new Error('Failed to load groups');
        
        const groups = await response.json();
        const groupsGrid = document.getElementById('groupsGrid');
        if (!groupsGrid) return;
        
        groupsGrid.innerHTML = '';
        
        // Separate joined and available groups
        const joinedGroups = groups.filter(g => g.status === 'joined');
        const availableGroups = groups.filter(g => g.status === 'available');
        
        // Display joined groups first
        if (joinedGroups.length > 0) {
            const joinedHeader = document.createElement('div');
            joinedHeader.className = 'section-header';
            joinedHeader.innerHTML = '<h3>📘 My Study Groups</h3>';
            joinedHeader.style.gridColumn = '1/-1';
            groupsGrid.appendChild(joinedHeader);
            
            joinedGroups.forEach(group => {
                const groupCard = createGroupCard(group);
                groupsGrid.appendChild(groupCard);
            });
        }
        
        // Display available groups
        if (availableGroups.length > 0) {
            const availableHeader = document.createElement('div');
            availableHeader.className = 'section-header';
            availableHeader.innerHTML = '<h3>🔍 Groups You Can Join (Same Major)</h3>';
            availableHeader.style.gridColumn = '1/-1';
            groupsGrid.appendChild(availableHeader);
            
            availableGroups.forEach(group => {
                const groupCard = createGroupCard(group);
                groupsGrid.appendChild(groupCard);
            });
        }
        
        if (groups.length === 0) {
            groupsGrid.innerHTML = '<div style="text-align: center; padding: 2rem; grid-column: 1/-1;">No groups available. Create your first study group!</div>';
        }
        
        groupCards = document.querySelectorAll('.group-card');
        updateStudyGroupsBadge();
    } catch (error) {
        console.error('Error loading groups:', error);
    }
}
// Create group card from data
function createGroupCard(group) {
    const card = document.createElement('div');
    card.className = 'group-card';
    card.setAttribute('data-status', group.status || 'available');
    card.setAttribute('data-category', group.category);
    card.setAttribute('data-id', group._id || group.id);
    
    let iconClass = 'blue';
    let icon = '💻';
    if (group.category === 'math') {
        icon = '🧮';
        iconClass = 'purple';
    } else if (group.category === 'engineering') {
        icon = '⚡';
        iconClass = 'cyan';
    } else if (group.category === 'business') {
        icon = '📊';
        iconClass = 'green';
    } else if (group.category === 'arts') {
        icon = '🎨';
        iconClass = 'pink';
    }
    
    card.innerHTML = `
        <div class="group-header">
            <div class="group-icon ${iconClass}">${icon}</div>
            <div class="group-info">
                <h3>${escapeHtml(group.name)}</h3>
                <p>${escapeHtml(group.course)}</p>
            </div>
        </div>
        <div class="group-stats">
            <div class="stat">👥 ${group.memberCount || group.members?.length || 0} members</div>
            <div class="stat">📝 ${group.resourceCount || 0} resources</div>
            <div class="stat">💬 ${group.messageCount || 0} messages</div>
        </div>
        <div class="group-description">
            ${escapeHtml(group.description || 'Study group for ' + group.course)}
        </div>
        <div class="group-major" style="font-size: 11px; color: var(--text3); margin-bottom: 8px;">
            🎓 ${escapeHtml(group.major || 'All Majors')} • Created by ${escapeHtml(group.createdByName || 'Someone')}
        </div>
        <div class="group-actions">
            <button class="btn btn-outline btn-sm" onclick="viewDetails('${group._id || group.id}')">View Details</button>
            ${group.status === 'joined' 
                ? '<button class="btn btn-success btn-sm" onclick="leaveGroup(this)">✓ Joined</button>'
                : '<button class="btn btn-primary btn-sm" onclick="joinGroup(this)">Join Group</button>'
            }
        </div>
    `;
    return card;
}
// Create new group via API
if (form) {
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const groupName = document.getElementById('groupName').value;
        const groupCourse = document.getElementById('groupCourse').value;
        const groupCategory = document.getElementById('groupCategory').value;
        const groupDescription = document.getElementById('groupDescription').value;
        
        // Validate required fields
        if (!groupName || !groupCourse || !groupDescription) {
            alert('Please fill in all required fields.');
            return;
        }
        
        try {
            const response = await fetch('/api/groups', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: groupName,
                    course: groupCourse,
                    category: groupCategory,
                    description: groupDescription
                })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create group');
            }
            
            const newGroup = await response.json();
            const groupsGrid = document.getElementById('groupsGrid');
            const groupCard = createGroupCard(newGroup);
            
            if (groupsGrid) {
                groupsGrid.prepend(groupCard);
            }
            
            groupCards = document.querySelectorAll('.group-card');
            closeCreateGroupModal();
            alert('Group "' + groupName + '" created successfully!');
            updateStudyGroupsBadge();
            
        } catch (error) {
            console.error('Error creating group:', error);
            alert('Failed to create group. Please try again.');
        }
    });
}

// Join a group
async function joinGroup(button) {
    const groupCard = button.closest('.group-card');
    const groupId = groupCard.dataset.id;
    const groupName = groupCard.querySelector('h3').innerText;
    
    try {
        const response = await fetch(`/api/groups/${groupId}/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to join group');
        }
        
        button.innerText = '✓ Joined';
        button.classList.remove('btn-primary');
        button.classList.add('btn-success');
        groupCard.setAttribute('data-status', 'joined');
        
        const memberStat = groupCard.querySelector('.stat:first-child');
        const currentMembers = parseInt(memberStat.innerText.match(/\d+/)[0]);
        memberStat.innerHTML = `👥 ${currentMembers + 1} members`;
        
        button.onclick = function() { leaveGroup(this); };
        alert(`You joined "${groupName}".`);
        updateStudyGroupsBadge();
        
    } catch (error) {
        console.error('Error joining group:', error);
        alert('Failed to join group. Please try again.');
    }
}

// Leave a group
async function leaveGroup(button) {
    const groupCard = button.closest('.group-card');
    const groupId = groupCard.dataset.id;
    const groupName = groupCard.querySelector('h3').innerText;
    
    try {
        const response = await fetch(`/api/groups/${groupId}/leave`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to leave group');
        }
        
        button.innerText = 'Join Group';
        button.classList.remove('btn-success');
        button.classList.add('btn-primary');
        groupCard.setAttribute('data-status', 'available');
        
        const memberStat = groupCard.querySelector('.stat:first-child');
        const currentMembers = parseInt(memberStat.innerText.match(/\d+/)[0]);
        memberStat.innerHTML = `👥 ${currentMembers - 1} members`;
        
        button.onclick = function() { joinGroup(this); };
        alert(`You left "${groupName}".`);
        updateStudyGroupsBadge();
        
    } catch (error) {
        console.error('Error leaving group:', error);
        alert('Failed to leave group. Please try again.');
    }
}

// View details - open modal or redirect
function viewDetails(groupId) {
    if (groupId) {
        window.location.href = `/group-details?id=${groupId}`;
    } else {
        alert('Group ID not found');
    }
}

// Update badge count
async function updateStudyGroupsBadge() {
    const badge = document.getElementById('studyGroupsBadge');
    if (!badge) return;
    
    try {
        const response = await fetch('/api/groups');
        const groups = await response.json();
        const joinedCount = groups.filter(group => group.status === 'joined').length;
        badge.textContent = joinedCount;
    } catch (error) {
        console.error('Error updating badge:', error);
        badge.textContent = '0';
    }
}

// Filter chips - updated to work with API loaded cards
function updateFilterChips() {
    const filterSection = document.querySelector('.filter-section');
    if (!filterSection) return;
    
    const chips = [
        { filter: 'all', name: 'All Groups' },
        { filter: 'available', name: 'Available to Join' },
        { filter: 'joined', name: 'My Groups' },
        { filter: 'cs', name: 'Computer Science' },
        { filter: 'math', name: 'Mathematics' },
        { filter: 'engineering', name: 'Engineering' }
    ];
    
    filterSection.innerHTML = '';
    
    chips.forEach(chip => {
        const chipDiv = document.createElement('div');
        chipDiv.className = 'filter-chip';
        if (chip.filter === 'all') {
            chipDiv.classList.add('active');
        }
        chipDiv.setAttribute('data-filter', chip.filter);
        chipDiv.textContent = chip.name;
        
        chipDiv.addEventListener('click', function() {
            document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            
            const filterValue = this.dataset.filter;
            const allGroupCards = document.querySelectorAll('.group-card');
            
            allGroupCards.forEach(card => {
                if (filterValue === 'all') {
                    card.style.display = '';
                } else if (filterValue === 'available') {
                    if (card.dataset.status === 'available') {
                        card.style.display = '';
                    } else {
                        card.style.display = 'none';
                    }
                } else if (filterValue === 'joined') {
                    if (card.dataset.status === 'joined') {
                        card.style.display = '';
                    } else {
                        card.style.display = 'none';
                    }
                } else {
                    if (card.dataset.category === filterValue) {
                        card.style.display = '';
                    } else {
                        card.style.display = 'none';
                    }
                }
            });
        });
        
        filterSection.appendChild(chipDiv);
    });
}

// Populate category dropdown
function populateCategoryDropdown() {
    const categorySelect = document.getElementById('groupCategory');
    if (!categorySelect) return;
    
    const categories = [
        { value: 'cs', name: 'Computer Science' },
        { value: 'math', name: 'Mathematics' },
        { value: 'engineering', name: 'Engineering' },
        { value: 'business', name: 'Business' },
        { value: 'arts', name: 'Arts' },
        { value: 'science', name: 'Science' },
        { value: 'law', name: 'Law' }
    ];
    
    categorySelect.innerHTML = '';
    
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.value;
        option.textContent = cat.name;
        categorySelect.appendChild(option);
    });
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    populateCategoryDropdown();
    updateFilterChips();
    loadUserStudyGroups();
});