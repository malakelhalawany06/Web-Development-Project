  // Search functionality
        const searchInput = document.getElementById('groupSearchInput'); //get the input field where the user types 
        const groupCards = document.querySelectorAll('.group-card');// get all elements with class .group-card

        searchInput.addEventListener('input', function(e) { //runs function(e) whenever the user types anything in this input
            const searchTerm = e.target.value.toLowerCase(); //get what the user typed in searchTerm, e.target->element that triggered the event, .value->element inside
            
            groupCards.forEach(card => { //loop through all cards 
                //Extrating texts from each card
                const title = card.querySelector('h3')?.innerText.toLowerCase() || ''; // ? (optional chaining) to prevent errors if element doesn't exist
                const course = card.querySelector('.group-info p')?.innerText.toLowerCase() || '';
                
                if (title.includes(searchTerm) || course.includes(searchTerm)) { //so that the user can search by group title or group course
                    card.style.display = ''; //shows the card
                } else {
                    card.style.display = 'none'; //hides the card 
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
        <button class="btn btn-outline btn-sm" onclick="viewDetails(this)">View Details</button>
        <button class="btn btn-primary btn-sm" onclick="joinGroup(this)">Join Group</button>
    </div>
`;
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
function joinGroup(button){
    const groupCard=button.closest('.group-card');
    const groupName=groupCard.querySelector('h3').innerText;
    if(button.innerText==='Join Group'){
        button.innerText='✓ Joined';
        button.classList.remove('btn-primary');
        button.classList.add('btn-success');
        groupCard.setAttribute('data-status','joined');
        const memberStat=groupCard.querySelector('.stat:first-child');
        const currentMembers=parseInt(memberStat.innerText.match(/\d+/)[0]);
        memberStat.innerHTML= `👥 ${currentMembers + 1} members`;
        button.onclick=function(){leaveGroup(this);};
        alert(`You joined "${groupName}".`);
    }
}

function viewDetails(button){
    const groupCard=button.closest('.group-card');
    const groupName=groupCard.querySelector('h3').innerText;
    const groupCourse=groupCard.querySelector('.group-info p').innerText;
    const groupDescription=groupCard.querySelector('.group-description').innerText;
    const memberCount=groupCard.querySelector('.stat:first-child').innerText;
    const resourceCount=groupCard.querySelectorAll('.stat')[1].innerText;
    const messageCount=groupCard.querySelectorAll('.stat')[2].innerText;
    const detailsModal=document.createElement('div');
    detailsModal.className='modal';
    detailsModal.style.display='flex';
    detailsModal.innerHTML=`
    <div class="modal-content" style="max-width:500px;">
    <h2>${escapeHtml(groupName)}</h2>
    <div style=marging-bottom:1rem;">
    <span class="stat">${memberCount}</span>
    <span class="stat">${resourceCount}</span>
    <span class="stat">${messageCount}</span>
    </div>
    <div class="form-group">
    <label><strong>Course:</strong></label>
    <p>${escapeHtml(groupCourse)}</p>
    </div>
    <div class="form-group">
    <label><strong>Description:</strong></label>
    <p>${escapeHtml(groupDescription)}</p>
    </div>
    <div class="modal-actions">
    <button class="btn btn-primary" onclick="this.closest('.modal').remove()">Close</button>
    </div>
    </div>
    `;
    document.body.appendChild(detailsModal);
    
   
    detailsModal.addEventListener('click', function(e) {
        if (e.target === detailsModal) {
            detailsModal.remove();
        }
    });
}
function initializeButtons(){
    const joinButtons=document.querySelectorAll('.group-actions .btn-primary.btn-sm, .group-actions .btn-success.btn-sm');
    joinButtons.forEach(button=>{
        const newButton=button.cloneNode(true);
        button.parentNode.replaceChild(newButton,button);
        if(newButton.innerText==='Join Group'){
            newButton.onclick=function(){joinGroup(this);};
        } else if(newButton.innerText==='✓ Joined'){
            newButton.onclick=function(){leaveGroup(this);};
        }
    });

    const viewButtons=document.querySelectorAll('.group-actions .btn-outline.btn-sm');
    viewButtons.forEach(button=>{
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        newButton.onclick = function() { viewDetails(this); };
    });
}
document.addEventListener('DOMContentLoaded', function() {
    initializeButtons();
});
function leaveGroup(button){
    const groupCard=button.closest('.group-card');
    const groupName=groupCard.querySelector('h3').innerText;

    if(button.innerText==='✓ Joined'){
        button.innerText='Join Group';
        button.classList.remove('btn-success');
        button.classList.add('btn-primary');
        groupCard.setAttribute('data-status','available');

        const memberStat=groupCard.querySelector('.stat:first-child');
        const currentMembers=parseInt(memberStat.innerText.match(/\d+/)[0]);
        memberStat.innerHTML = `👥 ${currentMembers - 1} members`;
         button.onclick=function(){joinGroup(this);};
        alert(`You left "${groupName}".`);
    }
}