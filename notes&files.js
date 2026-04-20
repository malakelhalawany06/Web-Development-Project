function populateListView(){ //runs when building or rebuilding list view
    const listView=document.getElementById('listView'); //get container where the list is updated
    const fileCards=document.querySelectorAll('.file-card'); //get all file cards currently on page
    //resets the list and add header
    listView.innerHTML=`
                <div class="list-header">
                    <span>File Name</span>
                    <span>Course</span>
                    <span>Size</span>
                    <span>Uploaded By</span>
                    <span>Actions</span>
                </div>
            `;
    fileCards.forEach(card=>{ //loop through all cards 
        if(card.style.display!=='none'){ //only include visible cards, if a card is hidden, it will be skipped
            //get all card details
            const fileName=card.querySelector('.file-name').innerText;
            const fileMeta=card.querySelector('.file-meta').innerText;
            const fileSize=card.querySelector('.file-size').innerText;
            const course=fileMeta.split(' • ')[0]; //reads until the dot
                    const uploadedBy = fileMeta.split(' • ')[1];
                    const sizeOnly = fileSize.split(' • ')[0];
                    //create a list item, each file becomes a row in the list
                    const listItem=document.createElement('div');
                    listItem.className='list-item';
                    //Fill the row with data 
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
                    listView.appendChild(listItem); //add it to the list to the page 
        }
    });
}
//Search Functionality
const searchInput = document.querySelector('.topbar-search input'); //looks for an input inside the search bar
if (searchInput) { 
    searchInput.addEventListener('input', function(e) { //function(e) runs each time the user types or deletes
        const searchTerm = e.target.value.toLowerCase(); //get the value typed from input element and make it case insensitive using toLowerCase()
        const fileCards = document.querySelectorAll('.file-card'); //get all file cards
        
        fileCards.forEach(card => { //loop through each card 
            const fileName = card.querySelector('.file-name').innerText.toLowerCase(); //extract filename
            if (fileName.includes(searchTerm)) { //if the filename contains what the user typed then that's a match
                card.classList.remove('hidden'); //show card
                card.style.display = 'flex';
            } else {
                card.classList.add('hidden'); //hide card
                card.style.display = 'none';
            }
        });
        
        if (document.getElementById('listView').style.display === 'block') {
            populateListView();
        }
    });
}
//Course filtering buttons
const courseTabs=document.querySelectorAll('.course-tab');//get all elements with class course-tab (all tabs)
courseTabs.forEach(tab=>{ //loop through all tabs
    tab.addEventListener('click',function(){ //triggers function() each time the user clicks on a tab
        courseTabs.forEach(t=>t.classList.remove('active')); //removes active state for all tabs
        this.classList.add('active'); //sets active state for chosen tab
        const course=this.dataset.course;//get the custom HTML attributes using dataset
        const fileCards=document.querySelectorAll('.file-card');//select all elements with class file-card (all files)
        fileCards.forEach(card=>{ //loop through all tabs
            if(course==='all'||card.dataset.course===course){ 
                 card.classList.remove('hidden'); //show the chosen tabs
                card.style.display = 'flex';
            }else{
                 card.classList.add('hidden'); //hide the unchosen tabs 
                card.style.display = 'none';
            }
        });
        if(document.getElementById('listView').style.display==='block'){
            populateListView();
        }
    });
});
//load files from localStorage and displays them in the UI
function createFileCard(file) { //turns a file object into an HTML card
    const fileCard = document.createElement('div');
    fileCard.className = 'file-card';
    fileCard.setAttribute('data-course', file.course);
    fileCard.setAttribute('data-uploaded','true');
     // Extract the uploaded by name from fileMeta or use stored value
    let uploadedByName = 'Unknown';
    if (file.fileMeta) {
        const match = file.fileMeta.match(/Uploaded by (.+)/);
        if (match) uploadedByName = match[1];
    }
    
    fileCard.innerHTML = `
        <div class="file-icon">${file.fileIcon}</div>
        <div class="file-info">
            <div class="file-name">${escapeHtml(file.title || file.fileName)}</div> 
            <div class="file-meta" style="font-size: 10px; color: var(--text3);">${escapeHtml(file.description)} • ${escapeHtml(file.fileSize)} • Uploaded by ${uploadedByName} • ${file.date}</div>
        </div>
        <div class="file-actions">
            <button class="btn-icon" onclick="downloadFile(this)">⬇️</button>
            <button class="btn-icon" onclick="shareFile(this)">🔗</button>
            <button class="btn-icon" onclick="deleteFile(this)">🗑️</button>
        </div>
    `;
    return fileCard;
}
//santizies user input to prevent errors 
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text; //.textContent treats input as plain text, browser automatically escapes dangerous characters
    return div.innerHTML;
}


function downloadFile(button) {
    const fileName = button.closest('.file-card').querySelector('.file-name').innerText; //find parent card and extracts file name
    alert(`Downloading "${fileName}"...`); //show alert 
}

function shareFile(button) {
    const fileName = button.closest('.file-card').querySelector('.file-name').innerText;
    alert(`Sharing "${fileName}"...`);
}

function deleteFile(button) {
   if (confirm('Are you sure you want to delete this file?')) {
        const fileCard = button.closest('.file-card');
        const fileTitle = fileCard.querySelector('.file-name').innerText;
        
        const currentUser = UserManager.getCurrentUser();
        if (!currentUser) return;
        
        const username = currentUser.username;
        
        //get files from user-specific storage
        let userFiles = UserManager.getUserNotesFiles(username);
        
        //remove the file with matching title
        const newFiles = userFiles.filter(file => file.title !== fileTitle);
        
        //save back to user-specific storage
        UserManager.saveUserNotesFiles(username, newFiles);
        
        //remove from page
        fileCard.remove();
        updateNotesFilesBadge();
        alert('File deleted successfully!');
    }
}

 const currentUser=UserManager.getCurrentUser();
 const username=currentUser?.username;
 //get the notes based on user 
 function loadUserNotesFiles() {
    const currentUser = UserManager.getCurrentUser();
    if (!currentUser) return;
    
    const username = currentUser.username; //get username
    const userFiles = UserManager.getUserNotesFiles(username); //get notes by username
    const filesGrid = document.getElementById('gridView'); 
    if (!filesGrid) return;
    
    filesGrid.innerHTML = ''; //make this part empty
    
    userFiles.forEach(file => { //loop through all user files
        const fileCard = createFileCard(file);
        filesGrid.appendChild(fileCard);
    });
    
    updateNotesFilesBadge();
}
//update the tabs based on user
 function updateCourseTabs(){
    const currentUser=UserManager.getCurrentUser();//get the user logged in
    if(!currentUser) return;
    const major=currentUser.major;//get the user's major
    const courseTabsContainer=document.querySelector('.course-tabs');//get the container for course tabs
    if(!courseTabsContainer) return;
     const tabsByMajor = { //all tabs by major
        'Computer Science': [
            { course: 'all', name: 'All Courses' },
            { course: 'ds', name: 'Data Structures' },
            { course: 'db', name: 'Database Systems' },
            { course: 'net', name: 'Networks' },
            { course: 'web', name: 'Web Development' }
        ],
        'Business Informatics': [
            { course: 'all', name: 'All Courses' },
            { course: 'db', name: 'Data Analysis' },
            { course: 'business', name: 'Business Analytics' },
            { course: 'marketing', name: 'Marketing' }
        ],
        'Applied Arts': [
            { course: 'all', name: 'All Courses' },
            { course: 'arts', name: 'Graphic Design' },
            { course: 'uiux', name: 'UI/UX Design' },
            { course: 'digital', name: 'Digital Art' }
        ],
        'Law': [
            { course: 'all', name: 'All Courses' },
            { course: 'law', name: 'Constitutional Law' },
            { course: 'criminal', name: 'Criminal Law' },
            { course: 'international', name: 'International Law' }
        ],
        'Dentistry': [
            { course: 'all', name: 'All Courses' },
            { course: 'science', name: 'Human Anatomy' },
            { course: 'pathology', name: 'Oral Pathology' },
            { course: 'clinical', name: 'Clinical Dentistry' }
        ],
        'Networks': [
            { course: 'all', name: 'All Courses' },
            { course: 'net', name: 'Network Security' },
            { course: 'cloud', name: 'Cloud Computing' },
            { course: 'security', name: 'Cyber Security' }
        ],
        'System Admin': [
            { course: 'all', name: 'All Courses' },
            { course: 'admin', name: 'Server Management' },
            { course: 'devops', name: 'DevOps' }
        ]
    };
    const tabs=tabsByMajor[major]||tabsByMajor['Computer Science']; //get the specified tabs by major for the current user
    courseTabsContainer.innerHTML=''; //make the container empty
    tabs.forEach(tab=>{ //loop through all user tabs 
        const tabButton=document.createElement('button');
        tabButton.className='course-tab';
        if(tab.course==='all'){ //make the 'all' tab active 
             tabButton.classList.add('active');
        }
        tabButton.setAttribute('data-course',tab.course); //get the course in data-course
        tabButton.textContent=tab.name; //get the name using text content
        tabButton.onclick=function(){ //function runs when a tab is clicked on
            document.querySelectorAll('.course-tab').forEach(t=>t.classList.remove('active')); //remove active for all tabs
            this.classList.add('active'); //make the selected tab active
            const course=this.dataset.course; //get the course
            const fileCards=document.querySelectorAll('.file-card'); //select all file cards
            fileCards.forEach(card=>{ //loop through all cards 
                if(course==='all'||card.dataset.course===course){
                    card.classList.remove('hidden'); //show the notes for this tab
                    card.style.display = 'flex';
                }else{
                    card.classList.add('hidden'); //hide the notes for this tab
                    card.style.display = 'none';
                }
            });
            if(document.getElementById('listView').style.display==='block'){
                populateListView(); //reload list view 
            }
        };
        courseTabsContainer.appendChild(tabButton); //add the tab button to the container 
    });
 }

 function updateNotesFilesBadge() { 
    const currentUser = UserManager.getCurrentUser();
    if (!currentUser) return;
    const username = currentUser.username;
    const userFiles = UserManager.getUserNotesFiles(username);
    const badge = document.getElementById('notesFilesBadge');
    if (badge) badge.textContent = userFiles.length;
}
//load files when page loads
 document.addEventListener('DOMContentLoaded',function(){
    updateCourseTabs();  // ADD THIS - generates tabs based on major
    loadUserNotesFiles();
    updateNotesFilesBadge();
 });
