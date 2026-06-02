
let API_ENDPOINT = window.notesApiEndpoint || '/api/files/shared';
// Subjects by major (same as sharedMaterials.js)
const subjectsByMajor = {
    'Computer Science': [
        'Data Structures', 'Algorithms', 'Database Systems', 'Networking',
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
            <span>Shared By</span>
            <span>Actions</span>
        </div>
    `;
    
    fileCards.forEach(card => {
        if (card.style.display !== 'none') {
            const fileName = card.querySelector('.file-name')?.innerText || '';
            const fileMeta = card.querySelector('.file-meta')?.innerText || '';
            const fileSize = card.querySelector('.file-size')?.innerText || '';
            const course = fileMeta.split(' • ')[0] || '';
            const sharedBy = fileMeta.split(' • ')[1] || '';
            const sizeOnly = fileSize.split(' • ')[0] || '';
            
            const listItem = document.createElement('div');
            listItem.className = 'list-item';
            listItem.innerHTML = `
                <span>${escapeHtml(fileName)}</span>
                <span>${escapeHtml(course)}</span>
                <span>${escapeHtml(sizeOnly)}</span>
                <span>${escapeHtml(sharedBy)}</span>
                <span>
                    <button class="btn-icon" onclick="downloadFile(this)">⬇️</button>
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
            const fileName = card.querySelector('.file-name')?.innerText.toLowerCase() || '';
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

// ===== API FUNCTIONS =====

// Load shared files from API (filtered by major + academic year)
async function loadSharedFiles() {
    try {
        const response = await fetch(API_ENDPOINT);
        if (!response.ok) throw new Error('Failed to load files');
        
        const files = await response.json();
        const filesGrid = document.getElementById('gridView');
        if (!filesGrid) return;
        
        filesGrid.innerHTML = '';
        
        files.forEach(file => {
            const fileCard = createFileCard(file);
            filesGrid.appendChild(fileCard);
        });
        
        updateNotesFilesBadge(files.length);
        
        // Update filter chips after loading files
        updateSubjectFilterChips();
    } catch (error) {
        console.error('Error loading files:', error);
        const filesGrid = document.getElementById('gridView');
        if (filesGrid) {
            filesGrid.innerHTML = '<div class="card" style="text-align: center; padding: 2rem; color: var(--danger);">Failed to load shared materials. Please refresh the page.</div>';
        }
    }
}

// Download file
function downloadFile(button) {
    const fileName = button.closest('.file-card')?.querySelector('.file-name')?.innerText || 'file';
    alert(`Downloading "${fileName}"...`);
}

// Update notes badge
function updateNotesFilesBadge(count) {
    const badge = document.getElementById('notesFilesBadge');
    if (badge) badge.textContent = count || 0;
}

// Update subject filter chips
function updateSubjectFilterChips() {
    const user = window.currentUser;
    if (!user) return;
    
    const major = user.major;
    const subjects = subjectsByMajor[major] || subjectsByMajor['Computer Science'];
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
                    if (fileSubject.includes(filterName)) {
                        card.style.display = 'flex';
                    } else {
                        card.style.display = 'none';
                    }
                }
            });
        });
        
        filterSection.appendChild(chipDiv);
    });
}

// Create file card
function createFileCard(file) {
    const fileCard = document.createElement('div');
    fileCard.className = 'file-card';
    fileCard.setAttribute('data-course', file.course);
    fileCard.setAttribute('data-id', file._id || file.id);
    
    const sharedByName = file.sharedBy || 'Unknown';
    const subject = file.course || file.description || 'General';
    const date = file.createdAt ? new Date(file.createdAt).toLocaleDateString() : 'Unknown';
    
    fileCard.innerHTML = `
        <div class="file-icon">${file.fileIcon || '📄'}</div>
        <div class="file-info">
            <div class="file-name">${escapeHtml(file.title || file.fileName)}</div>
            <div class="file-meta" style="font-size: 10px; color: var(--text3);">
                ${escapeHtml(subject)} • ${escapeHtml(file.fileSize || '0 MB')} • Shared by ${escapeHtml(sharedByName)} • ${date}
            </div>
        </div>
        <div class="file-actions">
            <button class="btn-icon" onclick="downloadFile(this)">⬇️</button>
        </div>
    `;
    return fileCard;
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Set current user from window.currentUser (set in EJS)
    if (window.currentUser) {
        console.log('User loaded:', window.currentUser.name);
    }
    loadSharedFiles();
});