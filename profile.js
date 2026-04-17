 // Wait for DOM to be fully loaded before accessing elements
        document.addEventListener('DOMContentLoaded', function() {
            const fileInput = document.getElementById('profile-upload');
            const sidebarAvatar = document.getElementById('sidebar-avatar');
            const mainAvatar = document.getElementById('main-avatar');

            // Default avatar as inline SVG (grey circle with "AK" text)
            const defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%233b82f6'/%3E%3Ctext x='50' y='67' font-size='40' text-anchor='middle' fill='white' font-family='Arial, sans-serif' font-weight='bold'%3EAK%3C/text%3E%3C/svg%3E";

            // Load saved image from localStorage
            const savedImage = localStorage.getItem('profilePicture');
            if (savedImage && savedImage !== '') {
                sidebarAvatar.src = savedImage;
                mainAvatar.src = savedImage;
            } else {
                // Set default avatar (shows "AK" on blue circle)
                sidebarAvatar.src = defaultAvatar;
                mainAvatar.src = defaultAvatar;
            }

            // Handle file upload
            fileInput.addEventListener('change', function(event) {
                const file = event.target.files[0];
                if (file && (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg')) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const imageData = e.target.result;
                        // Update both avatars
                        sidebarAvatar.src = imageData;
                        mainAvatar.src = imageData;
                        // Save to localStorage
                        localStorage.setItem('profilePicture', imageData);
                    };
                    reader.readAsDataURL(file);
                } else if (file) {
                    alert('Please select a valid JPEG or PNG image.');
                    fileInput.value = ''; // clear the invalid file
                }
            });
        });

       function hideBtn(){
        
       }