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
    fileCard.innerHTML = `
        <div class="file-icon">${file.fileIcon}</div>
        <div class="file-info">
            <div class="file-name">${escapeHtml(file.title||file.fileName)}</div> 
          
            <div class="file-meta" style="font-size: 10px; color: var(--text3);">${escapeHtml(file.description)} • ${escapeHtml(file.fileSize)} • Uploaded by Ahmed K. • ${file.date}</div>
           
        </div>
        <div class="file-actions">
            <button class="btn-icon" onclick="downloadFile(this)">⬇️</button>
            <button class="btn-icon" onclick="shareFile(this)">🔗</button>
            <button class="btn-icon" onclick="deleteFile(this)">🗑️</button>
        </div>
    `;
    return fileCard; //so loadNotesFile() can insert it 
}

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
        
        let savedFiles = JSON.parse(localStorage.getItem('notesFiles') || '[]'); //load stored files
        savedFiles = savedFiles.filter(file => file.title !== fileTitle); //remove matching file 
        localStorage.setItem('notesFiles', JSON.stringify(savedFiles)); //save updated list
        
        fileCard.remove(); //remove from the interface 
        alert('File deleted successfully!');
    }
}

 const currentUser=UserManager.getCurrentUser();
 const username=currentUser?.username;
 function loadUserNotesFiles(){
    if(!username) return;
    const userFiles=UserManager.getUserNotesFiles(username);
    const filesGrid=document.getElementById('gridView');
    if(!filesGrid) return;

    const uploadedFiles=filesGrid.querySelectorAll('.file-card[data-uploaded="true"]');
    uploadedFiles.forEach(file=>file.remove());
    userFiles.forEach(file=>{
       const fileCard=createFileCard(file);
       filesGrid.appendChild(fileCard); 
    });
    updateNotesFilesBadge();
 }
 function updateCourseTabs(){
    const currentUser=UserManager.getCurrentUser();//get the user logged in
    if(!currentUser) return;
    const major=currentUser.major;//get the user's major
    const courseTabsContainer=document.querySelector('.course-tabs');//get the container for course tabs
    if(!courseTabsContainer) return;
     const tabsByMajor = {
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
    const tabs=tabsByMajor[major]||tabsByMajor['Computer Science'];
    courseTabsContainer.innerHTML='';
    tabs.forEach(tab=>{
        const tabButton=document.createElement('button');
        tabButton.className='course-tab';
        if(tab.course==='all'){
             tabButton.classList.add('active');
        }
        tabButton.setAttribute('data-course',tab.course);
        tabButton.textContent=tab.name;
        tabButton.textContent=tab.name;
        tabButton.onclick=function(){
            document.querySelectorAll('.course-tab').forEach(t=>t.classList.remove('active'));
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
        };
        courseTabsContainer.appendChild(tabButton);
    });
 }
//load files when page loads
 document.addEventListener('DOMContentLoaded',function(){
    updateCourseTabs();  // ADD THIS - generates tabs based on major
    loadUserNotesFiles();
    updateNotesFilesBadge();
 });
