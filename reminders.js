// ----- REMINDERS WITH DUE DATE, NOTES, PRIORITY -----
let reminders = [];

function loadReminders() {
  const stored = localStorage.getItem("loomhub_reminders_priority");
  if (stored) {
    reminders = JSON.parse(stored);
  } else {
    // Default reminders with due dates & notes
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const nextWeek = new Date(now);
    nextWeek.setDate(now.getDate() + 7);
    reminders = [
      { id: Date.now()+101, text: "Data Structures quiz", completed: false, priority: "high", dueDate: tomorrow.toISOString().slice(0,16), notes: "Chapter 7 & 8, review Dijkstra" },
      { id: Date.now()+102, text: "Calculus problem set", completed: false, priority: "high", dueDate: new Date(now.getTime() + 3*86400000).toISOString().slice(0,16), notes: "Integration by parts" },
      { id: Date.now()+103, text: "Read Networks ch.7", completed: false, priority: "medium", dueDate: nextWeek.toISOString().slice(0,16), notes: "TCP/IP overview" },
      { id: Date.now()+104, text: "Group meeting DB project", completed: true, priority: "low", dueDate: "", notes: "Zoom link in email" },
      { id: Date.now()+105, text: "AI ethics paper outline", completed: false, priority: "medium", dueDate: "", notes: "" }
    ];
    saveReminders();
  }
  renderAll();
  updateSidebarBadge();
}

function saveReminders() {
  localStorage.setItem("loomhub_reminders_priority", JSON.stringify(reminders));
  updateStats();
  updateSidebarBadge();
}

function updateStats() {
  const total = reminders.length;
  const completed = reminders.filter(r => r.completed).length;
  const pending = total - completed;
  const urgent = reminders.filter(r => !r.completed && r.priority === "high").length;
  document.getElementById("totalReminders").innerText = total;
  document.getElementById("completedReminders").innerText = completed;
  document.getElementById("pendingReminders").innerText = pending;
  document.getElementById("urgentReminders").innerText = urgent;
}

function updateSidebarBadge() {
  const badge = document.getElementById("reminderBadge");
  if (!badge) return;
  const pending = reminders.filter(r => !r.completed).length;
  badge.innerText = pending;
}

function formatDueDate(dueDateStr) {
  if (!dueDateStr) return null;
  const due = new Date(dueDateStr);
  const now = new Date();
  const diffDays = Math.ceil((due - now) / (1000*60*60*24));
  let statusClass = "";
  let label = "";
  if (diffDays < 0) { statusClass = "overdue"; label = `Overdue by ${Math.abs(diffDays)}d`; }
  else if (diffDays === 0) { statusClass = "soon"; label = "Due today"; }
  else if (diffDays === 1) { statusClass = "soon"; label = "Due tomorrow"; }
  else if (diffDays <= 3) { statusClass = "soon"; label = `Due in ${diffDays} days`; }
  else { label = `Due ${due.toLocaleDateString()}`; }
  const time = due.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
  return { label: `${label} at ${time}`, class: statusClass };
}

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

    const dueInfo = formatDueDate(rem.dueDate);
    const dueHtml = dueInfo ? `<div class="reminder-due ${dueInfo.class}">📅 ${dueInfo.label}</div>` : "";
    const notesHtml = rem.notes ? `<div class="reminder-notes" id="notes-${rem.id}">📝 ${escapeHtml(rem.notes)}</div>` : "";
    const notesToggle = rem.notes ? `<button class="reminder-notes-toggle" data-id="${rem.id}">📄 Notes</button>` : "";

    return `
      <div class="reminder-item" data-id="${rem.id}">
        <input type="checkbox" class="reminder-check" ${isCompleted ? "checked" : ""} data-id="${rem.id}" />
        <div class="reminder-text ${isCompleted ? 'completed' : ''}" style="flex-direction:column; align-items:flex-start;">
          <div>${escapeHtml(rem.text)} ${priorityBadge} ${notesToggle}</div>
          ${dueHtml}
          ${notesHtml}
        </div>
        <button class="delete-reminder" data-id="${rem.id}" title="Delete reminder">🗑️</button>
      </div>
    `;
  }).join("");

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
  document.querySelectorAll('.reminder-notes-toggle').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(btn.getAttribute('data-id'));
      const notesDiv = document.getElementById(`notes-${id}`);
      if (notesDiv) notesDiv.classList.toggle('show');
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

function addReminder(text, priority, dueDate, notes) {
  const trimmed = text.trim();
  if (trimmed === "") { alert("Please enter a reminder."); return false; }
  reminders.unshift({
    id: Date.now(),
    text: trimmed,
    completed: false,
    priority: priority,
    dueDate: dueDate || "",
    notes: notes || ""
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
  return str.replace(/[&<>]/g, m => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;' }[m]));
}

function setupSearch() {
  const searchDiv = document.getElementById("searchPlaceholder");
  if (!searchDiv) return;
  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "🔍 Search reminders...";
  input.style.cssText = "background: var(--surface); border: 1px solid var(--border2); border-radius: var(--radius-sm); padding: 0.4rem 0.75rem; font-size: 13px; color: var(--text2); width: 200px; outline: none;";
  input.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();
    document.querySelectorAll(".reminder-item").forEach(item => {
      const textEl = item.querySelector(".reminder-text");
      const title = textEl ? textEl.innerText.toLowerCase() : "";
      item.style.display = title.includes(query) ? "flex" : "none";
    });
  });
  searchDiv.replaceWith(input);
}

document.addEventListener("DOMContentLoaded", () => {
  loadReminders();
  setupSearch();

  const addBtn = document.getElementById("addReminderBtn");
  const inputField = document.getElementById("reminderInput");
  const prioritySelect = document.getElementById("prioritySelect");
  const dueDateTime = document.getElementById("dueDateTime");
  const notesInput = document.getElementById("notesInput");

  addBtn.addEventListener("click", () => {
    if (addReminder(inputField.value, prioritySelect.value, dueDateTime.value, notesInput.value)) {
      inputField.value = "";
      prioritySelect.value = "medium";
      dueDateTime.value = "";
      notesInput.value = "";
      inputField.focus();
    }
  });
  inputField.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (addReminder(inputField.value, prioritySelect.value, dueDateTime.value, notesInput.value)) {
        inputField.value = "";
        prioritySelect.value = "medium";
        dueDateTime.value = "";
        notesInput.value = "";
      }
    }
  });

  document.getElementById("clearCompletedBtn").addEventListener("click", () => {
    if (confirm("Delete all completed reminders?")) clearCompleted();
  });
});