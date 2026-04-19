// ========================
// Q&A – per‑major default questions
// ========================

let questions = [];
let currentUser = null;

function getStorageKey() {
  return currentUser ? `user_${currentUser.username}_qa_forum` : null;
}

// Generate default questions based on major (from your images)
function generateDefaultQuestions(user) {
  const { firstName, lastName, major, academicYear, role } = user;
  if (role === 'instructor') return []; // instructors get no default questions

  const yearNum = parseInt(academicYear) || 1;
  const author = `${firstName} ${lastName}`;

  const questionMap = {
    'Computer Science': [
      { title: 'How does Dijkstra\'s algorithm handle negative weights?', tag: 'Data Structures', body: 'I know it works for positive weights, but what about negative edges?' },
      { title: 'Best resources for understanding JOIN types in SQL?', tag: 'Database', body: 'Struggling with INNER, LEFT, RIGHT, and FULL OUTER JOINs.' },
      { title: 'Difference between TCP and UDP?', tag: 'Networks', body: 'When to use each?' }
    ],
    'Business Informatics': [
      { title: 'What is the difference between operational and strategic decisions?', tag: 'General', body: 'Examples in business context.' },
      { title: 'How to design an effective database for an e‑commerce site?', tag: 'Database', body: 'Best practices for normalization and indexing.' }
    ],
    'Applied Arts': [
      { title: 'What are the key principles of typography?', tag: 'General', body: 'Explain kerning, leading, and tracking.' },
      { title: 'How to choose sustainable materials for interior design?', tag: 'General', body: 'Factors to consider.' }
    ],
    'Dentistry': [
      { title: 'What are the stages of oral pathology development?', tag: 'General', body: 'From initial lesion to treatment.' },
      { title: 'How to maintain proper sterilization in a dental clinic?', tag: 'General', body: 'Procedures and standards.' }
    ],
    'Law': [
      { title: 'What are the main differences between civil and common law?', tag: 'General', body: 'Key characteristics.' },
      { title: 'Explain the commercial procedures law in Egypt.', tag: 'General', body: 'Main articles and their application.' }
    ]
  };

  let defaultQuestions = questionMap[major];
  if (!defaultQuestions) {
    console.warn(`Unknown major: ${major}, using fallback questions`);
    defaultQuestions = [
      { title: 'How can I improve my study habits?', tag: 'General', body: 'Tips for better time management.' },
      { title: 'What are the best online resources for this course?', tag: 'General', body: 'Recommendations for tutorials and books.' }
    ];
  }

  const questions = defaultQuestions.map((q, idx) => ({
    id: Date.now() + idx,
    title: `${yearNum > 1 ? `Year ${yearNum} – ` : ''}${q.title}`,
    body: q.body,
    tag: q.tag,
    author: author,
    upvotes: Math.floor(Math.random() * 15) + 1,
    answers: [],
    timestamp: Date.now() - idx * 86400000
  }));
  return questions;
}

// Get current logged‑in user (no fallback)
function getCurrentUser() {
  if (!window.UserManager) return null;
  if (window.UserManager.getAllUsers().length === 0) {
    window.UserManager.loadDemoUsers();
  }
  return window.UserManager.getCurrentUser();
}

function loadData() {
  currentUser = getCurrentUser();
  if (!currentUser) {
    document.getElementById("questionsContainer").innerHTML = `<div class="empty-state">🔒 Please log in to view and ask questions.</div>`;
    return;
  }

  const key = getStorageKey();
  const stored = localStorage.getItem(key);
  if (stored) {
    questions = JSON.parse(stored);
    // Check if first question's major matches current user's major (simple heuristic)
    const expectedTitle = generateDefaultQuestions(currentUser)[0]?.title;
    const firstTitle = questions[0]?.title;
    if (expectedTitle && firstTitle && !firstTitle.includes(expectedTitle.split('–')[0]?.trim())) {
      console.log("Mismatch detected – regenerating questions for", currentUser.username);
      questions = generateDefaultQuestions(currentUser);
      saveData();
    }
  } else {
    questions = generateDefaultQuestions(currentUser);
    saveData();
  }
  renderAll();
}

function saveData() {
  if (!currentUser) return;
  const key = getStorageKey();
  if (key) localStorage.setItem(key, JSON.stringify(questions));
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

// Manual reset button (add to HTML if needed)
function resetMyQuestions() {
  if (!currentUser) return;
  if (confirm(`Reset all questions for ${currentUser.firstName}? This will replace your current questions with default ones for your major.`)) {
    questions = generateDefaultQuestions(currentUser);
    saveData();
    renderAll();
  }
}

window.addEventListener('storage', (e) => {
  if (e.key === 'app_current_user') loadData();
});
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) loadData();
});

document.addEventListener("DOMContentLoaded", () => {
  loadData();
  setupSearch();
  setupAskForm();
  setupFilters();

  // Optional: add reset button event if exists
  const resetBtn = document.getElementById("resetQuestionsBtn");
  if (resetBtn) resetBtn.addEventListener("click", resetMyQuestions);
});