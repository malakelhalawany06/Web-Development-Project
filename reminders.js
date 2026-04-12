// ----- REMINDERS WITH USER-SELECTED PRIORITY (localStorage) -----
let reminders = [];

// Load from localStorage
function loadReminders() {
  const stored = localStorage.getItem("loomhub_reminders_priority");
  if (stored) {
    reminders = JSON.parse(stored);
  } else {
    // Default sample reminders so the page isn't empty
    reminders = [
      { id: Date.now() + 101, text: "Data Structures quiz preparation", completed: false, priority: "high" },
      { id: Date.now() + 102, text: "Calculus II problem set", completed: false, priority: "high" },
      { id: Date.now() + 103, text: "Read Networks chapter 7", completed: false, priority: "medium" },
      { id: Date.now() + 104, text: "Group meeting: DB project", completed: true, priority: "low" },
      { id: Date.now() + 105, text: "AI ethics paper outline", completed: false, priority: "medium" }
    ];
    saveReminders();
  }
  renderAll();
}

function saveReminders() {
  localStorage.setItem("loomhub_reminders_priority", JSON.stringify(reminders));
}

// Update stats & sidebar badge
function updateStats() {
  const total = reminders.length;
  const completed = reminders.filter(r => r.completed).length;
  const pending = total - completed;
  const urgent = reminders.filter(r => !r.completed && r.priority === "high").length;
  
  document.getElementById("totalReminders").innerText = total;
  document.getElementById("completedReminders").innerText = completed;
  document.getElementById("pendingReminders").innerText = pending;
  document.getElementById("urgentReminders").innerText = urgent;
  
  const badge = document.getElementById("reminderBadge");
  if (badge) badge.innerText = pending;
}

// Render reminders list with priority badges
function renderReminders() {
  const container = document.getElementById("remindersContainer");
  if (!container) return;

  if (reminders.length === 0) {
    container.innerHTML = `<div class="empty-message">✨ No reminders yet. Add one above ✨</div>`;
    return;
  }

  container.innerHTML = reminders.map(rem => {
    const isCompleted = rem.completed;
    const priority = rem.priority || "medium";
    let priorityBadge = "";
    if (priority === "high") priorityBadge = `<span class="priority-badge priority-high">HIGH</span>`;
    else if (priority === "medium") priorityBadge = `<span class="priority-badge priority-medium">MEDIUM</span>`;
    else priorityBadge = `<span class="priority-badge priority-low">LOW</span>`;
    
    return `
      <div class="reminder-item" data-id="${rem.id}">
        <input type="checkbox" class="reminder-check" ${isCompleted ? "checked" : ""} data-id="${rem.id}" />
        <div class="reminder-text ${isCompleted ? 'completed' : ''}">
          ${escapeHtml(rem.text)}
          ${priorityBadge}
        </div>
        <button class="delete-reminder" data-id="${rem.id}" title="Delete reminder">🗑️</button>
      </div>
    `;
  }).join("");

  // attach event listeners
  document.querySelectorAll('.reminder-check').forEach(cb => {
    cb.addEventListener('change', (e) => {
      const id = parseInt(e.target.getAttribute('data-id'));
      toggleComplete(id, e.target.checked);
    });
  });

  document.querySelectorAll('.delete-reminder').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(btn.getAttribute('data-id'));
      deleteReminder(id);
    });
  });
}

function toggleComplete(id, isChecked) {
  const reminder = reminders.find(r => r.id === id);
  if (reminder) {
    reminder.completed = isChecked;
    saveReminders();
    renderAll();
  }
}

function deleteReminder(id) {
  reminders = reminders.filter(r => r.id !== id);
  saveReminders();
  renderAll();
}

function addReminder(text, priority) {
  const trimmed = text.trim();
  if (trimmed === "") {
    alert("Please enter a reminder.");
    return false;
  }
  const newId = Date.now();
  reminders.unshift({
    id: newId,
    text: trimmed,
    completed: false,
    priority: priority
  });
  saveReminders();
  renderAll();
  return true;
}

function clearCompleted() {
  reminders = reminders.filter(r => !r.completed);
  saveReminders();
  renderAll();
}

function renderAll() {
  renderReminders();
  updateStats();
}

function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}

// Setup search functionality (replace static search div with input)
function setupSearch() {
  const searchContainer = document.getElementById("searchPlaceholder");
  if (!searchContainer) return;
  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "🔍 Search reminders...";
  input.style.cssText = "background: var(--surface); border: 1px solid var(--border2); border-radius: var(--radius-sm); padding: 0.4rem 0.75rem; font-size: 13px; color: var(--text2); width: 200px; outline: none;";
  input.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();
    const items = document.querySelectorAll(".reminder-item");
    items.forEach(item => {
      const textElem = item.querySelector(".reminder-text");
      if (textElem) {
        const title = textElem.innerText.toLowerCase();
        item.style.display = title.includes(query) ? "flex" : "none";
      }
    });
  });
  searchContainer.replaceWith(input);
}

// Event listeners
document.addEventListener("DOMContentLoaded", () => {
  loadReminders();
  setupSearch();

  const addBtn = document.getElementById("addReminderBtn");
  const inputField = document.getElementById("reminderInput");
  const prioritySelect = document.getElementById("prioritySelect");

  addBtn.addEventListener("click", () => {
    const priority = prioritySelect.value;
    if (addReminder(inputField.value, priority)) {
      inputField.value = "";
      prioritySelect.value = "medium";
      inputField.focus();
    }
  });

  inputField.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const priority = prioritySelect.value;
      if (addReminder(inputField.value, priority)) {
        inputField.value = "";
        prioritySelect.value = "medium";
      }
    }
  });

  const clearBtn = document.getElementById("clearCompletedBtn");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (confirm("Delete all completed reminders?")) {
        clearCompleted();
      }
    });
  }
});