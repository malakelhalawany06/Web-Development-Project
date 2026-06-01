// sharedMaterials.js
let currentUser = null;

function getCurrentUser() {
    if (currentUser) return currentUser;
    if (window.currentUser && window.currentUser.id) return window.currentUser;
    return null;
}

function getFileIcon(fileName) {
    if (!fileName) return '📄';
    const ext = fileName.split('.').pop().toLowerCase();
    if (ext === 'pdf') return '📘';
    if (ext === 'zip') return '🗂️';
    if (ext === 'docx' || ext === 'doc') return '📄';
    if (ext === 'jpg' || ext === 'png' || ext === 'jpeg') return '🖼️';
    return '📄';
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Subjects by major
const subjectsByMajor = {
    'Computer Science': [
        'Data Structures', 'Algorithms', 'Database Systems', 'Networks',
        'Web Development', 'Artificial Intelligence', 'Operating Systems', 'Software Engineering'
    ],
    'Business Informatics': [
        'Data Analysis', 'Digital Marketing', 'Business Analytics', 'Finance',
        'E-commerce', 'Supply Chain Management', 'Business Intelligence'
    ],
    'Applied Arts': [
        'Graphic Design', 'UI/UX Design', 'Digital Art', 'Photography',
        'Illustration', 'Motion Graphics', '3D Modeling'
    ],
    'Law': [
        'Constitutional Law', 'Criminal Law', 'International Law', 'Contract Law',
        'Corporate Law', 'Human Rights', 'Legal Writing'
    ],
    'Pharmacy': [
        'Pharmacology', 'Pharmaceutical Chemistry', 'Clinical Pharmacy', 'Pharmacotherapy',
        'Drug Delivery Systems', 'Toxicology', 'Pharmacy Practice', 'Medicinal Chemistry'
    ],
    'Dentistry': [
        'Human Anatomy', 'Oral Pathology', 'Clinical Dentistry', 'Dental Radiology',
        'Orthodontics', 'Periodontics', 'Oral Surgery'
    ],
    'Networks': [
        'Network Security', 'Cloud Computing', 'Cyber Security', 'Network Protocols',
        'Routing & Switching', 'Wireless Networks'
    ],
    'System Admin': [
        'Server Management', 'DevOps', 'Cloud Infrastructure', 'Linux Administration',
        'Windows Server', 'Virtualization'
    ]
};

// Populate subject dropdown
function populateSubjectDropdown() {
    const user = getCurrentUser();
    if (!user) return;
    
    const major = user.major;
    const subjects = subjectsByMajor[major] || subjectsByMajor['Computer Science'];
    const subjectSelect = document.getElementById('upload-subject');
    
    if (!subjectSelect) return;
    
    subjectSelect.innerHTML = '<option value="">Select a subject...</option>';
    subjects.forEach(subject => {
        const option = document.createElement('option');
        option.value = subject;
        option.textContent = subject;
        subjectSelect.appendChild(option);
    });
}

// Load user's own shared materials history
async function loadMySharedHistory() {
    try {
        const response = await fetch('/api/shared');
        if (!response.ok) throw new Error('Failed to load');
        const materials = await response.json();
        displayMyMaterials(materials);
    } catch (error) {
        console.error('Error:', error);
    }
}

function displayMyMaterials(materials) {
    const feedContainer = document.getElementById('feed-container');
    if (!feedContainer) return;
    
    if (!materials || materials.length === 0) {
        feedContainer.innerHTML = '<div class="card" style="text-align: center; padding: 2rem; color: var(--text3);">You haven\'t shared any materials yet.</div>';
        return;
    }
    
    feedContainer.innerHTML = '';
    
    materials.forEach(post => {
        const newPost = document.createElement('div');
        newPost.classList.add('card', 'post-card');
        newPost.style.marginBottom = '1.25rem';
        
        newPost.innerHTML = `
            <div class="post-header">
                <div class="avatar purple">${escapeHtml(currentUser?.name?.charAt(0) || 'U')}</div>
                <div>
                    <div style="font-size: 14px; font-weight: 500;">${escapeHtml(currentUser?.name)} (You)</div>
                    <div style="font-size: 11px; color: var(--text3);">${new Date(post.createdAt).toLocaleString()}</div>
                </div>
            </div>

            <div class="post-title">${escapeHtml(post.title)}</div>
            <div class="post-text">${escapeHtml(post.description || post.course || '')}</div>

            ${post.fileName ? `
            <div class="file-attachment">
                <div style="font-size: 24px;">${getFileIcon(post.fileName)}</div>
                <div style="flex: 1;">
                    <div style="font-size: 13px; font-weight: 500;">${escapeHtml(post.fileName)}</div>
                    <div style="font-size: 11px; color: var(--text3);">Document • ${post.fileSize}</div>
                </div>
                <button class="btn btn-ghost" onclick="downloadFile('${post.fileName}')">Download</button>
            </div>
            ` : ''}
        `;
        
        feedContainer.appendChild(newPost);
    });
}

async function uploadMaterial(title, subject, file) {
    const user = getCurrentUser();
    if (!user) return false;
    
    const materialData = {
        title: title,
        description: subject,  // Use subject as description
        fileName: file ? file.name : "",
        fileSize: file ? (file.size / 1024 / 1024).toFixed(1) + ' MB' : "",
        fileIcon: file ? getFileIcon(file.name) : '📄',
        course: subject  // Store subject as course
    };
    
    try {
        const response = await fetch('/api/shared', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(materialData)
        });
        
        return response.ok;
    } catch (error) {
        console.error('Upload error:', error);
        return false;
    }
}

function downloadFile(fileName) {
    alert(`Downloading "${fileName}"...`);
}

// Search functionality
const searchInput = document.getElementById('global-search');
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const posts = document.querySelectorAll('.post-card');
        posts.forEach(post => {
            const title = post.querySelector('.post-title')?.textContent.toLowerCase() || '';
            const text = post.querySelector('.post-text')?.textContent.toLowerCase() || '';
            post.style.display = title.includes(searchTerm) || text.includes(searchTerm) ? '' : 'none';
        });
    });
}

// Modal functions
const modal = document.getElementById('custom-modal');
const modalMessage = document.getElementById('modal-message');
const closeModalBtn = document.getElementById('close-modal-btn');

function showModal(message) {
    if (modal && modalMessage) {
        modalMessage.textContent = message;
        modal.style.display = 'flex';
    }
}

if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
        if (modal) modal.style.display = 'none';
    });
}

window.onclick = function(event) {
    if (event.target === modal) {
        if (modal) modal.style.display = 'none';
    }
}

// Upload button handler
const uploadBtn = document.getElementById('upload-btn');
const uploadTitleInput = document.getElementById('upload-title');
const uploadSubjectSelect = document.getElementById('upload-subject');
const fileInput = document.getElementById('upload-file');
const fileNameDisplay = document.querySelector('.file-name-display');

if (fileInput) {
    fileInput.addEventListener('change', function() {
        fileNameDisplay.textContent = this.files.length > 0 ? this.files[0].name : "No file chosen";
    });
}

if (uploadBtn) {
    uploadBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        
        const title = uploadTitleInput.value.trim();
        const subject = uploadSubjectSelect?.value;
        const file = fileInput?.files[0];
        
        if (title === "") {
            showModal("Please enter a Material Title.");
            return;
        }
        
        if (!subject || subject === "") {
            showModal("Please select a subject.");
            return;
        }
        
        const user = getCurrentUser();
        if (!user) {
            showModal("Please login first.");
            return;
        }
        
        const success = await uploadMaterial(title, subject, file);
        
        if (success) {
            uploadTitleInput.value = '';
            if (uploadSubjectSelect) uploadSubjectSelect.value = '';
            if (fileInput) fileInput.value = '';
            if (fileNameDisplay) fileNameDisplay.textContent = "No file chosen";
            
            showModal("Material Shared Successfully!");
            
            // Reload history
            loadMySharedHistory();
        } else {
            showModal("Failed to share. Please try again.");
        }
    });
}

// Initialize
window.onload = function() {
    if (window.currentUser && window.currentUser.id) {
        currentUser = window.currentUser;
    }
    populateSubjectDropdown();
    loadMySharedHistory();
};