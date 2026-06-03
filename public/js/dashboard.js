// Load recent notes for the dashboard card
async function loadRecentNotes() {
    try {
        const response = await fetch('/api/files/shared');
        if (response.ok) {
            const files = await response.json();
            const recentNotes = files.slice(0, 4);
            const container = document.getElementById('recentNotesContainer');
            
            if (!container) return;
            
            if (recentNotes.length === 0) {
                container.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--text3); grid-column: 1/-1;">No notes yet. Share your first note!</div>';
                return;
            }
            
            container.innerHTML = recentNotes.map(file => `
                <div class="note-card" onclick="window.location.href='/notes-files'">
                    <div class="note-icon">${file.fileIcon || '📄'}</div>
                    <div class="note-name">${escapeHtml(file.title || file.fileName)}</div>
                    <div class="note-meta">${escapeHtml(file.course || 'General')}</div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading recent notes:', error);
        const container = document.getElementById('recentNotesContainer');
        if (container) {
            container.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--danger);">Failed to load notes</div>';
        }
    }
}

// Load recent study groups for the dashboard card
async function loadRecentGroups() {
    try {
        const response = await fetch('/api/groups');
        if (response.ok) {
            const groups = await response.json();
            const myGroups = groups.filter(g => g.status === 'joined');
            const recentGroups = myGroups.slice(0, 4);
            const container = document.getElementById('recentGroupsContainer');
            
            if (!container) return;
            
            if (recentGroups.length === 0) {
                container.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--text3);">No study groups yet. Create or join your first group!</div>';
                return;
            }
            
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
            
            container.innerHTML = recentGroups.map(group => `
                <div class="group-item" style="cursor: pointer;" onclick="window.location.href='/group-details?id=${group._id}'">
                    <div class="group-icon gi-blue">${majorEmojis[group.major] || '📚'}</div>
                    <div class="group-info">
                        <div class="name">${escapeHtml(group.name)}</div>
                        <div class="members">${group.memberCount || group.members?.length || 0} members · ${escapeHtml(group.course)}</div>
                    </div>
                    <button class="join-btn joined">✓ Joined</button>
                </div>
            `).join('');
            
            // Update the stats card with joined groups count
            const joinedGroupsCount = document.getElementById('joinedGroupsCount');
            if (joinedGroupsCount) {
                joinedGroupsCount.textContent = myGroups.length;
            }
        }
    } catch (error) {
        console.error('Error loading recent groups:', error);
        const container = document.getElementById('recentGroupsContainer');
        if (container) {
            container.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--danger);">Failed to load groups</div>';
        }
    }
}

// Load joined groups count for stats card
async function loadJoinedGroupsCount() {
    try {
        const response = await fetch('/api/groups');
        if (response.ok) {
            const groups = await response.json();
            const myGroups = groups.filter(g => g.status === 'joined');
            const joinedGroupsCount = document.getElementById('joinedGroupsCount');
            if (joinedGroupsCount) {
                joinedGroupsCount.textContent = myGroups.length;
            }
        }
    } catch (error) {
        console.error('Error loading groups count:', error);
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadRecentNotes();
    loadRecentGroups();
});