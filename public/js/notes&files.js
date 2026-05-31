

let currentFileCards = [];

// Populate List View
function populateListView() {
    const listView = document.getElementById('listView');
    const fileCards = document.querySelectorAll('.file-card');
    listView.innerHTML = `
        <div class="list-header">
            <span>File Name</span>
            <span>Course</span>
            <span>Size</span>
            <span>Uploaded By</span>
            <span>Actions</span>
        </div>
    `;
    
    fileCards.forEach(card => {
        if (card.style.display !== 'none') {
            const fileName = card.querySelector('.file-name').innerText;
            const fileMeta = card.querySelector('.file-meta')?.innerText || '';
            const fileSize = card.querySelector('.file-size')?.innerText || '';
            const course = fileMeta.split(' • ')[0] || '';
            const uploadedBy = fileMeta.split(' • ')[1] || '';
            const sizeOnly = fileSize.split(' • ')[0] || '';
            
            const listItem = document.createElement('div');
            listItem.className = 'list-item';
            listItem.innerHTML = `
                <span>${escapeHtml(fileName)}</span>
                <span>${escapeHtml(course)}</span>
                <span>${escapeHtml(sizeOnly)}</span>
                <span>${escapeHtml(uploadedBy)}</span>
                <span>
                    <button class="btn-icon" onclick="downloadFile(this)">⬇️</button>
                    <button class="btn-icon" onclick="shareFile(this)">🔗</button>
                    <button class="btn-icon" onclick="deleteFile(this)">🗑️</button>
                </span>
            `;
            listView.appendChild(listItem);
        }
    });
}

// Search Functionality
const searchInput = document.querySelector('.topbar-search input');
if (searchInput) {
    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const fileCards = document.querySelectorAll('.file-card');
        
        fileCards.forEach(card => {
            const fileName = card.querySelector('.file-name').innerText.toLowerCase();
            if (fileName.includes(searchTerm)) {
                card.classList.remove('hidden');
                card.style.display = 'flex';
            } else {
                card.classList.add('hidden');
                card.style.display = 'none';
            }
        });
        
        if (document.getElementById('listView').style.display === 'block') {
            populateListView();
        }
    });
}

// Course filtering buttons
const courseTabs = document.querySelectorAll('.course-tab');
courseTabs.forEach(tab => {
    tab.addEventListener('click', function() {
        courseTabs.forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        const course = this.dataset.course;
        const fileCards = document.querySelectorAll('.file-card');
        
        fileCards.forEach(card => {
            if (course === 'all' || card.dataset.course === course) {
                card.classList.remove('hidden');
                card.style.display = 'flex';
            } else {
                card.classList.add('hidden');
                card.style.display = 'none';
            }
        });
        
        if (document.getElementById('listView').style.display === 'block') {
            populateListView();
        }
    });
});

// ===== API FUNCTIONS =====

// Load files from server API
async function loadUserNotesFiles() {
    try {
        const response = await fetch('/api/files');
        if (!response.ok) throw new Error('Failed to load files');
        
        const files = await response.json();
        const filesGrid = document.getElementById('gridView');
        if (!filesGrid) return;
        
        filesGrid.innerHTML = '';
        
        files.forEach(file => {
            const fileCard = createFileCard(file);
            filesGrid.appendChild(fileCard);
        });
        
        updateNotesFilesBadge();
    } catch (error) {
        console.error('Error loading files:', error);
        // Fallback to localStorage if API fails
        loadUserNotesFilesLocal();
    }
}

// Fallback to localStorage
function loadUserNotesFilesLocal() {
    const currentUser = UserManager?.getCurrentUser();
    if (!currentUser) return;
    
    const username = currentUser.username;
    const userFiles = UserManager?.getUserNotesFiles(username) || [];
    const filesGrid = document.getElementById('gridView');
    if (!filesGrid) return;
    
    filesGrid.innerHTML = '';
    
    userFiles.forEach(file => {
        const fileCard = createFileCard(file);
        filesGrid.appendChild(fileCard);
    });
    
    updateNotesFilesBadge();
}

// Create file card from data
function createFileCard(file) {
    const fileCard = document.createElement('div');
    fileCard.className = 'file-card';
    fileCard.setAttribute('data-course', file.course);
    fileCard.setAttribute('data-uploaded', 'true');
    fileCard.setAttribute('data-id', file._id || file.id);
    
    const uploadedByName = file.uploadedBy?.fullName || file.uploadedBy || 'Unknown';
    const date = file.createdAt ? new Date(file.createdAt).toLocaleDateString() : file.date || 'Unknown';
    
    fileCard.innerHTML = `
        <div class="file-icon">${file.fileIcon || '📄'}</div>
        <div class="file-info">
            <div class="file-name">${escapeHtml(file.title || file.fileName)}</div>
            <div class="file-meta" style="font-size: 10px; color: var(--text3);">
                ${escapeHtml(file.description || '')} • ${escapeHtml(file.fileSize || '0 MB')} • Uploaded by ${escapeHtml(uploadedByName)} • ${date}
            </div>
        </div>
        <div class="file-actions">
            <button class="btn-icon" onclick="downloadFile(this)">⬇️</button>
            <button class="btn-icon" onclick="shareFile(this)">🔗</button>
            <button class="btn-icon" onclick="deleteFile(this)">🗑️</button>
        </div>
    `;
    return fileCard;
}

// Download file
function downloadFile(button) {
    const fileName = button.closest('.file-card').querySelector('.file-name').innerText;
    alert(`Downloading "${fileName}"...`);
}

// Share file - open share modal
async function shareFile(button) {
    const fileCard = button.closest('.file-card');
    const fileTitle = fileCard.querySelector('.file-name').innerText;
    const fileId = fileCard.dataset.id;
    
    const email = prompt('Enter the email of the user to share with:');
    if (!email) return;
    
    try {
        const response = await fetch(`/api/files/${fileId}/share`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email })
        });
        
        if (!response.ok) throw new Error('Failed to share file');
        
        alert(`File "${fileTitle}" shared successfully!`);
    } catch (error) {
        console.error('Error sharing file:', error);
        alert('Failed to share file. Please try again.');
    }
}

// Delete file
async function deleteFile(button) {
    if (!confirm('Are you sure you want to delete this file?')) return;
    
    const fileCard = button.closest('.file-card');
    const fileTitle = fileCard.querySelector('.file-name').innerText;
    const fileId = fileCard.dataset.id;
    
    try {
        const response = await fetch(`/api/files/${fileId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete file');
        
        fileCard.remove();
        updateNotesFilesBadge();
        
        if (document.getElementById('listView').style.display === 'block') {
            populateListView();
        }
        
        alert('File deleted successfully!');
    } catch (error) {
        console.error('Error deleting file:', error);
        alert('Failed to delete file. Please try again.');
    }
}

// Update notes badge
async function updateNotesFilesBadge() {
    const badge = document.getElementById('notesFilesBadge');
    if (!badge) return;
    
    try {
        const response = await fetch('/api/files');
        const files = await response.json();
        badge.textContent = files.length;
    } catch (error) {
        console.error('Error updating badge:', error);
        // Fallback to localStorage
        const currentUser = UserManager?.getCurrentUser();
        if (currentUser) {
            const userFiles = UserManager?.getUserNotesFiles(currentUser.username) || [];
            badge.textContent = userFiles.length;
        }
    }
}

// Update course tabs based on user's major
function updateCourseTabs() {
    const currentUser = UserManager?.getCurrentUser();
    if (!currentUser) return;
    
    const major = currentUser.major;
    const courseTabsContainer = document.querySelector('.course-tabs');
    if (!courseTabsContainer) return;
    
    const tabsByMajor = {
        'Computer Science': [
            { course: 'all', name: 'All Courses' },
            { course: 'ds', name: 'Data Structures' },
            { course: 'db', name: 'Database Systems' },
            { course: 'net', name: 'Networks' },
            { course: 'web', name: 'Web Development' }
        ],
        'Business Informatics': [
            { course: 'all', name: 'All Courses' },
            { course: 'db', name: 'Data Analysis' },
            { course: 'business', name: 'Business Analytics' },
            { course: 'marketing', name: 'Marketing' }
        ],
        'Applied Arts': [
            { course: 'all', name: 'All Courses' },
            { course: 'arts', name: 'Graphic Design' },
            { course: 'uiux', name: 'UI/UX Design' },
            { course: 'digital', name: 'Digital Art' }
        ],
        'Law': [
            { course: 'all', name: 'All Courses' },
            { course: 'law', name: 'Constitutional Law' },
            { course: 'criminal', name: 'Criminal Law' },
            { course: 'international', name: 'International Law' }
        ],
        'Dentistry': [
            { course: 'all', name: 'All Courses' },
            { course: 'science', name: 'Human Anatomy' },
            { course: 'pathology', name: 'Oral Pathology' },
            { course: 'clinical', name: 'Clinical Dentistry' }
        ],
        'Networks': [
            { course: 'all', name: 'All Courses' },
            { course: 'net', name: 'Network Security' },
            { course: 'cloud', name: 'Cloud Computing' },
            { course: 'security', name: 'Cyber Security' }
        ],
        'System Admin': [
            { course: 'all', name: 'All Courses' },
            { course: 'admin', name: 'Server Management' },
            { course: 'devops', name: 'DevOps' }
        ]
    };
    
    const tabs = tabsByMajor[major] || tabsByMajor['Computer Science'];
    courseTabsContainer.innerHTML = '';
    
    tabs.forEach(tab => {
        const tabButton = document.createElement('button');
        tabButton.className = 'course-tab';
        if (tab.course === 'all') {
            tabButton.classList.add('active');
        }
        tabButton.setAttribute('data-course', tab.course);
        tabButton.textContent = tab.name;
        
        tabButton.onclick = function() {
            document.querySelectorAll('.course-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            const course = this.dataset.course;
            const fileCards = document.querySelectorAll('.file-card');
            
            fileCards.forEach(card => {
                if (course === 'all' || card.dataset.course === course) {
                    card.classList.remove('hidden');
                    card.style.display = 'flex';
                } else {
                    card.classList.add('hidden');
                    card.style.display = 'none';
                }
            });
            
            if (document.getElementById('listView').style.display === 'block') {
                populateListView();
            }
        };
        
        courseTabsContainer.appendChild(tabButton);
    });
}

// View toggle
function setView(view) {
    const gridView = document.getElementById('gridView');
    const listView = document.getElementById('listView');
    const viewBtns = document.querySelectorAll('.view-btn');
    
    viewBtns.forEach(btn => btn.classList.remove('active'));
    
    if (view === 'grid') {
        gridView.style.display = 'grid';
        listView.style.display = 'none';
        viewBtns[0].classList.add('active');
    } else {
        gridView.style.display = 'none';
        listView.style.display = 'block';
        viewBtns[1].classList.add('active');
        populateListView();
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    updateCourseTabs();
    loadUserNotesFiles();
    updateNotesFilesBadge();
});