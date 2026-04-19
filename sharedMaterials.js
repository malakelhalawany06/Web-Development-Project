
function loadUserMaterials() {
    const currentUser = UserManager.getCurrentUser();
    if (!currentUser) return [];
    const key = `user_${currentUser.username}_materials`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
}

function saveUserMaterials(materials) {
    const currentUser = UserManager.getCurrentUser();
    if (!currentUser) return;
    const key = `user_${currentUser.username}_materials`;
    localStorage.setItem(key, JSON.stringify(materials));
}


function displayMaterials() {
    const feedContainer = document.getElementById('feed-container');
    if (!feedContainer) return;
    
    const currentUser = UserManager.getCurrentUser();
    if (!currentUser) return;
    
    const materials = loadUserMaterials();
    feedContainer.innerHTML = "";

    const userName = `${currentUser.firstName} ${currentUser.lastName}`;
    const userAvatar = currentUser.firstName.charAt(0) + currentUser.lastName.charAt(0);

    materials.forEach(post => {
        const newPost = document.createElement('div');
        newPost.classList.add('card', 'post-card');
        newPost.style.marginBottom = '1.25rem';
        
        newPost.innerHTML = `
            <div class="post-header">
                <div class="avatar purple">${userAvatar}</div>
                <div>
                    <div style="font-size: 14px; font-weight: 500;">${userName} (You)</div>
                    <div style="font-size: 11px; color: var(--text3);">${post.date}</div>
                </div>
            </div>

            <div class="post-title">${post.title}</div>
            <div class="post-text">${post.desc}</div>

            ${post.fileName ? `
            <div class="file-attachment">
                <div style="font-size: 24px;">${getFileIcon(post.fileName)}</div>
                <div style="flex: 1;">
                    <div style="font-size: 13px; font-weight: 500;">${post.fileName}</div>
                    <div style="font-size: 11px; color: var(--text3);">Document • ${post.fileSize}</div>
                </div>
                <button class="btn btn-ghost" onclick="downloadFile('${post.fileName}')">Download</button>
            </div>
            ` : ''}

            <div class="comments-container"></div>

            <div class="add-comment-box">
                <input type="text" class="feed-input comment-input" placeholder="Write a reply...">
                <button class="btn btn-primary send-comment-btn">Reply</button>
            </div>
        `;

        feedContainer.prepend(newPost);
    });
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


// Inside your upload button click handler, add this save function
function saveToNotesFiles(title, desc, fileName, fileSize) {
    // Get current user
    const currentUser = UserManager.getCurrentUser();
    if (!currentUser) {
        console.log("No user logged in");
        return;
    }
    
    const username = currentUser.username;
    
    // Get existing files for this user
    let userFiles = UserManager.getUserNotesFiles(username);
    
    // Determine course
    let course = 'web';
    let courseName = 'Web Development';
    const text = (title + ' ' + desc).toLowerCase();
    
    if (text.includes('calculus')) {
        course = 'calc';
        courseName = 'Calculus II';
    } else if (text.includes('database')) {
        course = 'db';
        courseName = 'Database Systems';
    } else if (text.includes('network')) {
        course = 'net';
        courseName = 'Networks';
    } else if (text.includes('data structure')) {
        course = 'ds';
        courseName = 'Data Structures';
    }
    
    const fileIcon = getFileIcon(fileName);
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    
    // Add new file
    userFiles.unshift({
        fileName: fileName,
        title: title,           
        description: desc, 
        fileMeta: `${courseName} • Uploaded by ${currentUser.firstName} ${currentUser.lastName}`,
        fileSize: fileSize,
        fileIcon: fileIcon,
        course: course,
        date: dateStr,
        uploadedBy: currentUser.username
    });
    
    // Save back to user-specific storage
    UserManager.saveUserNotesFiles(username, userFiles);
    
    console.log("File saved for user:", username);
}
function downloadFile(fileName) {
    alert(`Downloading "${fileName}"...`);
}


window.onload = function () {

    const searchInput = document.getElementById('global-search');
    const feedContainer = document.getElementById('feed-container');
    const fileInput = document.getElementById('upload-file');
    const fileNameDisplay = document.querySelector('.file-name-display');
    const uploadBtn = document.getElementById('upload-btn');
    const uploadTitleInput = document.getElementById('upload-title');
    const uploadDescInput = document.getElementById('upload-description');

    const modal = document.getElementById('custom-modal');
    const modalMessage = document.getElementById('modal-message');
    const closeModalBtn = document.getElementById('close-modal-btn');

   
    displayMaterials();

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const posts = feedContainer.querySelectorAll('.post-card');

            posts.forEach(post => {
                const title = post.querySelector('.post-title')?.textContent.toLowerCase() || '';
                const text = post.querySelector('.post-text')?.textContent.toLowerCase() || '';

                if (title.includes(searchTerm) || text.includes(searchTerm)) {
                    post.style.display = 'block';
                } else {
                    post.style.display = 'none';
                }
            });
        });
    }

    if (fileInput) {
        fileInput.addEventListener('change', function () {
            if (this.files.length > 0) {
                fileNameDisplay.textContent = this.files[0].name;
            } else {
                fileNameDisplay.textContent = "No file chosen";
            }
        });
    }

    if (feedContainer) {
    feedContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('send-comment-btn')) {
            const inputField = e.target.previousElementSibling;
            const commentText = inputField.value.trim();

            if (commentText !== "") {
                const currentUser = UserManager.getCurrentUser();
                const userName = currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Ahmed Khalid';
                const userAvatar = currentUser ? currentUser.firstName.charAt(0) + currentUser.lastName.charAt(0) : 'AK';
                
                const commentsContainer = e.target.closest('.post-card').querySelector('.comments-container');

                const newComment = document.createElement('div');
                newComment.classList.add('comment');
                newComment.innerHTML = `
                    <div class="avatar sm purple">${userAvatar}</div>
                    <div style="flex: 1;">
                        <div style="display: flex; justify-content: space-between;">
                            <span style="font-size: 12px; font-weight: 600;">${userName} (You)</span>
                            <span style="font-size: 10px;">Just now</span>
                        </div>
                        <div style="font-size: 12.5px;">${commentText}</div>
                    </div>
                `;

                commentsContainer.appendChild(newComment);
                inputField.value = '';
            }
        }
    });
}

   //Modal
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

    // Close modal when clicking outside
    window.onclick = function(event) {
        if (event.target === modal) {
            if (modal) modal.style.display = 'none';
        }
    }


if (uploadBtn) {
    uploadBtn.addEventListener('click', (e) => {
        e.preventDefault();

        const title = uploadTitleInput.value.trim();
        const desc = uploadDescInput.value.trim();
        const file = fileInput.files[0];

        if (title === "") {
            showModal("Please enter a Material Title.");
            return;
        }

        const currentUser = UserManager.getCurrentUser();
        if (!currentUser) {
            showModal("Please login first.");
            return;
        }

        const now = new Date();
        const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        let newMaterial = {
            title: title,
            desc: desc,
            fileName: file ? file.name : "",
            fileSize: file ? (file.size / 1024 / 1024).toFixed(1) + ' MB' : "",
            date: `${dateStr} at ${timeStr}`
        };

        let materials = loadUserMaterials();
        materials.unshift(newMaterial);
        saveUserMaterials(materials);
        displayMaterials();

        // SAVE TO NOTES & FILES PAGE
        if (file) {
            saveToNotesFiles(title, desc, file.name, (file.size / 1024 / 1024).toFixed(1) + ' MB');
        }

        // clear inputs
        uploadTitleInput.value = '';
        uploadDescInput.value = '';
        fileInput.value = '';
        if (fileNameDisplay) fileNameDisplay.textContent = "No file chosen";

        showModal("Material Uploaded Successfully!");
    });
}
};