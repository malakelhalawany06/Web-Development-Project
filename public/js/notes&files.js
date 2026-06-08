
let API_ENDPOINT = window.notesApiEndpoint || '/api/files/shared';
let currentFileCards = [];

// Load subjects from database for filter chips (based on major AND academic_year)
async function loadSubjectsFromDB() {
    const user = window.currentUser;
    if (!user) return [];
    
    const major = user.major;
    const academic_year = user.academic_year;
    
    console.log('Loading subjects for major:', major, 'year:', academic_year);
    
    try {
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
function populateListView() {
    const listView = document.getElementById('listView');
    const fileCards = document.querySelectorAll('.file-card');
    
    if (!listView) return;
    
    listView.innerHTML = `
        <div class="list-header">
            <span>File Name</span>
            <span>Course</span>
            <span>Size</span>
            <span>Shared By</span>
            <span>Actions</span>
        </div>
    `;
    
    fileCards.forEach(card => {
        if (card.style.display !== 'none') {
            const fileName = card.querySelector('.file-name')?.innerText || '';
            const fileMeta = card.querySelector('.file-meta')?.innerText || '';
            const fileId = card.dataset.id;  // ← Get file ID from grid card
            
            const parts = fileMeta.split(' • ');
            const course = parts[0] || '';
            const sizeOnly = parts[1] || '';
            const sharedBy = parts[2] ? parts[2].replace('Shared by ', '') : '';
            
            const listItem = document.createElement('div');
            listItem.className = 'list-item';
            listItem.dataset.id = fileId;  // ← Store file ID on list item
            
            listItem.innerHTML = `
                <span>${escapeHtml(fileName)}</span>
                <span>${escapeHtml(course)}</span>
                <span>${escapeHtml(sizeOnly)}</span>
                <span>${escapeHtml(sharedBy)}</span>
                <span>
                    <button class="btn-icon" onclick="downloadFromList('${fileId}', '${escapeHtml(fileName)}')">⬇️</button>
                </span>
            `;
            listView.appendChild(listItem);
        }
    });
}

// New function for list view download
async function downloadFromList(fileId, fileName) {
    console.log('Downloading from list:', fileId, fileName);
    
    if (!fileId) {
        alert('Error: File ID not found');
        return;
    }
    
    try {
        const response = await fetch(`/api/files/${fileId}/download`);
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Download failed');
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
    } catch (error) {
        console.error('Error downloading file:', error);
        alert('Failed to download file: ' + error.message);
    }
}

// Load shared files from API
async function loadSharedFiles() {
    try {
        const response = await fetch(API_ENDPOINT);
        if (!response.ok) throw new Error('Failed to load files');
        
        const files = await response.json();
        const filesGrid = document.getElementById('gridView');
        if (!filesGrid) return;
        
        filesGrid.innerHTML = '';
        
        if (!files || files.length === 0) {
            filesGrid.innerHTML = '<div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 2rem;">No shared materials available. Share your first material!</div>';
           
            return;
        }
        
        files.forEach(file => {
            const fileCard = createFileCard(file);
            filesGrid.appendChild(fileCard);
        });
        
        
        await updateSubjectFilterChips();
        
        // Update list view if active
        if (document.getElementById('listView')?.style.display === 'block') {
            populateListView();
        }
        
    } catch (error) {
        console.error('Error loading files:', error);
        const filesGrid = document.getElementById('gridView');
        if (filesGrid) {
            filesGrid.innerHTML = '<div class="card" style="text-align: center; padding: 2rem; color: var(--danger);">Failed to load shared materials. Please refresh the page.</div>';
        }
    }
}

// Download file
async function downloadFile(button) {
    const fileCard = button.closest('.file-card');
    const fileId = fileCard.dataset.id;
    const fileName = fileCard.querySelector('.file-name')?.innerText || 'file';
    
    console.log('Downloading file:', fileId, fileName);
    
    try {
        const response = await fetch(`/api/files/${fileId}/download`);
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Download failed');
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
    } catch (error) {
        console.error('Error downloading file:', error);
        alert('Failed to download file: ' + error.message);
    }
}


// Update subject filter chips
async function updateSubjectFilterChips() {
    const user = window.currentUser;
    if (!user) return;
    
    const subjects = await loadSubjectsFromDB();
    const filterSection = document.querySelector('.filter-section');
    
    if (!filterSection) return;
    
    const chips = [
        { filter: 'all', name: 'All Files' },
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
        
        chipDiv.addEventListener('click', () => {
            document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
            chipDiv.classList.add('active');
            
            const filterValue = chip.filter;
            const fileCards = document.querySelectorAll('.file-card');
            
            fileCards.forEach(card => {
                if (filterValue === 'all') {
                    card.style.display = 'flex';
                } else {
                    const fileSubject = card.querySelector('.file-meta')?.innerText.split('•')[0]?.trim().toLowerCase() || '';
                    const filterName = filterValue.replace(/_/g, ' ').toLowerCase();
                    card.style.display = fileSubject.includes(filterName) ? 'flex' : 'none';
                }
            });
            
            // Update list view if active
            if (document.getElementById('listView')?.style.display === 'block') {
                populateListView();
            }
        });
        
        filterSection.appendChild(chipDiv);
    });
}

// Create file card - ADDED data-is-owner attribute
function createFileCard(file) {
    const fileCard = document.createElement('div');
    fileCard.className = 'file-card';
    fileCard.setAttribute('data-course', file.course);
    fileCard.setAttribute('data-id', file._id || file.id);
    
    const uploaderId = file.uploadedBy?.toString() || file.sharedById?.toString() || '';
    fileCard.setAttribute('data-uploaded-by', uploaderId);
    
    const sharedByName = file.sharedBy || 'Unknown';
    const subject = file.course;
    const fileSizeValue = file.fileSize || '0 MB';
    const date = file.createdAt ? new Date(file.createdAt).toLocaleDateString() : 'Unknown';
    
    const currentUserId = window.currentUser?.id?.toString() || '';
    const isOwner = uploaderId === currentUserId;
    
    // ✅ IMPORTANT: Set the data-is-owner attribute
    fileCard.setAttribute('data-is-owner', isOwner);
    
    fileCard.innerHTML = `
        <div class="file-icon">${file.fileIcon || '📄'}</div>
        <div class="file-info">
            <div class="file-name">${escapeHtml(file.title || file.fileName)}</div>
            <div class="file-meta" style="font-size: 10px; color: var(--text3);">
                ${escapeHtml(subject)} • ${escapeHtml(fileSizeValue)} • Shared by ${escapeHtml(sharedByName)} • ${date}
                ${isOwner ? '<span style="color: var(--accent); margin-left: 8px;">(Your file)</span>' : ''}
            </div>
        </div>
        <div class="file-actions">
            <button class="btn-icon" onclick="downloadFile(this)">⬇️</button>
            <button class="btn-icon" onclick="deleteFile(this)" style="color: #f87171;">🗑️</button>
        </div>
    `;
    return fileCard;
}

// Delete/Hide file function - Updated with cleaner logic
async function deleteFile(button) {
    const fileCard = button.closest('.file-card');
    if (!fileCard) return;
    
    const fileId = fileCard.dataset.id;
    const fileName = fileCard.querySelector('.file-name')?.innerText || 'file';
    const isOwner = fileCard.dataset.isOwner === 'true';
    
    // Different confirmation messages based on ownership
    const message = isOwner 
        ? `⚠️ PERMANENT DELETE: You are the owner of "${fileName}".\n\nThis will delete the file for EVERYONE (all users).\n\nThis action CANNOT be undone!\n\nAre you sure?`
        : `❌ Hide "${fileName}" from your view?\n\nOther users will still be able to see this file.\n\nAre you sure?`;
    
    if (!confirm(message)) {
        return;
    }
    
    try {
        // Show loading state
        const deleteBtn = button;
        deleteBtn.innerHTML = '⏳';
        deleteBtn.disabled = true;
        
        const response = await fetch(`/api/files/${fileId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Operation failed');
        }
        
        const result = await response.json();
        
        // Remove the card with animation
        fileCard.style.transition = 'opacity 0.3s';
        fileCard.style.opacity = '0';
        
        setTimeout(() => {
            fileCard.remove();            
            // Show appropriate success message
            if (result.deletedForEveryone) {
                alert(`✅ "${fileName}" has been permanently deleted for all users.`);
            } else if (result.hiddenForUser) {
                alert(`✅ "${fileName}" has been hidden from your view.`);
            }
            
            // Update list view if active
            if (document.getElementById('listView')?.style.display === 'block') {
                populateListView();
            }
        }, 300);
        
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to delete/hide file: ' + error.message);
        
        // Reset button
        const deleteBtn = button;
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.disabled = false;
    }
}
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// View toggle
function setView(view) { //list or grid
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

// Initialize on page load
document.addEventListener('DOMContentLoaded', async function() {
    await loadSharedFiles();
});