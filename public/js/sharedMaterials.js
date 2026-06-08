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
async function loadSubjectsFromDB(year) {
    const user = getCurrentUser();
    if (!user) return [];
    
    const major = user.major;
    
    try {
        let url = `/api/subjects?major=${encodeURIComponent(major)}`;
        
        // If year is provided and not 'all', filter by year
        if (year && year !== 'all' && year !== '') {
            url += `&year=${year}`;
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

// Populate subject dropdown based on selected year
async function populateSubjectDropdown() {
    const user = getCurrentUser();
    if (!user) return;
    
    const isInstructor = user.role === 'instructor';
    const yearSelect = document.getElementById('upload-academic-year');
    const subjectSelect = document.getElementById('upload-subject');
    
    // For students, hide year selector and load their year's subjects
    if (!isInstructor) {
        if (yearSelect) yearSelect.style.display = 'none';
        const subjects = await loadSubjectsFromDB(user.academic_year);
        if (subjectSelect) {
            subjectSelect.innerHTML = '<option value="">Select a subject...</option>';
            subjects.forEach(subject => {
                const option = document.createElement('option');
                option.value = subject;
                option.textContent = subject;
                subjectSelect.appendChild(option);
            });
        }
        return;
    }
    
    // For instructors, show year selector and load subjects based on selection
    if (yearSelect) yearSelect.style.display = 'block';
    
    const selectedYear = yearSelect?.value;
    
    if (!selectedYear || selectedYear === '') {
        if (subjectSelect) {
            subjectSelect.innerHTML = '<option value="">Select a year first...</option>';
        }
        return;
    }
    
    const subjects = await loadSubjectsFromDB(selectedYear);
    
    if (subjectSelect) {
        subjectSelect.innerHTML = '<option value="">Select a subject...</option>';
        subjects.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject;
            option.textContent = subject;
            subjectSelect.appendChild(option);
        });
    }
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
            <div class="post-text">${escapeHtml(post.course || '')}</div>

            ${post.fileName ? `
            <div class="file-attachment">
                <div style="font-size: 24px;">${getFileIcon(post.fileName)}</div>
                <div style="flex: 1;">
                    <div style="font-size: 13px; font-weight: 500;">${escapeHtml(post.fileName)}</div>
                    <div style="font-size: 11px; color: var(--text3);">Document • ${post.fileSize}</div>
                </div>
            </div>
            ` : ''}
        `;
        
        feedContainer.appendChild(newPost);
    });
}

async function uploadMaterial(title, subject, academicYear, file) {
    const user = getCurrentUser();
    if (!user) {
        alert('Please login first');
        return false;
    }
    
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', subject);
    formData.append('course', subject);
    if (file) {
        formData.append('file', file);
    }
    if (academicYear) {
        formData.append('targetYear', academicYear);
    }
    
    try {
        const response = await fetch('/api/shared', {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            return true;
        } else {
            const error = await response.json();
            alert('Failed to share: ' + (error.error || 'Unknown error'));
            return false;
        }
    } catch (error) {
        console.error('Upload error:', error);
        alert('Failed to share. Please try again.');
        return false;
    }
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
const uploadAcademicYearSelect = document.getElementById('upload-academic-year');
const fileInput = document.getElementById('upload-file');
const fileNameDisplay = document.querySelector('.file-name-display');

// Listen for academic year change (for instructors)
if (uploadAcademicYearSelect) {
    uploadAcademicYearSelect.addEventListener('change', function() {
        populateSubjectDropdown();
    });
}

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
        const academicYear = uploadAcademicYearSelect?.value;
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
        
        // For instructors, require academic year
        const isInstructor = user.role === 'instructor';
        if (isInstructor && (!academicYear || academicYear === "")) {
            showModal("Please select a target academic year.");
            return;
        }
        
        const success = await uploadMaterial(title, subject, academicYear, file);
        
        if (success) {
            uploadTitleInput.value = '';
            if (uploadAcademicYearSelect) uploadAcademicYearSelect.value = '';
            if (uploadSubjectSelect) uploadSubjectSelect.value = '';
            if (fileInput) fileInput.value = '';
            if (fileNameDisplay) fileNameDisplay.textContent = "No file chosen";
            
            showModal("Material Shared Successfully!");
            
            // Reset subject dropdown for instructors
            if (isInstructor && uploadSubjectSelect) {
                uploadSubjectSelect.innerHTML = '<option value="">Select a year first...</option>';
            }
            
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
    
    const isInstructor = currentUser?.role === 'instructor';
    const yearSelect = document.getElementById('upload-academic-year');
    
    // Hide year selector for students
    if (!isInstructor && yearSelect) {
        yearSelect.style.display = 'none';
    }
    
    await populateSubjectDropdown();
    loadMySharedHistory();
};