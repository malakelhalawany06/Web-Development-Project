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
  const meta = taskItem.querySelector('.task-meta');
  
  const isNowDone = !check.classList.contains('done');
  
  if (isNowDone) {
    // Mark as done
    check.classList.add('done');
    check.innerHTML = "✓";
    task.classList.add('done');
    tag.className = 'task-tag tag-green';
    tag.textContent = 'Done';
    // Change only the status part in meta (keep due date)
    if (meta && !meta.textContent.includes('Completed')) {
      meta.textContent = meta.textContent.replace('Pending', 'Completed');
    }
  } else {
    // Mark as not done
    check.classList.remove('done');
    check.innerHTML = "";
    task.classList.remove('done');
    tag.className = 'task-tag tag-blue';
    tag.textContent = 'Pending';
    if (meta && meta.textContent.includes('Completed')) {
      meta.textContent = meta.textContent.replace('Completed', 'Pending');
    }
  }
  
  saveTasks();
};

// ======================== ADD NEW TASK (with due date & custom meta) ========================
window.addTask = function() {
  // Ask for task name
  const taskName = prompt("Enter the task name:");
  if (!taskName || taskName.trim() === "") return;

  // Ask for due date (optional)
  let dueDate = prompt("Enter due date (e.g., Apr 15, 2026) or leave empty:", "");
  let metaText = "";
  
  if (dueDate && dueDate.trim() !== "") {
    metaText = `Due ${dueDate.trim()} · Pending`;
  } else {
    // No due date: use current timestamp
    const now = new Date();
    const formatted = `${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    metaText = `Added ${formatted} · Pending`;
  }

  // Optional: allow user to fully customize the meta line
  const customMeta = prompt("Optional: Custom meta text (leave blank to use above)", "");
  if (customMeta && customMeta.trim() !== "") {
    metaText = customMeta.trim();
  }

  const container = document.querySelector('.card > div[style*="flex-direction: row"]');
  if (!container) {
    console.error("Task container not found!");
    return;
  }

  // Create the new task item
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

  updateBadgeCount();
  saveTasks();  // Save to localStorage immediately
};

// ======================== INITIALIZATION ON PAGE LOAD ========================
document.addEventListener('DOMContentLoaded', function() {
  // Try to load saved tasks; if none exist, keep static ones and save them
  const loaded = loadTasks();
  if (!loaded) {
    // No saved tasks found – the static HTML tasks are still present.
    // We need to attach the correct event listeners to their check buttons
    // (they already have onclick="checkOrUncheck(this)" so no extra work)
    // Also save the static tasks so they persist from now on.
    saveTasks();
    updateBadgeCount();
  }
});
