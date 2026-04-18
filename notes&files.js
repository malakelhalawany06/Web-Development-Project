function populateListView(){
    const listView=document.getElementById('listView');
    const fileCards=document.querySelectorAll('.file-card');
    listView.innerHTML=`
                <div class="list-header">
                    <span>File Name</span>
                    <span>Course</span>
                    <span>Size</span>
                    <span>Uploaded By</span>
                    <span>Actions</span>
                </div>
            `;
    fileCards.forEach(card=>{
        if(card.style.display!=='none'){
            const fileName=card.querySelector('.file-name').innerText;
            const fileMeta=card.querySelector('.file-meta').innerText;
            const fileSize=card.querySelector('.file-size').innerText;
            const course=fileMeta.split(' • ')[0];
                    const uploadedBy = fileMeta.split(' • ')[1];
                    const sizeOnly = fileSize.split(' • ')[0];
                    const listItem=document.createElement('div');
                    listItem.className='list-item';
                    listItem.innerHTML=`
                        <span>${fileName}</span>
                        <span>${course}</span>
                        <span>${sizeOnly}</span>
                        <span>${uploadedBy}</span>
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
//Search Functionality
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
//Course filtering buttons
const courseTabs=document.querySelectorAll('.course-tab');
courseTabs.forEach(tab=>{
    tab.addEventListener('click',function(){
        courseTabs.forEach(t=>t.classList.remove('active'));
        this.classList.add('active');
        const course=this.dataset.course;
        const fileCards=document.querySelectorAll('.file-card');
        fileCards.forEach(card=>{
            if(course==='all'||card.dataset.course===course){
                 card.classList.remove('hidden');
                card.style.display = 'flex';
            }else{
                 card.classList.add('hidden');
                card.style.display = 'none';
            }
        });
        if(document.getElementById('listView').style.display==='block'){
            populateListView();
        }
    });
});
// Load files from localStorage
// notes&files.js - Keeps existing cards and adds new ones

function loadNotesFiles() {
    const savedFiles = JSON.parse(localStorage.getItem('notesFiles') || '[]');
    const filesGrid = document.getElementById('gridView');
    
    // Get existing file cards that are NOT uploaded ones
    const existingFiles = filesGrid.querySelectorAll('.file-card:not([data-uploaded="true"])');
    
    // Clear ONLY the previously uploaded files (not the original ones)
    const uploadedFiles = filesGrid.querySelectorAll('.file-card[data-uploaded="true"]');
    uploadedFiles.forEach(file => file.remove());
    
    // Add new uploaded files at the top
    savedFiles.forEach(file => {
        const fileCard = createFileCard(file);
        fileCard.setAttribute('data-uploaded', 'true');
        // Insert at the beginning (top)
        filesGrid.insertBefore(fileCard, filesGrid.firstChild);
    });
}

function createFileCard(file) {
    const fileCard = document.createElement('div');
    fileCard.className = 'file-card';
    fileCard.setAttribute('data-course', file.course);
    fileCard.innerHTML = `
        <div class="file-icon">${file.fileIcon}</div>
        <div class="file-info">
            <div class="file-name">${escapeHtml(file.fileName)}</div>
            <div class="file-meta">${escapeHtml(file.fileMeta)}</div>
            <div class="file-size">${escapeHtml(file.fileSize)} • ${file.date}</div>
        </div>
        <div class="file-actions">
            <button class="btn-icon" onclick="downloadFile(this)">⬇️</button>
            <button class="btn-icon" onclick="shareFile(this)">🔗</button>
            <button class="btn-icon" onclick="deleteFile(this)">🗑️</button>
        </div>
    `;
    return fileCard;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function downloadFile(button) {
    const fileName = button.closest('.file-card').querySelector('.file-name').innerText;
    alert(`Downloading "${fileName}"...`);
}

function shareFile(button) {
    const fileName = button.closest('.file-card').querySelector('.file-name').innerText;
    alert(`Sharing "${fileName}"...`);
}

function deleteFile(button) {
    if (confirm('Are you sure you want to delete this file?')) {
        const fileCard = button.closest('.file-card');
        const fileName = fileCard.querySelector('.file-name').innerText;
        
        let savedFiles = JSON.parse(localStorage.getItem('notesFiles') || '[]');
        savedFiles = savedFiles.filter(file => file.fileName !== fileName);
        localStorage.setItem('notesFiles', JSON.stringify(savedFiles));
        
        fileCard.remove();
        alert('File deleted successfully!');
    }
}

// Load files when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadNotesFiles();
});
