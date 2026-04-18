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