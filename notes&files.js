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
            const filename=card.querySelector('.file-name').innerText;
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
const searchInput = document.getElementById('topbar-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', function(e) {
                const searchTerm = e.target.value.toLowerCase();
                const fileCards = document.querySelectorAll('.file-card');
                
                fileCards.forEach(card => {
                    const fileName = card.querySelector('.file-name').innerText.toLowerCase();
                    if (fileName.includes(searchTerm)) {
                        card.style.display = 'flex';
                    } else {
                        card.style.display = 'none';
                    }
                });
                
                if (document.getElementById('listView').style.display === 'block') {
                    populateListView();
                }
            });
        }
