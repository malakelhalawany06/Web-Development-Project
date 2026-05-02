// ========================
// REMINDERS – per‑user subjects from images
// ========================

let reminders = [];
let currentUser = null;

function getStorageKey() {
  return currentUser ? `user_${currentUser.username}_reminders` : null;
}

// Subject map exactly from your images
function getSubjectsForUser(user) {
  const { university, major, academicYear, role } = user;
  if (role === 'instructor' || !academicYear || academicYear === '') return [];
  const yearNum = parseInt(academicYear);

  const subjectMap = {
    'MIU': {
      'Computer Science': {
        1: ['Digital Logic Design', 'Mathematics', 'Data Structures'],
        2: ['Database Systems', 'Web Development', 'Networks'],
        3: ['Advanced Algorithms', 'Software Engineering', 'Operating Systems']
      }
    },
    'AUC': {
      'Business Informatics': {
        1: ['Applied Economics', 'English for Business'],
        2: ['Innovation Management', 'Database Systems']
      }
    },
    'BUE': {
      'Applied Arts': {
        1: ['Environmental & Passive Technology', 'Architecture Drawing', 'Typography'],
        2: ['Interior Design', 'Remodeling', 'Materials & Finishing']
      }
    },
    'MSA': {
      'Dentistry': {
        1: ['Oral Pathology', 'General Physiology'],
        2: ['Operative Dentistry', 'Computer Applications', 'Microbiology']
      }
    },
    'GVC': {
      'Law': {
        1: ['Commercial Laws & Regulations', 'International Law'],
        2: ['Law of Commercial Procedures', 'Administration Law', 'Technological Design']
      }
    },
    'AASST': {
      'Applied Arts': {
        1: ['Environmental & Passive Technology', 'Architecture Drawing', 'Typography'],
        2: ['Interior Design', 'Remodeling', 'Materials & Finishing']
      }
    }
  };

  const uni = subjectMap[university];
  if (!uni) {
    console.warn(`Unknown university: ${university}, using fallback`);
    return ['General Study', 'Assignment'];
  }
  const majorSubjects = uni[major];
  if (!majorSubjects) {
    console.warn(`Unknown major: ${major}, using fallback`);
    return ['General Study', 'Assignment'];
  }
  let subjects = majorSubjects[yearNum];
  if (!subjects) {
    // fallback to nearest lower year or year 1
    const years = Object.keys(majorSubjects).map(Number).sort((a,b)=>a-b);
    const closest = years.reduce((p,c) => (c <= yearNum ? c : p), 1);
    subjects = majorSubjects[closest];
    console.log(`Year ${yearNum} not found, using year ${closest} for ${major}`);
  }
  return subjects;
}

function generateDefaultReminders(user) {
  const subjects = getSubjectsForUser(user);
  if (subjects.length === 0) return [];
  const now = new Date();
  const reminders = [];
  let id = Date.now();
  subjects.forEach((subject, idx) => {
    const quizDue = new Date(now);
    quizDue.setDate(now.getDate() + (idx+1)*2);
    reminders.push({
      id: id++,
      text: `${subject} – Quiz preparation`,
      completed: false,
      priority: 'high',
      dueDate: quizDue.toISOString().slice(0,16),
      notes: `Review ${subject}`
    });
    const projDue = new Date(now);
    projDue.setDate(now.getDate() + (idx+3)*2);
    reminders.push({
      id: id++,
      text: `${subject} – Group project`,
      completed: false,
      priority: 'medium',
      dueDate: projDue.toISOString().slice(0,16),
      notes: `Team work for ${subject}`
    });
  });
  return reminders;
}

// Get current logged-in user – no fallback!
function getCurrentUser() {
  if (!window.UserManager) return null;
  if (window.UserManager.getAllUsers().length === 0) {
    window.UserManager.loadDemoUsers();
  }
  return window.UserManager.getCurrentUser();
}

function loadReminders() {
  currentUser = getCurrentUser();
  if (!currentUser) {
    document.getElementById("remindersContainer").innerHTML = `<div class="empty-message">🔒 Please log in to see your reminders.</div>`;
    return;
  }

  const key = getStorageKey();
  const stored = localStorage.getItem(key);
  if (stored) {
    reminders = JSON.parse(stored);
    // Optional: verify that the first reminder matches expected subjects for this user
    const expectedSubjects = getSubjectsForUser(currentUser);
    const firstSubject = reminders[0]?.text.split(' – ')[0];
    if (expectedSubjects.length > 0 && !expectedSubjects.includes(firstSubject)) {
      console.log("Mismatch detected – regenerating correct subjects for", currentUser.username);
      reminders = generateDefaultReminders(currentUser);
      saveReminders();
    }
  } else {
    reminders = generateDefaultReminders(currentUser);
    saveReminders();
  }
  renderAll();
  updateSidebarBadge();
}

function saveReminders() {
  if (!currentUser) return;
  const key = getStorageKey();
  if (key) localStorage.setItem(key, JSON.stringify(reminders));
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
  if (badge) badge.innerText = reminders.filter(r => !r.completed).length;
}

function formatDueDate(dueDateStr) {
  if (!dueDateStr) return null;
  const due = new Date(dueDateStr);
  const now = new Date();
  const diffDays = Math.ceil((due - now) / (1000*60*60*24));
  let statusClass = "", label = "";
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
  if (!currentUser) {
    container.innerHTML = `<div class="empty-message">🔒 Please log in to see your reminders.</div>`;
    return;
  }
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
  // Attach listeners
  document.querySelectorAll('.reminder-check').forEach(cb => cb.addEventListener('change', (e) => { const id = parseInt(e.target.getAttribute('data-id')); toggleComplete(id, e.target.checked); }));
  document.querySelectorAll('.delete-reminder').forEach(btn => btn.addEventListener('click', (e) => { const id = parseInt(btn.getAttribute('data-id')); deleteReminder(id); }));
  document.querySelectorAll('.reminder-notes-toggle').forEach(btn => btn.addEventListener('click', (e) => { const id = parseInt(btn.getAttribute('data-id')); const notesDiv = document.getElementById(`notes-${id}`); if (notesDiv) notesDiv.classList.toggle('show'); }));
}

function toggleComplete(id, isChecked) {
  const reminder = reminders.find(r => r.id === id);
  if (reminder) { reminder.completed = isChecked; saveReminders(); renderAll(); }
}

function deleteReminder(id) {
  reminders = reminders.filter(r => r.id !== id);
  saveReminders();
  renderAll();
}

function addReminder(text, priority, dueDate, notes) {
  if (!text.trim()) { alert("Please enter a reminder."); return false; }
  reminders.unshift({ id: Date.now(), text: text.trim(), completed: false, priority: priority, dueDate: dueDate || "", notes: notes || "" });
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
      const title = item.querySelector(".reminder-text")?.innerText.toLowerCase() || "";
      item.style.display = title.includes(query) ? "flex" : "none";
    });
  });
  searchDiv.replaceWith(input);
}

// Manual reset button (add this to HTML if you want)
function resetMyReminders() {
  if (!currentUser) return;
  if (confirm(`Reset all reminders for ${currentUser.firstName}? This will replace your current reminders with default subjects for your major.`)) {
    reminders = generateDefaultReminders(currentUser);
    saveReminders();
    renderAll();
  }
}

window.addEventListener('storage', (e) => {
  if (e.key === 'app_current_user') loadReminders();
});
document.addEventListener('visibilitychange', () => { if (!document.hidden) loadReminders(); });

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
      inputField.value = ""; prioritySelect.value = "medium"; dueDateTime.value = ""; notesInput.value = ""; inputField.focus();
    }
  });
  inputField.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (addReminder(inputField.value, prioritySelect.value, dueDateTime.value, notesInput.value)) {
        inputField.value = ""; prioritySelect.value = "medium"; dueDateTime.value = ""; notesInput.value = "";
      }
    }
  });
  document.getElementById("clearCompletedBtn").addEventListener("click", () => { if (confirm("Delete all completed reminders?")) clearCompleted(); });
});