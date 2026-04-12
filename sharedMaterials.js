document.addEventListener('DOMContentLoaded', () => {

    // --- 1. SEARCH FUNCTIONALITY ---
    const searchInput = document.getElementById('global-search');
    const feedContainer = document.getElementById('feed-container');

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const posts = feedContainer.querySelectorAll('.post-card');

        posts.forEach(post => {
            const title = post.querySelector('.post-title').textContent.toLowerCase();
            const text = post.querySelector('.post-text').textContent.toLowerCase();
            
            if (title.includes(searchTerm) || text.includes(searchTerm)) {
                post.style.display = 'block';
            } else {
                post.style.display = 'none';
            }
        });
    });

    // --- 2. FILE INPUT DISPLAY NAME ---
    const fileInput = document.getElementById('upload-file');
    const fileNameDisplay = document.querySelector('.file-name-display');

    fileInput.addEventListener('change', function() {
        if (this.files && this.files.length > 0) {
            fileNameDisplay.textContent = this.files[0].name;
        } else {
            fileNameDisplay.textContent = "No file chosen";
        }
    });

    // --- 3. COMMENT FUNCTIONALITY ---
    feedContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('send-comment-btn')) {
            const button = e.target;
            const inputField = button.previousElementSibling;
            const commentText = inputField.value.trim();

            if (commentText !== "") {
                const commentsContainer = button.closest('.post-card').querySelector('.comments-container');
                
                const newComment = document.createElement('div');
                newComment.classList.add('comment');
                newComment.innerHTML = `
                    <div class="avatar sm purple">AK</div>
                    <div style="flex: 1;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                            <span style="font-size: 12px; font-weight: 600;">Ahmed Khalid (You)</span>
                            <span style="font-size: 10px; color: var(--text3);">Just now</span>
                        </div>
                        <div style="font-size: 12.5px; color: var(--text2);">${commentText}</div>
                    </div>
                `;
                
                commentsContainer.appendChild(newComment);
                inputField.value = ''; 
            }
        }
    });

    // --- 4. CUSTOM MODAL LOGIC ---
    const modal = document.getElementById('custom-modal');
    const modalMessage = document.getElementById('modal-message');
    const closeModalBtn = document.getElementById('close-modal-btn');

    function showModal(message) {
        modalMessage.textContent = message;
        modal.style.display = 'flex';
    }

    closeModalBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // --- 5. UPLOAD LOGIC ---
    const uploadBtn = document.getElementById('upload-btn');
    const uploadTitleInput = document.getElementById('upload-title');
    const uploadDescInput = document.getElementById('upload-description');

    uploadBtn.addEventListener('click', (e) => {
        e.preventDefault();

        const title = uploadTitleInput.value.trim();
        const desc = uploadDescInput.value.trim();
        const file = fileInput.files[0];

        if (title) {
            const fileName = file ? file.name : "No file attached";
            const fileSize = file ? (file.size / 1024 / 1024).toFixed(1) + ' MB' : '0 MB';
            
            showModal(`Successfully Uploaded: ${title}`);

            const newPost = document.createElement('div');
            newPost.classList.add('card', 'post-card');
            newPost.style.marginBottom = '1.25rem';
            
            newPost.innerHTML = `
                <div class="post-header">
                    <div class="avatar purple">AK</div>
                    <div>
                        <div style="font-size: 14px; font-weight: 500;">Ahmed Khalid (You)</div>
                        <div style="font-size: 11px; color: var(--text3);">Just now</div>
                    </div>
                </div>
                
                <div style="font-size: 15px; font-weight: 600; color: var(--accent); margin-bottom: 8px;" class="post-title">${title}</div>
                <div style="font-size: 13.5px; color: var(--text2); margin-bottom: 15px;" class="post-text">${desc}</div>
                
                ${file ? `
                <div class="file-attachment">
                    <div style="font-size: 24px;">📄</div>
                    <div style="flex: 1;">
                        <div style="font-size: 13px; font-weight: 500;">${fileName}</div>
                        <div style="font-size: 11px; color: var(--text3);">Document • ${fileSize}</div>
                    </div>
                    <button class="btn btn-ghost">Download</button>
                </div>
                ` : ''}

                <div class="comments-container"></div>
                
                <div class="add-comment-box">
                    <input type="text" class="feed-input comment-input" placeholder="Write a reply...">
                    <button class="btn btn-primary send-comment-btn">Reply</button>
                </div>
            `;

            feedContainer.prepend(newPost);

            uploadTitleInput.value = '';
            uploadDescInput.value = '';
            fileInput.value = ''; 
            fileNameDisplay.textContent = "No file chosen";
            
            searchInput.dispatchEvent(new Event('input'));
        } else {
            showModal("Please enter at least a Material Title to upload.");
        }
    });
});