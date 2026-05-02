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
    <div style="marging-bottom:1rem;">
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
function initializeButtons(){//reseting and reassigning behaviour on the buttons
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
    userGroups.forEach(group=>{ //loops through all user-specified groups
        const groupCard=createGroupCard(group); 
        groupsGrid.appendChild(groupCard);
    });
}
function createGroupCard(group){ //creates a group card based on user's data, is called in loadUserStudyGroups()
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
function updateStudyGroupsBadge(){ //this shows how many study groups the user has joined using the small badge beside the tab
    const badge=document.getElementById('studyGroupsBadge');
    if(!badge) return;
    const currentUser=UserManager.getCurrentUser();
    if(!currentUser) return;
    const username=currentUser.username;
    const userGroups=UserManager.getUserStudyGroups(username);
    const joinedCount=userGroups.filter(group=>group.status==='joined').length;
    badge.textContent=joinedCount;
}
function updateFilterChips() {//changes tabs depending on the user's major
    const currentUser = UserManager.getCurrentUser();
    if (!currentUser) return;
    
    const major = currentUser.major;
    const filterSection = document.querySelector('.filter-section');
    if (!filterSection) return;
    
    // Define filter chips for each major
    const chipsByMajor = {
        'Computer Science': [ //CS Tabs 
            { filter: 'all', name: 'All Groups' },
            { filter: 'available', name: 'Available to Join' },
            { filter: 'cs', name: 'Computer Science' },
            { filter: 'math', name: 'Mathematics' },
            { filter: 'engineering', name: 'Engineering' }
        ],
        'Business Informatics': [ //BI Tabs
            { filter: 'all', name: 'All Groups' },
            { filter: 'available', name: 'Available to Join' },
            { filter: 'business', name: 'Business' },
            { filter: 'marketing', name: 'Marketing' },
            { filter: 'finance', name: 'Finance' }
        ],
        'Applied Arts': [ //Applied arts Tabs
            { filter: 'all', name: 'All Groups' },
            { filter: 'available', name: 'Available to Join' },
            { filter: 'arts', name: 'Graphic Design' },
            { filter: 'uiux', name: 'UI/UX' },
            { filter: 'digital', name: 'Digital Art' }
        ],
        'Law': [ //Law Tabs
            { filter: 'all', name: 'All Groups' },
            { filter: 'available', name: 'Available to Join' },
            { filter: 'law', name: 'Constitutional Law' },
            { filter: 'criminal', name: 'Criminal Law' },
            { filter: 'international', name: 'International Law' }
        ],
        'Dentistry': [ //Dentistry Tabs
            { filter: 'all', name: 'All Groups' },
            { filter: 'available', name: 'Available to Join' },
            { filter: 'science', name: 'Anatomy' },
            { filter: 'pathology', name: 'Pathology' },
            { filter: 'clinical', name: 'Clinical' }
        ],
        'Networks': [ //Networks Tabs
            { filter: 'all', name: 'All Groups' },
            { filter: 'available', name: 'Available to Join' },
            { filter: 'cs', name: 'Network Security' },
            { filter: 'cloud', name: 'Cloud Computing' },
            { filter: 'security', name: 'Cyber Security' }
        ],
        'System Admin': [ //Admin Tabs 
            { filter: 'all', name: 'All Groups' },
            { filter: 'available', name: 'Available to Join' },
            { filter: 'admin', name: 'Server Management' },
            { filter: 'devops', name: 'DevOps' }
        ]
    };
    
    //get chips for this major or default to Computer Science
    const chips = chipsByMajor[major] || chipsByMajor['Computer Science'];
    
    //clear existing chips
    filterSection.innerHTML = '';
    
    //create new chips
    chips.forEach(chip => {
        const chipDiv = document.createElement('div');
        chipDiv.className = 'filter-chip';
        if (chip.filter === 'all') {
            chipDiv.classList.add('active');
        }
        chipDiv.setAttribute('data-filter', chip.filter);
        chipDiv.textContent = chip.name;
        
        //add click event
        chipDiv.addEventListener('click', function() {
            document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            
            const filterValue = this.dataset.filter;
            const groupCards = document.querySelectorAll('.group-card');
            
            groupCards.forEach(card => {
                if (filterValue === 'all') {
                    card.style.display = '';
                } else if (filterValue === 'available') {
                    if (card.dataset.status === 'available') {
                        card.style.display = '';
                    } else {
                        card.style.display = 'none';
                    }
                } else {
                    if (card.dataset.category === filterValue) {
                        card.style.display = '';
                    } else {
                        card.style.display = 'none';
                    }
                }
            });
        });
        
        filterSection.appendChild(chipDiv); //add the new chips to the filter section 
    });
}
//function to specify category dropdown based on user's major
function populateCategoryDropdown() {
    const currentUser = UserManager.getCurrentUser();
    if (!currentUser) return;
    
    const major = currentUser.major;
    const categorySelect = document.getElementById('groupCategory');
    if (!categorySelect) return;
    
    //define categories for each major
    const categoriesByMajor = {
        'Computer Science': [
            { value: 'cs', name: 'Computer Science' },
            { value: 'math', name: 'Mathematics' },
            { value: 'engineering', name: 'Engineering' }
        ],
        'Business Informatics': [
            { value: 'business', name: 'Business Analytics' },
            { value: 'marketing', name: 'Marketing' },
            { value: 'finance', name: 'Finance' }
        ],
        'Applied Arts': [
            { value: 'arts', name: 'Graphic Design' },
            { value: 'uiux', name: 'UI/UX Design' },
            { value: 'digital', name: 'Digital Art' }
        ],
        'Law': [
            { value: 'law', name: 'Constitutional Law' },
            { value: 'criminal', name: 'Criminal Law' },
            { value: 'international', name: 'International Law' }
        ],
        'Dentistry': [
            { value: 'science', name: 'Human Anatomy' },
            { value: 'pathology', name: 'Oral Pathology' },
            { value: 'clinical', name: 'Clinical Dentistry' }
        ],
        'Networks': [
            { value: 'cs', name: 'Network Security' },
            { value: 'cloud', name: 'Cloud Computing' },
            { value: 'security', name: 'Cyber Security' }
        ],
        'System Admin': [
            { value: 'admin', name: 'Server Management' },
            { value: 'devops', name: 'DevOps' }
        ]
    };
    //get the categories by major or let it default if no major entered to Computer Science 
    const categories = categoriesByMajor[major] || categoriesByMajor['Computer Science'];
    
    //clear existing options
    categorySelect.innerHTML = '';
    
    //add new options
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.value;
        option.textContent = cat.name;
        categorySelect.appendChild(option);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    //execute automatically when the webpage finishes loading
    populateCategoryDropdown();
    updateFilterChips(); 
    initializeButtons(); 
    loadUserStudyGroups();
    updateStudyGroupsBadge();
});