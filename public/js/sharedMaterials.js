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

// Load subjects from database
async function loadSubjectsFromDB() {
    const user = getCurrentUser();
    if (!user) return [];
    
    const major = user.major;
    const isInstructor = user.role === 'instructor';
    
    try {
        let url = `/api/subjects?major=${encodeURIComponent(major)}`;
        
        // For students, filter by their academic_year (use academic_year, not academicYear)
        if (!isInstructor && user.academic_year) {
            url += `&year=${user.academic_year}`;
        }
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to load subjects');
        const subjects = await response.json();
        return subjects;
    } catch (error) {
        console.error('Error loading subjects:', error);
        return [];
    }
}

// Populate subject dropdown from database
async function populateSubjectDropdown() {
    const user = getCurrentUser();
    if (!user) return;
    
    const subjects = await loadSubjectsFromDB();
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
        const response = await fetch('/api/shared/my-shared');
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

async function uploadMaterial(title, subject, academic_year, file) {
    const user = getCurrentUser();
    if (!user) {
        console.error('No user found');
        alert('Please login first');
        return false;
    }
    
    console.log('Uploading as user:', user);
    
    // Send as JSON
    const materialData = {
        title: title,
        description: subject,
        course: subject,
        fileName: file ? file.name : "",
        fileSize: file ? (file.size / 1024 / 1024).toFixed(1) + ' MB' : "",
        fileIcon: file ? getFileIcon(file.name) : '📄'
    };
    
    // Only add targetYear if provided (instructor only)
    if (academic_year) {
        materialData.targetYear = academic_year;
    }
    
    try {
        const response = await fetch('/api/shared', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(materialData)
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const error = await response.json();
            console.error('Server error:', error);
            alert('Failed to share: ' + (error.error || 'Unknown error'));
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('Upload error:', error);
        alert('Failed to share. Please try again.');
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
        const academicYearSelect = document.getElementById('upload-academic-year');
        const file = fileInput?.files[0];
        
        if (title === "") {
            showModal("Please enter a Material Title.");
            return;
        }
        
        if (!subject || subject === "") {
            showModal("Please select a subject.");
            return;
        }
        
        // ONLY check academic year if the dropdown EXISTS on the page (instructor only)
        if (academicYearSelect && (!academicYearSelect.value || academicYearSelect.value === "")) {
            showModal("Please select a target academic year.");
            return;
        }
        
        const user = getCurrentUser();
        if (!user) {
            showModal("Please login first.");
            return;
        }
        
        const academic_year = academicYearSelect ? academicYearSelect.value : null;
        
        const success = await uploadMaterial(title, subject, academic_year, file);
        
        if (success) {
            uploadTitleInput.value = '';
            uploadSubjectSelect.value = '';
            if (academicYearSelect) academicYearSelect.value = '';
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
window.onload = async function() {
    if (window.currentUser && window.currentUser.id) {
        currentUser = window.currentUser;
    }
    await populateSubjectDropdown();
    loadMySharedHistory();
};