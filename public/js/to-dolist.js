function updateBadgeCount() {
  const container = document.querySelector('.card > div[style*="flex-direction: row"]');
  if (!container) return;
  const taskCount = container.querySelectorAll('.task-item').length;
  const badge = document.querySelector('.sidebar .nav-badge');
  if (badge) badge.textContent = taskCount;
}

// Save all tasks to localStorage
function saveTasks() {
  const container = document.querySelector('.card > div[style*="flex-direction: row"]');
  if (!container) return;
  
  const tasks = [];
  const taskItems = container.querySelectorAll('.task-item');
  
  taskItems.forEach(item => {
    const checkBtn = item.querySelector('.task-check');
    const taskNameDiv = item.querySelector('.task-name');
    const taskMetaDiv = item.querySelector('.task-meta');
    const tagSpan = item.querySelector('.task-tag');
    
    tasks.push({
      name: taskNameDiv.textContent,
      meta: taskMetaDiv.textContent,
      tagClass: tagSpan.className,      // e.g. "task-tag tag-green"
      tagText: tagSpan.textContent,
      isDone: checkBtn.classList.contains('done')
    });
  });
  
  localStorage.setItem('todoTasks', JSON.stringify(tasks));
}

// Load tasks from localStorage and rebuild the list
function loadTasks() {
  const saved = localStorage.getItem('todoTasks');
  const container = document.querySelector('.card > div[style*="flex-direction: row"]');
  if (!container) return false;
  
  // If no saved tasks, keep the existing static HTML tasks
  if (!saved) {
    // Save the existing static tasks immediately so they persist later
    saveTasks();
    updateBadgeCount();
    return false;
  }
  
  const tasks = JSON.parse(saved);
  
  // Clear existing tasks (remove all .task-item children)
  const existingTasks = container.querySelectorAll('.task-item');
  existingTasks.forEach(task => task.remove());
  
  // Rebuild tasks from saved data
  tasks.forEach(task => {
    const newTask = document.createElement('div');
    newTask.className = 'task-item';
    
    // Check button
    const checkBtn = document.createElement('button');
    checkBtn.className = 'task-check' + (task.isDone ? ' done' : '');
    checkBtn.setAttribute('onclick', 'checkOrUncheck(this)');
    checkBtn.innerHTML = task.isDone ? '✓' : '';
    
    // Text area
    const textDiv = document.createElement('div');
    textDiv.className = 'task-text';
    const taskName = document.createElement('div');
    taskName.className = 'task-name' + (task.isDone ? ' done' : '');
    taskName.textContent = task.name;
    const taskMeta = document.createElement('div');
    taskMeta.className = 'task-meta';
    taskMeta.textContent = task.meta;
    textDiv.appendChild(taskName);
    textDiv.appendChild(taskMeta);
    
    // Tag
    const tagSpan = document.createElement('span');
    tagSpan.className = task.tagClass;
    tagSpan.textContent = task.tagText;
    
    newTask.appendChild(checkBtn);
    newTask.appendChild(textDiv);
    newTask.appendChild(tagSpan);
    container.appendChild(newTask);
    const allNewTasks = container.querySelectorAll('.task-item');
  allNewTasks.forEach(task => addTaskControls(task));
  });
  
  updateBadgeCount();
  return true;
}

// ======================== TASK TOGGLE (done/undone) ========================
window.checkOrUncheck = function(button) {
  const taskItem = button.closest('.task-item');
  const check = taskItem.querySelector('.task-check');
  const task = taskItem.querySelector('.task-name');
  const tag = taskItem.querySelector('.task-tag');
  // meta is NOT modified – it stays as "Subject: ... · Due ..."

  const isNowDone = !check.classList.contains('done');

  if (isNowDone) {
    check.classList.add('done');
    check.innerHTML = "✓";
    task.classList.add('done');
    tag.className = 'task-tag tag-green';
    tag.textContent = 'Done';
  } else {
    check.classList.remove('done');
    check.innerHTML = "";
    task.classList.remove('done');
    tag.className = 'task-tag tag-blue';
    tag.textContent = 'Pending';
  }

  saveTasks();
};

// ======================== ADD NEW TASK (with due date & custom meta) ========================
window.addTask = function() {
  // Task name
  const taskName = prompt("Enter the task name:");
  if (!taskName || taskName.trim() === "") return;

  // Subject / Course name
  let subject = prompt("Enter the subject (e.g., Math, Physics, DS):", "");
  if (subject === null) return; // user cancelled
  subject = subject.trim();

  // Due date (optional)
  let dueDate = prompt("Enter due date (e.g., Apr 25, 2026) or leave empty:", "");
  if (dueDate === null) return;
  dueDate = dueDate.trim();

  // Build the meta text: "Subject: X" + optional " · Due Y"
  let metaText = "";
  if (subject !== "") {
    metaText = `${subject}`;
  }
  if (dueDate !== "") {
    if (metaText !== "") metaText += ` · Due ${dueDate}`;
    else metaText = `Due ${dueDate}`;
  }
  // If both empty, meta stays empty (or you could set a default)
  if (metaText === "") metaText = "No subject or due date";

  const container = document.querySelector('.card > div[style*="flex-direction: row"]');
  if (!container) {
    console.error("Task container not found!");
    return;
  }

  // Create new task item
  const newTask = document.createElement('div');
  newTask.className = 'task-item';

  const checkBtn = document.createElement('button');
  checkBtn.className = 'task-check';
  checkBtn.setAttribute('onclick', 'checkOrUncheck(this)');
  checkBtn.innerHTML = '';

  const textDiv = document.createElement('div');
  textDiv.className = 'task-text';
  const taskNameSpan = document.createElement('div');
  taskNameSpan.className = 'task-name';
  taskNameSpan.textContent = taskName.trim();
  const taskMetaSpan = document.createElement('div');
  taskMetaSpan.className = 'task-meta';
  taskMetaSpan.textContent = metaText;

  textDiv.appendChild(taskNameSpan);
  textDiv.appendChild(taskMetaSpan);

  const tagSpan = document.createElement('span');
  tagSpan.className = 'task-tag tag-blue';
  tagSpan.textContent = 'Pending';

  newTask.appendChild(checkBtn);
  newTask.appendChild(textDiv);
  newTask.appendChild(tagSpan);
  container.appendChild(newTask);
  addTaskControls(newTask);

  updateBadgeCount();
  saveTasks();
};

// ======================== INITIALIZATION ON PAGE LOAD ========================
document.addEventListener('DOMContentLoaded', function() {
  const loaded = loadTasks();
  if (!loaded) {
    saveTasks();
    updateBadgeCount();
  }
  // Always add edit/delete buttons to all tasks (static or loaded)
  addButtonsToAllTasks();
});



function addTaskControls(taskItem) {
  // Avoid adding duplicate buttons
  if (taskItem.querySelector('.task-controls')) return;
  
  const controlsDiv = document.createElement('div');
  controlsDiv.className = 'task-controls';
  controlsDiv.style.display = 'flex';
  controlsDiv.style.gap = '8px';
  controlsDiv.style.marginLeft = 'auto';
  
  // Edit button
  const editBtn = document.createElement('button');
  editBtn.textContent = '✏️';
  editBtn.className = 'task-edit-btn';
  editBtn.style.background = 'none';
  editBtn.style.border = 'none';
  editBtn.style.cursor = 'pointer';
  editBtn.style.fontSize = '18px';
  editBtn.style.padding = '4px 8px';
  editBtn.style.borderRadius = '8px';
  editBtn.style.transition = '0.2s';
  editBtn.onclick = () => editTask(editBtn);
  
  // Delete button
  const delBtn = document.createElement('button');
  delBtn.textContent = '🗑️';
  delBtn.className = 'task-delete-btn';
  delBtn.style.background = 'none';
  delBtn.style.border = 'none';
  delBtn.style.cursor = 'pointer';
  delBtn.style.fontSize = '18px';
  delBtn.style.padding = '4px 8px';
  delBtn.style.borderRadius = '8px';
  delBtn.onclick = () => deleteTask(delBtn);
  
  controlsDiv.appendChild(editBtn);
  controlsDiv.appendChild(delBtn);
  
  // Append controls after the tag span
  const tagSpan = taskItem.querySelector('.task-tag');
  if (tagSpan) {
    taskItem.insertBefore(controlsDiv, tagSpan.nextSibling);
  } else {
    taskItem.appendChild(controlsDiv);
  }
}

// Add buttons to all existing tasks (call after load or DOM ready)
function addButtonsToAllTasks() {
  const container = document.querySelector('.card > div[style*="flex-direction: row"]');
  if (!container) return;
  const tasks = container.querySelectorAll('.task-item');
  tasks.forEach(task => addTaskControls(task));
}


function editTask(editButton) {
  const taskItem = editButton.closest('.task-item');
  const taskNameDiv = taskItem.querySelector('.task-name');
  const taskMetaDiv = taskItem.querySelector('.task-meta');
  const currentName = taskNameDiv.textContent;
  const currentMeta = taskMetaDiv.textContent;
  
  // Parse current meta to extract subject and due date (if present)
  let currentSubject = '';
  let currentDueDate = '';
  const subjectMatch = currentMeta.match(/Subject:\s*([^·]+)/);
  if (subjectMatch) currentSubject = subjectMatch[1].trim();
  const dueMatch = currentMeta.match(/Due\s*([^·]+|$)/);
  if (dueMatch && !currentMeta.includes('Subject')) {
    // if no subject but only due date
    currentDueDate = dueMatch[1]?.trim() || '';
  } else if (dueMatch) {
    currentDueDate = dueMatch[1]?.trim() || '';
  }
  
  // Prompt for new values (with pre-filled defaults)
  const newName = prompt("Edit task name:", currentName);
  if (newName === null) return;
  
  const newSubject = prompt("Edit subject (e.g., Math, Physics):", currentSubject);
  if (newSubject === null) return;
  
  const newDueDate = prompt("Edit due date (e.g., Apr 30, 2026) or leave empty:", currentDueDate);
  if (newDueDate === null) return;
  
  // Build new meta text
  let newMeta = "";
  if (newSubject.trim() !== "") {
    newMeta = `Subject: ${newSubject.trim()}`;
  }
  if (newDueDate.trim() !== "") {
    if (newMeta !== "") newMeta += ` · Due ${newDueDate.trim()}`;
    else newMeta = `Due ${newDueDate.trim()}`;
  }
  if (newMeta === "") newMeta = "No subject or due date";
  
  // Update the DOM
  taskNameDiv.textContent = newName.trim();
  taskMetaDiv.textContent = newMeta;
  
  // Save changes
  saveTasks();
}




function deleteTask(deleteButton) {
  const taskItem = deleteButton.closest('.task-item');
  if (confirm("Are you sure you want to delete this task?")) {
    taskItem.remove();
    updateBadgeCount();
    saveTasks();
  }
}


