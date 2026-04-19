// ========================
// Q&A with auto-login for Ahmed Khalid
// ========================

let questions = [];
let currentUser = null;

// Helper: get storage key for current user
function getStorageKey() {
  return currentUser ? `user_${currentUser.username}_qa_forum` : null;
}

// Ensure Ahmed Khalid is logged in by default
function ensureDefaultUser() {
  if (!window.UserManager) {
    console.error("UserManager not loaded");
    return null;
  }
  
  // Make sure demo users exist
  if (window.UserManager.getAllUsers().length === 0) {
    window.UserManager.loadDemoUsers();
  }
  
  // Try to get current logged-in user
  let user = window.UserManager.getCurrentUser();
  
  if (!user) {
    // No user logged in – find or create Ahmed Khalid
    user = window.UserManager.getUser("ahmed_khalid");
    if (!user) {
      // Create default user if somehow missing
      const defaultUser = {
        username: "ahmed_khalid",
        firstName: "Ahmed",
        lastName: "Khalid",
        email: "ahmed@loomhub.com",
        password: "pass123",
        role: "student",
        university: "MIU",
        major: "Computer Science",
        academicYear: "3"
      };
      window.UserManager.addUser(defaultUser);
      user = defaultUser;
    }
    // Manually set as current user in localStorage
    localStorage.setItem("app_current_user", user.username);
  }
  
  return user;
}

// Load current user and questions
function loadData() {
  if (!window.UserManager) {
    console.error("UserManager not loaded. Check script order.");
    return;
  }

  // Force Ahmed Khalid to be logged in
  currentUser = ensureDefaultUser();
  
  if (!currentUser) {
    document.getElementById("questionsContainer").innerHTML = `
      <div class="empty-state">❌ Error: Could not set up user. Please refresh.</div>
    `;
    const askBtn = document.getElementById("showAskBtn");
    if (askBtn) askBtn.disabled = true;
    return;
  }

  // Enable ask button
  const askBtn = document.getElementById("showAskBtn");
  if (askBtn) askBtn.disabled = false;

  const key = getStorageKey();
  if (!key) return;

  const stored = localStorage.getItem(key);
  if (stored) {
    questions = JSON.parse(stored);
  } else {
    questions = [];
    saveData();
  }
  renderAll();
}

function saveData() {
  if (!currentUser) return;
  const key = getStorageKey();
  if (key) {
    localStorage.setItem(key, JSON.stringify(questions));
  }
}

let currentFilter = "all";

function renderQuestions() {
  const container = document.getElementById("questionsContainer");
  if (!container) return;

  if (!currentUser) {
    container.innerHTML = `<div class="empty-state">🔒 Please log in to view questions.</div>`;
    return;
  }

  let filtered = questions.filter(q => currentFilter === "all" ? true : q.tag === currentFilter);
  filtered.sort((a, b) => b.timestamp - a.timestamp);

  if (filtered.length === 0) {
    container.innerHTML = `<div class="empty-state">✨ No questions yet. Be the first to ask! ✨</div>`;
    return;
  }

  container.innerHTML = filtered.map(q => {
    const answerCount = q.answers.length;
    const isAuthor = q.author === `${currentUser.firstName} ${currentUser.lastName}`;
    return `
      <div class="question-item" data-id="${q.id}">
        <div class="question-header">
          <div class="question-title" data-id="${q.id}">${escapeHtml(q.title)}</div>
          <div class="question-tag">${escapeHtml(q.tag)}</div>
          <div class="expand-icon" data-id="${q.id}">▼</div>
          ${isAuthor ? `<button class="delete-question-btn" data-id="${q.id}" title="Delete Question">🗑️</button>` : ''}
        </div>
        <div class="question-meta">
          <span>👤 ${escapeHtml(q.author)}</span>
          <span>📅 ${new Date(q.timestamp).toLocaleDateString()}</span>
          <span class="answer-count">💬 ${answerCount} answers</span>
        </div>
        <div class="vote-area">
          <button class="vote-btn" data-id="${q.id}">▲ ${q.upvotes}</button>
        </div>
        <div class="answers-section" id="answers-${q.id}">
          <div class="answers-list">
            ${q.answers.map(a => `
              <div class="answer-item">
                <div class="answer-text">${escapeHtml(a.text)}</div>
                <div class="answer-meta">
                  <span>— ${escapeHtml(a.author)}</span>
                  <span>${new Date(a.timestamp).toLocaleDateString()}</span>
                </div>
              </div>
            `).join('')}
          </div>
          <div class="add-answer-form">
            <input type="text" placeholder="Write an answer..." id="answerInput-${q.id}" />
            <button class="submit-answer" data-id="${q.id}">Answer</button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Attach event listeners
  document.querySelectorAll('.question-title, .expand-icon').forEach(el => {
    el.addEventListener('click', (e) => {
      const id = parseInt(el.getAttribute('data-id'));
      toggleAnswers(id);
    });
  });
  document.querySelectorAll('.vote-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = parseInt(btn.getAttribute('data-id'));
      upvoteQuestion(id);
    });
  });
  document.querySelectorAll('.submit-answer').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(btn.getAttribute('data-id'));
      const input = document.getElementById(`answerInput-${id}`);
      const answerText = input.value.trim();
      if (answerText) {
        addAnswer(id, answerText);
        input.value = '';
      } else {
        alert("Please enter an answer.");
      }
    });
  });
  document.querySelectorAll('.delete-question-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = parseInt(btn.getAttribute('data-id'));
      deleteQuestion(id);
    });
  });
}

function toggleAnswers(questionId) {
  const section = document.getElementById(`answers-${questionId}`);
  if (section) section.classList.toggle('open');
}

function upvoteQuestion(id) {
  if (!currentUser) return;
  const q = questions.find(q => q.id === id);
  if (q) {
    q.upvotes = (q.upvotes || 0) + 1;
    saveData();
    renderAll();
  }
}

function addAnswer(questionId, text) {
  if (!currentUser) {
    alert("Please log in to answer.");
    return;
  }
  const q = questions.find(q => q.id === questionId);
  if (q) {
    q.answers.push({
      text: text,
      author: `${currentUser.firstName} ${currentUser.lastName}`,
      timestamp: Date.now()
    });
    saveData();
    renderAll();
    document.getElementById(`answers-${questionId}`)?.classList.add('open');
  }
}

function addQuestion(title, body, tag) {
  if (!currentUser) {
    alert("Please log in to ask a question.");
    return false;
  }
  if (!title.trim()) {
    alert("Please enter a title.");
    return false;
  }
  const newId = Date.now();
  questions.unshift({
    id: newId,
    title: title.trim(),
    body: body.trim(),
    tag: tag,
    author: `${currentUser.firstName} ${currentUser.lastName}`,
    upvotes: 0,
    answers: [],
    timestamp: Date.now()
  });
  saveData();
  renderAll();
  return true;
}

function deleteQuestion(id) {
  if (!currentUser) return;
  const question = questions.find(q => q.id === id);
  if (question && confirm(`Delete question "${question.title}"?`)) {
    questions = questions.filter(q => q.id !== id);
    saveData();
    renderAll();
  }
}

function renderAll() {
  renderQuestions();
  updateFilterActive();
}

function updateFilterActive() {
  document.querySelectorAll('.filter-tab').forEach(tab => {
    if (tab.getAttribute('data-tag') === currentFilter) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });
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
  input.placeholder = "🔍 Search questions...";
  input.style.cssText = "background: var(--surface); border: 1px solid var(--border2); border-radius: var(--radius-sm); padding: 0.4rem 0.75rem; font-size: 13px; color: var(--text2); width: 200px; outline: none;";
  input.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();
    document.querySelectorAll(".question-item").forEach(item => {
      const title = item.querySelector(".question-title")?.innerText.toLowerCase() || "";
      item.style.display = title.includes(query) ? "block" : "none";
    });
  });
  searchDiv.replaceWith(input);
}

function setupAskForm() {
  const showBtn = document.getElementById("showAskBtn");
  const formContainer = document.getElementById("askFormContainer");
  const cancelBtn = document.getElementById("cancelAskBtn");
  const submitBtn = document.getElementById("submitQuestionBtn");
  const titleInput = document.getElementById("questionTitleInput");
  const bodyInput = document.getElementById("questionBodyInput");
  const tagSelect = document.getElementById("questionTagInput");

  showBtn.addEventListener("click", () => {
    if (!currentUser) {
      alert("Please log in to ask a question.");
      return;
    }
    formContainer.style.display = "block";
    showBtn.style.display = "none";
  });
  cancelBtn.addEventListener("click", () => {
    formContainer.style.display = "none";
    showBtn.style.display = "inline-block";
    titleInput.value = "";
    bodyInput.value = "";
  });
  submitBtn.addEventListener("click", () => {
    if (addQuestion(titleInput.value, bodyInput.value, tagSelect.value)) {
      formContainer.style.display = "none";
      showBtn.style.display = "inline-block";
      titleInput.value = "";
      bodyInput.value = "";
    }
  });
}

function setupFilters() {
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      currentFilter = tab.getAttribute('data-tag');
      renderAll();
    });
  });
}

// Listen for login/logout changes across tabs
window.addEventListener('storage', (e) => {
  if (e.key === 'app_current_user' || e.key?.startsWith('user_')) {
    loadData();
  }
});

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) loadData();
});

document.addEventListener("DOMContentLoaded", () => {
  loadData();
  setupSearch();
  setupAskForm();
  setupFilters();
});