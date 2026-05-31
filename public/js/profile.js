document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('profile-upload');
    const mainAvatar = document.getElementById('main-avatar');
    const sidebarAvatarContainer = document.querySelector('.sidebar-profile .avatar');
    const topbarAvatar = document.querySelector('.topbar-right .avatar.sm');

    // Ensure the sidebar element displays an img instead of static text initials
    let sidebarImg = sidebarAvatarContainer ? sidebarAvatarContainer.querySelector('img') : null;
    if (sidebarAvatarContainer && !sidebarImg) {
        sidebarImg = document.createElement('img');
        sidebarImg.style.width = '100%';
        sidebarImg.style.height = '100%';
        sidebarImg.style.borderRadius = '50%';
        sidebarImg.style.objectFit = 'cover';
        sidebarAvatarContainer.innerHTML = ''; 
        sidebarAvatarContainer.appendChild(sidebarImg);
    }

    // Ensure the topbar element displays an img instead of text initials
    let topbarImg = topbarAvatar ? topbarAvatar.querySelector('img') : null;
    if (topbarAvatar && !topbarImg) {
        topbarImg = document.createElement('img');
        topbarImg.style.width = '100%';
        topbarImg.style.height = '100%';
        topbarImg.style.borderRadius = '50%';
        topbarImg.style.objectFit = 'cover';
        topbarAvatar.innerHTML = '';
        topbarAvatar.appendChild(topbarImg);
    }

    // Handle Profile Picture File Selection & Upload Processing
    if (fileInput) {
        fileInput.addEventListener('change', async function(event) {
            const file = event.target.files[0];
            if (!file) return;

            // Simple validation check for image properties
            if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
                alert('Please select a valid JPEG or PNG image.');
                fileInput.value = '';
                return;
            }

            // Prepare the multipart form data for transmission
            const formData = new FormData();
            formData.append('avatar', file);

            try {
                // Submit the asset directly to our backend express route API
                const response = await fetch('/api/user/upload-avatar', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (result.success) {
                    const freshUrlWithCacheBuster = `${result.url}?t=${Date.now()}`;
                    
                    // Instantly update all structural imagery items across the viewport window
                    if (mainAvatar) mainAvatar.src = freshUrlWithCacheBuster;
                    if (sidebarImg) sidebarImg.src = freshUrlWithCacheBuster;
                    if (topbarImg) topbarImg.src = freshUrlWithCacheBuster;
                    
                    alert('Profile picture updated successfully!');
                } else {
                    alert('Upload failed: ' + (result.error || 'Unknown error occurred.'));
                }
            } catch (error) {
                console.error('Error during avatar upload processing:', error);
                alert('An error occurred during file upload transmission.');
            }
        });
    }
});

// Topbar Date Initialization Script Engine
document.addEventListener("DOMContentLoaded", function () {
    const el = document.querySelector(".topbar-subtitle");
    if (el) {
        const today = new Date();
        el.textContent = today.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
});