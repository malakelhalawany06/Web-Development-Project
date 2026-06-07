// Get group ID from URL
const urlParams = new URLSearchParams(window.location.search);
const groupId = urlParams.get('id');

console.log('Group ID:', groupId);

if (!groupId) {
    document.getElementById('messagesContainer').innerHTML = '<div style="text-align: center; color: red; padding: 2rem;">Error: No group ID found</div>';
}

let currentGroup = null;
let currentUser = {
    id: '<%= user ? user._id : "" %>',
    name: '<%= user ? user.name : "" %>'  // Changed from user.fullName to user.name
};

let refreshInterval = null;

// Load group details
async function loadGroupDetails() {
    if (!groupId) return;
    
    try {
        const response = await fetch(`/api/groups/${groupId}`);
        if (!response.ok) throw new Error('Failed to load group');
        
        currentGroup = await response.json();
        console.log('Group loaded:', currentGroup.name);
        console.log('Messages:', currentGroup.messages);
        
        document.getElementById('groupName').innerText = currentGroup.name;
        document.getElementById('groupCourse').innerText = currentGroup.course;
        
        updateCounters();
        loadMembers();
        displayMessages();
        displayResources();
        
    } catch (error) {
        console.error('Error:', error);
    }
}

function updateCounters() {
    if (!currentGroup) return;
    document.getElementById('messageCount').innerText = currentGroup.messages?.length || 0;
    document.getElementById('resourceCount').innerText = currentGroup.resources?.length || 0;
    document.getElementById('memberCount').innerText = currentGroup.members?.length || 0;
}

// group-details.js - Check this function
async function loadMembers() {
    try {
        const response = await fetch(`/api/groups/${groupId}/members`);
        const members = await response.json();
        const memberList = document.getElementById('memberList');
        
        if (members.length === 0) {
            memberList.innerHTML = '<div style="color: var(--text3);">No members found</div>';
            return;
        }
        
        memberList.innerHTML = members.map(m => `
            <div class="member-badge">
                👤 ${escapeHtml(m.name)}
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading members:', error);
        document.getElementById('memberList').innerHTML = '<div style="color: var(--danger);">Failed to load members</div>';
    }
}

function displayMessages() {
    const container = document.getElementById('messagesContainer');
    const messages = currentGroup?.messages || [];
    
    if (messages.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: var(--text3); padding: 2rem;">No messages yet. Start the conversation!</div>';
        return;
    }
    
    container.innerHTML = messages.map(msg => `
        <div class="message ${msg.senderId === currentUser.id ? 'sent' : 'received'}">
            <div class="message-bubble">
                <div class="message-sender">${escapeHtml(msg.senderName || 'User')}</div>
                <div class="message-text">${escapeHtml(msg.text)}</div>
                <div class="message-time">${new Date(msg.time).toLocaleString()}</div>
            </div>
        </div>
    `).join('');
    
    container.scrollTop = container.scrollHeight;
}

// SEND MESSAGE FUNCTION - MUST BE GLOBAL
window.sendMessage = async function() {
    const input = document.getElementById('messageInput');
    const text = input.value.trim();
    
    if (!text) return;
    
    console.log('Sending message:', text);
    
    try {
        const response = await fetch(`/api/groups/${groupId}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text })
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('Message sent:', result);
            input.value = '';
            await loadGroupDetails();
        } else {
            const error = await response.json();
            alert('Failed to send message: ' + (error.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to send message');
    }
};

function displayResources() {
    const container = document.getElementById('resourcesContainer');
    const resources = currentGroup?.resources || [];
    
    if (resources.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: var(--text3); padding: 2rem;">No resources shared yet.</div>';
        return;
    }
    
    container.innerHTML = resources.map(res => `
        <div class="resource-item">
            <div class="resource-info">
                <div class="resource-name">${escapeHtml(res.name)}</div>
                <div class="resource-meta">📤 ${escapeHtml(res.uploadedByName || 'User')} • ${new Date(res.uploadedAt).toLocaleDateString()}</div>
                ${res.url ? `
                    <div class="resource-meta">
                        🔗 <a href="${escapeHtml(res.url)}" target="_blank" class="resource-link" onclick="event.stopPropagation()">${escapeHtml(res.url.length > 50 ? res.url.substring(0, 50) + '...' : res.url)}</a>
                    </div>
                ` : ''}
            </div>
            <div class="resource-actions">
                ${res.url ? `<button class="btn btn-primary btn-sm" onclick="window.open('${escapeHtml(res.url)}', '_blank')">🔗 Open Link</button>` : ''}
            </div>
        </div>
    `).join('');
}

// UPLOAD RESOURCE FUNCTION - MUST BE GLOBAL
window.uploadResource = async function() {
    const name = document.getElementById('resourceName').value.trim();
    let url = document.getElementById('resourceUrl').value.trim();
    
    if (!name) {
        alert('Please enter a resource name');
        return;
    }
    
    // Add https:// if user just entered a domain without protocol
    if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }
    
    try {
        const response = await fetch(`/api/groups/${groupId}/resources`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, url: url || '' })
        });
        
        if (response.ok) {
            document.getElementById('resourceName').value = '';
            document.getElementById('resourceUrl').value = '';
            await loadGroupDetails();
        } else {
            const error = await response.json();
            alert('Failed to upload resource: ' + (error.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to upload resource');
    }
};

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Auto-refresh every 3 seconds
if (refreshInterval) clearInterval(refreshInterval);
refreshInterval = setInterval(() => {
    if (groupId) loadGroupDetails();
}, 3000);

// Initial load
loadGroupDetails();