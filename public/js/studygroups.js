// studygroups.js

// ===== CONSTANTS (Keep emojis and category mapping) =====
const majorEmojis = {
    'Computer Science': '💻',
    'Business Informatics': '📊',
    'Applied Arts': '🎨',
    'Law': '⚖️',
    'Pharmacy': '💊',
    'Dentistry': '🦷',
    'Networks': '🌐',
    'System Admin': '🖥️',
    'Electrical Engineering': '⚡',
    'Mechanical Engineering': '🔧'
};

const categoryMap = {
    'Computer Science': 'cs',
    'Business Informatics': 'business',
    'Applied Arts': 'arts',
    'Law': 'law',
    'Dentistry': 'science',
    'Pharmacy': 'science',
    'Networks': 'cs',
    'System Admin': 'admin',
    'Electrical Engineering': 'engineering',
    'Mechanical Engineering': 'engineering'
};

function getIconClass(category) {
    const icons = { math: 'purple', engineering: 'cyan', business: 'green', arts: 'pink' };
    return icons[category] || 'blue';
}

function getIcon(category) {
    const icons = { math: '🧮', engineering: '⚡', business: '📊', arts: '🎨' };
    return icons[category] || '💻';
}

// ===== LOAD SUBJECTS FROM DATABASE (based on major AND academic_year) =====
async function loadSubjectsFromDB(major, academic_year) {
    try {
        console.log('Loading subjects for:', { major, academic_year });
        // Get subjects for this specific major AND academic_year
        const response = await fetch(`/api/subjects?major=${encodeURIComponent(major)}&year=${academic_year}`);
        if (!response.ok) throw new Error('Failed to load subjects');
        const subjects = await response.json();
        console.log('Subjects loaded:', subjects);
        return subjects;
    } catch (error) {
        console.error('Error loading subjects:', error);
        return [];
    }
}

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
        // Refresh subjects when opening modal
        populateSubjectsAndMajor();
    }
}

function closeCreateGroupModal() {
    if (modal) {
        modal.classList.remove('show');
    }
    if (form) {
        form.reset();
        // Reset subjects dropdown after closing
        const subjectsSelect = document.getElementById('groupCourse');
        if (subjectsSelect) {
            subjectsSelect.innerHTML = '<option value="">Select a subject...</option>';
        }
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
            joinedHeader.style.gridColumn = '1/-1'; //stretch elements horizontally across the entire width of its CSS Grid container 
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
    
    const majorEmoji = majorEmojis[group.major] || '📚';
    
    card.innerHTML = `
        <div class="group-header">
            <div class="group-icon" style="background: rgba(108, 139, 255, 0.15);">${majorEmoji}</div>
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
        <div class="group-description">${escapeHtml(group.description || 'Study group for ' + group.course)}</div>
        <div class="group-actions">
            <button class="btn btn-outline btn-sm" onclick="viewDetails('${group._id || group.id}')">View Details</button>
            ${group.status === 'joined' 
                ? '<button class="btn btn-success btn-sm" onclick="leaveGroup(this)">✓ Joined</button>'
                : '<button class="btn btn-primary btn-sm" onclick="joinGroup(this)">Join Group</button>'}
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
        const groupDescription = document.getElementById('groupDescription').value;
        
        if (!groupName || !groupCourse || !groupDescription) {
            alert('Please fill in all required fields.');
            return;
        }
        
        const currentUser = UserManager.getCurrentUser();
        const major = currentUser?.major || 'Computer Science';
        const academicYear = currentUser?.academic_year || 1; 
        // Map major to category for filtering
        const category = categoryMap[major] || 'cs';
        
        try {
            const response = await fetch('/api/groups', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: groupName,
                    course: groupCourse,
                    category: category,
                    major: major,
                    academic_year: academicYear,
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
    if (!groupId) {
        alert('Group ID not found');
        return;
    }
    
    // Find the group card to check if user is a member
    const groupCard = document.querySelector(`.group-card[data-id="${groupId}"]`);
    
    if (groupCard) {
        const status = groupCard.getAttribute('data-status');
        
        // Check if user is a member of this group
        if (status !== 'joined') {
            alert('⚠️ You must join this group first to view its details and participate in discussions!');
            return;
        }
    }
    
    // Only navigate if user is a member
    window.location.href = `/group-details?id=${groupId}`;
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

// Update filter chips based on user's major AND academic_year
async function updateFilterChips() {
    const filterSection = document.querySelector('.filter-section');
    if (!filterSection) return;
    
    let currentUser = window.currentUser || (typeof UserManager !== 'undefined' ? UserManager.getCurrentUser() : null);
    if (!currentUser) return;
    
    // Load subjects for this specific major AND academic_year
    const subjects = await loadSubjectsFromDB(currentUser.major, currentUser.academic_year);
    
    const chips = [
        { filter: 'all', name: 'All Groups' },
        { filter: 'available', name: 'Available to Join' },
        { filter: 'joined', name: 'My Groups' },
        ...subjects.map(subject => ({ 
            filter: subject.toLowerCase().replace(/ /g, '_'), 
            name: subject 
        }))
    ];
    
    filterSection.innerHTML = '';
    
    chips.forEach(chip => {
        const chipDiv = document.createElement('div');
        chipDiv.className = 'filter-chip';
        if (chip.filter === 'all') chipDiv.classList.add('active');
        chipDiv.setAttribute('data-filter', chip.filter);
        chipDiv.textContent = chip.name;
        chipDiv.addEventListener('click', (e) => handleFilterClick(chip.filter, e));
        filterSection.appendChild(chipDiv);
    });
}

function handleFilterClick(filterValue, event) {
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    event.target.classList.add('active');
    
    document.querySelectorAll('.group-card').forEach(card => {
        if (filterValue === 'all') {
            card.style.display = '';
        } else if (filterValue === 'available') {
            card.style.display = card.dataset.status === 'available' ? '' : 'none';
        } else if (filterValue === 'joined') {
            card.style.display = card.dataset.status === 'joined' ? '' : 'none';
        } else {
            const courseName = card.querySelector('.group-info p')?.innerText.toLowerCase() || '';
            const filterName = filterValue.replace(/_/g, ' ').toLowerCase();
            card.style.display = courseName.includes(filterName) ? '' : 'none';
        }
    });
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Populate subjects dropdown based on user's major AND academic_year
async function populateSubjectsAndMajor() {
    let currentUser = window.currentUser || (typeof UserManager !== 'undefined' ? UserManager.getCurrentUser() : null);
    if (!currentUser) return;
    
    const major = currentUser.major;
    const subjectsSelect = document.getElementById('groupCourse');
    const majorInput = document.getElementById('groupMajor');
    
    if (majorInput) majorInput.value = major || 'Computer Science';
    if (!subjectsSelect) return;
    
    // Load subjects for this specific major AND academic_year
    const subjects = await loadSubjectsFromDB(major, currentUser.academic_year);
    
    subjectsSelect.innerHTML = '<option value="">Select a subject...</option>';
    subjects.forEach(subject => {
        const option = document.createElement('option');
        option.value = subject;
        option.textContent = subject;
        subjectsSelect.appendChild(option);
    });
}

// Initialize buttons (for join/leave/view details)
function initializeButtons() {
    const joinButtons = document.querySelectorAll('.group-actions .btn-primary.btn-sm, .group-actions .btn-success.btn-sm');
    joinButtons.forEach(button => {
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        if (newButton.innerText === 'Join Group') {
            newButton.onclick = function() { joinGroup(this); };
        } else if (newButton.innerText === '✓ Joined') {
            newButton.onclick = function() { leaveGroup(this); };
        }
    });
    
    const viewButtons = document.querySelectorAll('.group-actions .btn-outline.btn-sm');
    viewButtons.forEach(button => {
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        newButton.onclick = function() { viewDetails(this.dataset.id || this.closest('.group-card')?.dataset.id); };
    });
}

// Update DOMContentLoaded
document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM loaded, initializing...');
    console.log('window.currentUser:', window.currentUser);
    await populateSubjectsAndMajor();
    await updateFilterChips();
    initializeButtons();
    loadUserStudyGroups();
});