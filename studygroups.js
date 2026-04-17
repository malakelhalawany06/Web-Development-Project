  // Search functionality
        const searchInput = document.getElementById('groupSearchInput');
        const groupCards = document.querySelectorAll('.group-card');

        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            
            groupCards.forEach(card => {
                const title = card.querySelector('h3')?.innerText.toLowerCase() || '';
                const course = card.querySelector('.group-info p')?.innerText.toLowerCase() || '';
                
                if (title.includes(searchTerm) || course.includes(searchTerm)) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        });

        // Filter functionality
        const filterChips = document.querySelectorAll('.filter-chip');
        
        filterChips.forEach(chip => {
            chip.addEventListener('click', function() {
                filterChips.forEach(c => c.classList.remove('active'));
                this.classList.add('active');
                
                const filterValue = this.dataset.filter;
                
                groupCards.forEach(card => {
                    if (filterValue === 'all') {
                        card.style.display = '';
                    } else if (filterValue === 'available') {
                        if (card.dataset.status === 'available') {
                            card.style.display = '';
                        } else {
                            card.style.display = 'none';
                        }
                    } else if (filterValue === 'cs') {
                        if (card.dataset.category === 'cs') {
                            card.style.display = '';
                        } else {
                            card.style.display = 'none';
                        }
                    } else if (filterValue === 'math') {
                        if (card.dataset.category === 'math') {
                            card.style.display = '';
                        } else {
                            card.style.display = 'none';
                        }
                    } else if (filterValue === 'engineering') {
                        if (card.dataset.category === 'engineering') {
                            card.style.display = '';
                        } else {
                            card.style.display = 'none';
                        }
                    }
                });
            });
        });
const modal=document.getElementById('createGroupModal');
const form=document.getElementById('createGroupForm');

function openCreateGroupModal(){
    console.log("openCreateGroupModal called");
    const modal = document.getElementById('createGroupModal');
    console.log("modal element:", modal);
    if(modal){
        modal.classList.add('show');
    console.log("modal classes after:", modal.className);

    }
}

function closeCreateGroupModal(){
    if(modal){
        modal.classList.remove('show');
    }
    if(form){
        form.reset();
    }
}
window.onclick=function(event){
    if(modal&&event.target===modal){
        closeCreateGroupModal();
    }
}
if(form){
    form.addEventListener('submit',function(e){
    e.preventDefault();
    const groupName=document.getElementById('groupName').value;
    const groupCourse=document.getElementById('groupCourse').value;
    const groupCategory=document.getElementById('groupCategory').value;
    const groupDescription=document.getElementById('groupDescription').value;
    const groupsGrid=document.getElementById('groupsGrid');
    const newGroupCard=document.createElement('div');
    newGroupCard.className='group-card';
    newGroupCard.setAttribute('data-status','joined');
    newGroupCard.setAttribute('data-category',groupCategory);
     let icon = '💻';
    let iconClass = 'blue';
    if(groupCategory==='math'){
        icon = '🧮';
        iconClass = 'purple';
    }else if(groupCategory==='engineering'){
         icon = '⚡';
        iconClass = 'cyan';
    }
      newGroupCard.innerHTML = `
    <div class="group-header">
            <div class="group-icon ${iconClass}">${icon}</div>
            <div class="group-info">
                <h3>${escapeHtml(groupName)}</h3>
                <p>${escapeHtml(groupCourse)}</p>
            </div>
        </div>
        <div class="group-stats">
            <div class="stat">👥 1 members</div>
            <div class="stat">📝 0 resources</div>
            <div class="stat">💬 0 messages</div>
        </div>
        <div class="group-description">
            ${escapeHtml(groupDescription)}
        </div>
        <div class="group-actions">
            <button class="btn btn-outline btn-sm">View Details</button>
            <button class="btn btn-primary btn-sm">✓ Joined</button>
        </div>`;
        if(groupsGrid)
        {
            groupsGrid.appendChild(newGroupCard);
        }
        closeCreateGroupModal();
        alert('Group '+groupName+' created successfully!');
});
}

function escapeHtml(text){
    const div=document.createElement('div');
    div.textContent=text;
    return div.innerHTML;
}