document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('profile-upload');
    const mainAvatar = document.getElementById('main-avatar');
    const sidebarAvatarContainer = document.querySelector('.sidebar-profile .avatar');
    const topbarAvatar = document.querySelector('.topbar-right .avatar.sm'); // keep as is

    // Create an img element for sidebar if not already there
    let sidebarImg = sidebarAvatarContainer.querySelector('img');
    if (!sidebarImg) {
        sidebarImg = document.createElement('img');
        sidebarImg.style.width = '40px';
        sidebarImg.style.height = '40px';
        sidebarImg.style.borderRadius = '50%';
        sidebarImg.style.objectFit = 'cover';
        sidebarAvatarContainer.innerHTML = ''; // remove text "AK"
        sidebarAvatarContainer.appendChild(sidebarImg);
    }

    const defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%233b82f6'/%3E%3Ctext x='50' y='67' font-size='40' text-anchor='middle' fill='white' font-family='Arial, sans-serif' font-weight='bold'%3EAK%3C/text%3E%3C/svg%3E";

    const savedImage = localStorage.getItem('profilePicture');
    if (savedImage && savedImage !== '') {
        sidebarImg.src = savedImage;
        mainAvatar.src = savedImage;
    } else {
        sidebarImg.src = defaultAvatar;
        mainAvatar.src = defaultAvatar;
    }

    fileInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file && (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const imageData = e.target.result;
                sidebarImg.src = imageData;
                mainAvatar.src = imageData;
                localStorage.setItem('profilePicture', imageData);
            };
            reader.readAsDataURL(file);
        } else if (file) {
            alert('Please select a valid JPEG or PNG image.');
            fileInput.value = '';
        }
    });
});