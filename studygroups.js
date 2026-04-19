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
        const filterChips = document.querySelectorAll('.filter-chip');//get all elements with class .filter-chip
        
        filterChips.forEach(chip => { //loop through each chip
            chip.addEventListener('click', function() { //runs function(e) whenever a chip is clicked on
              //one chip looks selected when clicked(active)
                filterChips.forEach(c => c.classList.remove('active')); 
                this.classList.add('active');
                
                const filterValue = this.dataset.filter; //get the filter value, dataset access custom HTML attributes for this object
                
                groupCards.forEach(card => { //loop through all cards
                    //Filters using conditions  
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
const modal=document.getElementById('createGroupModal'); // the popup container/modal
const form=document.getElementById('createGroupForm'); //form inside the modal

function openCreateGroupModal(){
    console.log("openCreateGroupModal called");
    console.log("modal element:", modal);
    if(modal){
        modal.classList.add('show'); //show modal 
    console.log("modal classes after:", modal.className);

    }
}

function closeCreateGroupModal(){
    if(modal){
        modal.classList.remove('show'); //hide modal
    }
    if(form){
        form.reset(); //reset form
    }
}
window.onclick=function(event){ //clicking outside the modal exits it 
    if(modal&&event.target===modal){ //if clicked anywhere other than the modal
        closeCreateGroupModal();
    }
}
if(form){ //handling for the form submission
    form.addEventListener('submit',function(e){
    e.preventDefault(); //prevent page reload
    //get user inputs from the text fields 
    const groupName=document.getElementById('groupName').value;
    const groupCourse=document.getElementById('groupCourse').value;
    const groupCategory=document.getElementById('groupCategory').value;
    const groupDescription=document.getElementById('groupDescription').value;
    //preparing to create a new card 
    const groupsGrid=document.getElementById('groupsGrid'); //container that holds all cards
    const newGroupCard=document.createElement('div'); //the card that holds the new elements
    newGroupCard.className='group-card';
    newGroupCard.setAttribute('data-status','available');
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
    //building the card using HTML
      newGroupCard.innerHTML = `
    <div class="group-header">
        <div class="group-icon ${iconClass}">${icon}</div>
        <div class="group-info">
            <h3>${escapeHtml(groupName)}</h3>
            <p>${escapeHtml(groupCourse)}</p>
        </div>
    </div>
    <div class="group-stats">
        <div class="stat">👥 0 members</div>
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

       //Adding the card to the page 
       if(groupsGrid)
        {
            groupsGrid.appendChild(newGroupCard);
        }
        //closing the modal
        closeCreateGroupModal();
        alert('Group '+groupName+' created successfully!');
});
}
//sanitizes user input so it is safe to insert into HTML
function escapeHtml(text){
    const div=document.createElement('div');
    div.textContent=text; //textContent treats input as plain text not HTML
    return div.innerHTML;
}

function joinGroup(button){
    const groupCard=button.closest('.group-card'); //Finds the nearest parent with class .group-card
    const groupName=groupCard.querySelector('h3').innerText; //get group name
    if(button.innerText==='Join Group'){ //check current state
        //Update the button's UI
        button.innerText='✓ Joined';
        button.classList.remove('btn-primary');
        button.classList.add('btn-success');
        groupCard.setAttribute('data-status','joined'); //update status
        const memberStat=groupCard.querySelector('.stat:first-child');
        const currentMembers=parseInt(memberStat.innerText.match(/\d+/)[0]); //.match(/\d+/) gets the first number in the text, parseInt converts it to number
        memberStat.innerHTML= `👥 ${currentMembers + 1} members`;
        button.onclick=function(){leaveGroup(this);}; //same button does the opposite action when joined
        alert(`You joined "${groupName}".`);
    }
}

function viewDetails(button){
    //Extract data from card
    const groupCard=button.closest('.group-card');
    const groupName=groupCard.querySelector('h3').innerText;
    const groupCourse=groupCard.querySelector('.group-info p').innerText;
    const groupDescription=groupCard.querySelector('.group-description').innerText;
    const memberCount=groupCard.querySelector('.stat:first-child').innerText;
    const resourceCount=groupCard.querySelectorAll('.stat')[1].innerText; //resources
    const messageCount=groupCard.querySelectorAll('.stat')[2].innerText; //messages 
    //create modal 
    const detailsModal=document.createElement('div');
    detailsModal.className='modal';
    detailsModal.style.display='flex';
    //build content 
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
    
    document.body.appendChild(detailsModal); //add to page 
    
   //close if clicked outside the modal
    detailsModal.addEventListener('click', function(e) {
        if (e.target === detailsModal) {
            detailsModal.remove();
        }
    });
}
function initializeButtons(){
    //Select Join Buttons 
    const joinButtons=document.querySelectorAll('.group-actions .btn-primary.btn-sm, .group-actions .btn-success.btn-sm');
    joinButtons.forEach(button=>{
        //Replace each button, to remove old event listeners
        const newButton=button.cloneNode(true);
        button.parentNode.replaceChild(newButton,button);
        if(newButton.innerText==='Join Group'){ //Reassign correct behavior for join and leave 
            newButton.onclick=function(){joinGroup(this);};
        } else if(newButton.innerText==='✓ Joined'){
            newButton.onclick=function(){leaveGroup(this);};
        }
    });

    const viewButtons=document.querySelectorAll('.group-actions .btn-outline.btn-sm');
    viewButtons.forEach(button=>{
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        newButton.onclick = function() { viewDetails(this); }; //same for view buttons 
    });
}
document.addEventListener('DOMContentLoaded', function() {
    initializeButtons(); //execute automatically when the webpage finishes loading
});
//reverse if joinGroup(), key differences are checking if joined, decreasing members and switch back to join group
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

//get current user 
const currentUser=UserManager.getCurrentUser();
const username=currentUser?.username;

//load user-specific study groups
function loadUserStudyGroups(){
    if(!username) return;
    const userGroups=UserManager.getUserStudyGroups(username);
    const groupsGrid=document.getElementById('groupsGrid');
    if(!groupsGrid) return;
    groupsGrid.innerHTML='';
    userGroups.forEach(group=>{
        const groupCrad=createGroupCard(group);
        groupsGrid.appendChild(groupCard);
    });
}
function createGroupCard(group){
    const card=document.createElement('div');
    card.className='group-card';
    card.setAttribute('data-status',group.status);
    card.setAttribute('data-category',group.category);
    card.setAttribute('data-id',group.id);
    let iconClass='blue';
    let icon = '💻';
    if (group.category === 'math') {
        icon = '🧮';
        iconClass = 'purple';
    } else if (group.category === 'engineering') {
        icon = '⚡';
        iconClass = 'cyan';
    }
        card.innerHTML = `
        <div class="group-header">
            <div class="group-icon ${iconClass}">${icon}</div>
            <div class="group-info">
                <h3>${escapeHtml(group.name)}</h3>
                <p>${escapeHtml(group.course)}</p>
            </div>
        </div>
        <div class="group-stats">
            <div class="stat">👥 ${group.members} members</div>
            <div class="stat">📝 ${group.resources} resources</div>
            <div class="stat">💬 ${group.messages} messages</div>
        </div>
        <div class="group-description">
            ${escapeHtml(group.description || 'Study group for ' + group.course)}
        </div>
        <div class="group-actions">
            <button class="btn btn-outline btn-sm" onclick="viewDetails(this)">View Details</button>
            ${group.status === 'joined' 
                ? '<button class="btn btn-success btn-sm" onclick="leaveGroup(this)">✓ Joined</button>'
                : '<button class="btn btn-primary btn-sm" onclick="joinGroup(this)">Join Group</button>'
            }
        </div>
    `;
    return card;
}
