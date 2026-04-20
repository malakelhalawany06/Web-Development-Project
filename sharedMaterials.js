//retrieves the current user’s saved materials from localStorage
function loadUserMaterials() {
    const currentUser = UserManager.getCurrentUser();
    if (!currentUser) return [];
    const key = `user_${currentUser.username}_materials`; //unique storage key, $ lets us insert variables into a string
    const stored = localStorage.getItem(key); 
    return stored ? JSON.parse(stored) : []; //if data exists, convert it from string into an object/array
}
//save current user materials in localStorage/opposite of loading 
function saveUserMaterials(materials) {
    const currentUser = UserManager.getCurrentUser();
    if (!currentUser) return;
    const key = `user_${currentUser.username}_materials`;
    localStorage.setItem(key, JSON.stringify(materials));
}

//renders user shared materials 
function displayMaterials() {
    const feedContainer = document.getElementById('feed-container');
    if (!feedContainer) return;
    
    const currentUser = UserManager.getCurrentUser();
    if (!currentUser) return;
    
    const materials = loadUserMaterials();
    feedContainer.innerHTML = ""; //empty it first 

    const userName = `${currentUser.firstName} ${currentUser.lastName}`; //get username
    const userAvatar = currentUser.firstName.charAt(0) + currentUser.lastName.charAt(0); //get user's initials

    materials.forEach(post => { //loop through each post the user has done 
        const newPost = document.createElement('div');
        newPost.classList.add('card', 'post-card');
        newPost.style.marginBottom = '1.25rem';
        //post with user specifications(name,initials,etc)
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

        feedContainer.prepend(newPost); //add to the top/reverse of append 
    });
}

//gets a diff icon for each file type
function getFileIcon(fileName) {
    if (!fileName) return '📄';
    const ext = fileName.split('.').pop().toLowerCase();
    if (ext === 'pdf') return '📘';
    if (ext === 'zip') return '🗂️';
    if (ext === 'docx' || ext === 'doc') return '📄';
    if (ext === 'jpg' || ext === 'png' || ext === 'jpeg') return '🖼️';
    return '📄';
}



function saveToNotesFiles(title, desc, fileName, fileSize) {
    //get current user
    const currentUser = UserManager.getCurrentUser();
    if (!currentUser) {
        console.log("No user logged in");
        return;
    }
    
    const username = currentUser.username;
    const major = currentUser.major;
    //get existing files for this user
    let userFiles = UserManager.getUserNotesFiles(username);
    
    // Determine course
    let course = 'web';
    let courseName = 'Web Development';
    const text = (title + ' ' + desc).toLowerCase();
    //CS Detection
    if(major==='Computer Science'){
        if(text.includes('calculus')||text.includes('calc')||text.includes('integrartion')||text.includes('derivative')){
            course='calc';
            courseName='Calculus';
        } else if(text.includes('network') || text.includes('tcp') || text.includes('ip') || text.includes('osi')){
            course = 'net';
            courseName = 'Networks';
        } else if(text.includes('database') || text.includes('sql') || text.includes('erd') || text.includes('normalization')){
             course = 'db';
            courseName = 'Database Systems';
        } else if(text.includes('data structure') || text.includes('algorithm') || text.includes('graph') || text.includes('tree')){
             course = 'ds';
            courseName = 'Data Structures';
        } else if(text.includes('web') || text.includes('html') || text.includes('css') || text.includes('javascript')) {
            course = 'web';
            courseName = 'Web Development';
        } //BI Detection
    }else if(major==='Business Informatics'){
        if (text.includes('data analysis') || text.includes('analytics') || text.includes('visualization')) {
            course = 'db';
            courseName = 'Data Analysis';
        } else if (text.includes('marketing') || text.includes('seo') || text.includes('social media')) {
            course = 'marketing';
            courseName = 'Digital Marketing';
        }  else if (text.includes('finance') || text.includes('investment') || text.includes('stock')) {
            course = 'finance';
            courseName = 'Finance';
        } else if (text.includes('business') || text.includes('management') || text.includes('strategy')) {
            course = 'business';
            courseName = 'Business Management';
        }
    } else if(major==='Applied Arts'){
         if (text.includes('graphic') || text.includes('design') || text.includes('illustration') || text.includes('photoshop')) {
            course = 'arts';
            courseName = 'Graphic Design';
        } else if (text.includes('ui') || text.includes('ux') || text.includes('user interface') || text.includes('user experience')) {
            course = 'uiux';
            courseName = 'UI/UX Design';
        }  else if (text.includes('digital art') || text.includes('drawing') || text.includes('sketch')) {
            course = 'digital';
            courseName = 'Digital Art';
        } else if (text.includes('photography') || text.includes('camera') || text.includes('editing')) {
            course = 'photo';
            courseName = 'Photography';
        }
    }   else if (major === 'Law'){
        if (text.includes('constitutional') || text.includes('amendment') || text.includes('rights')) {
            course = 'law';
            courseName = 'Constitutional Law';
        } else if (text.includes('criminal') || text.includes('crime') || text.includes('court')) {
            course = 'criminal';
            courseName = 'Criminal Law';
        } else if (text.includes('international') || text.includes('treaty') || text.includes('global')) {
            course = 'international';
            courseName = 'International Law';
        } else if (text.includes('contract') || text.includes('agreement') || text.includes('legal')) {
            course = 'contract';
            courseName = 'Contract Law';
        }
    }    else if (major === 'Dentistry'){
         if (text.includes('anatomy') || text.includes('human body') || text.includes('skeletal')) {
            course = 'science';
            courseName = 'Human Anatomy';
        } else if (text.includes('pathology') || text.includes('disease') || text.includes('oral')) {
            course = 'pathology';
            courseName = 'Oral Pathology';
        } else if (text.includes('clinical') || text.includes('procedure') || text.includes('patient')) {
            course = 'clinical';
            courseName = 'Clinical Dentistry';
        } else if (text.includes('radiology') || text.includes('x-ray') || text.includes('imaging')) {
            course = 'radiology';
            courseName = 'Dental Radiology';
        } 
    } else if (major === 'Networks'){
         if (text.includes('security') || text.includes('firewall') || text.includes('encryption')) {
            course = 'net';
            courseName = 'Network Security';
        } else if (text.includes('cloud') || text.includes('aws') || text.includes('azure')) {
            course = 'cloud';
            courseName = 'Cloud Computing';
        } else if (text.includes('cyber') || text.includes('hacking') || text.includes('threat')) {
            course = 'security';
            courseName = 'Cyber Security';
        } else if (text.includes('protocol') || text.includes('tcp') || text.includes('ip')) {
            course = 'net';
            courseName = 'Network Protocols';
        }
    }  else if (major === 'System Admin'){
         if (text.includes('server') || text.includes('linux') || text.includes('windows server')) {
            course = 'admin';
            courseName = 'Server Management';
        } else if (text.includes('devops') || text.includes('ci/cd') || text.includes('pipeline')) {
            course = 'devops';
            courseName = 'DevOps';
        } else if (text.includes('cloud') || text.includes('infrastructure')) {
            course = 'cloud';
            courseName = 'Cloud Infrastructure';
        }
    }
    
    const fileIcon = getFileIcon(fileName);
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    
    // Add new file
    userFiles.unshift({ //unshift will add the elements to the beginning of the array, and returns new length of the array
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
//outputs 
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