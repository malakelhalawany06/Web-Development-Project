// ----- Q&A DATA MODEL -----
let questions = [];

// Load from localStorage
function loadData() {
  const stored = localStorage.getItem("loomhub_qa_forum");
  if (stored) {
    questions = JSON.parse(stored);
  } else {
    // No default questions – the empty state will appear
  }
  renderAll();
}

function saveData() {
  localStorage.setItem("loomhub_qa_forum", JSON.stringify(questions));
}

let currentFilter = "all";

function renderQuestions() {
  const container = document.getElementById("questionsContainer");
  if (!container) return;

  let filtered = questions.filter(q => {
    if (currentFilter === "all") return true;
    return q.tag === currentFilter;
  });
  // sort by newest first
  filtered.sort((a,b) => b.timestamp - a.timestamp);

  if (filtered.length === 0) {
    container.innerHTML = `<div class="empty-state">✨ No questions yet. Be the first to ask! ✨</div>`;
    return;
  }

  container.innerHTML = filtered.map(q => {
    const answerCount = q.answers.length;
    return `
      <div class="question-item" data-id="${q.id}">
              <div class="question-header">
  <div class="question-title" data-id="${q.id}">${escapeHtml(q.title)}</div>
  <div class="question-tag">${escapeHtml(q.tag)}</div>
  <div class="expand-icon" data-id="${q.id}">▼</div>
  <button class="delete-question-btn" data-id="${q.id}" title="Delete Question">🗑️</button>
</div>
        <div class="question-meta">
          <span>👤 ${escapeHtml(q.author)}</span>
          <span>📅 ${new Date(q.timestamp).toLocaleDateString()}</span>
          <span class="answer-count">💬 ${answerCount} answers</span>
        </div>
        <div class="vote-area">
          <button class="vote-btn" data-id="${q.id}" data-vote="up">▲ ${q.upvotes}</button>
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

  // attach event listeners
  document.querySelectorAll('.question-title').forEach(el => {
    el.addEventListener('click', (e) => {
      const id = parseInt(el.getAttribute('data-id'));
      toggleAnswers(id);
    });
  });
  document.querySelectorAll('.expand-icon').forEach(el => {
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
  if (section) {
    section.classList.toggle('open');
  }
}

function upvoteQuestion(id) {
  const q = questions.find(q => q.id === id);
  if (q) {
    q.upvotes = (q.upvotes || 0) + 1;
    saveData();
    renderAll();
  }
}

function addAnswer(questionId, text) {
  const q = questions.find(q => q.id === questionId);
  if (q) {
    q.answers.push({
      text: text,
      author: "You",
      timestamp: Date.now()
    });
    saveData();
    renderAll();
    // auto-expand the answers section after adding
    const section = document.getElementById(`answers-${questionId}`);
    if (section) section.classList.add('open');
  }
}

function addQuestion(title, body, tag) {
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
    author: "You",
    upvotes: 0,
    answers: [],
    timestamp: Date.now()
  });
  saveData();
  renderAll();
  return true;
}
function deleteQuestion(id) {
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
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}

// Setup search
function setupSearch() {
  const searchDiv = document.getElementById("searchPlaceholder");
  if (!searchDiv) return;
  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "🔍 Search questions...";
  input.style.cssText = "background: var(--surface); border: 1px solid var(--border2); border-radius: var(--radius-sm); padding: 0.4rem 0.75rem; font-size: 13px; color: var(--text2); width: 200px; outline: none;";
  input.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();
    const items = document.querySelectorAll(".question-item");
    items.forEach(item => {
      const titleEl = item.querySelector(".question-title");
      const title = titleEl ? titleEl.innerText.toLowerCase() : "";
      item.style.display = title.includes(query) ? "block" : "none";
    });
  });
  searchDiv.replaceWith(input);
}

// Event listeners for ask form
function setupAskForm() {
  const showBtn = document.getElementById("showAskBtn");
  const formContainer = document.getElementById("askFormContainer");
  const cancelBtn = document.getElementById("cancelAskBtn");
  const submitBtn = document.getElementById("submitQuestionBtn");
  const titleInput = document.getElementById("questionTitleInput");
  const bodyInput = document.getElementById("questionBodyInput");
  const tagSelect = document.getElementById("questionTagInput");

  showBtn.addEventListener("click", () => {
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

// Filter tabs
function setupFilters() {
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      currentFilter = tab.getAttribute('data-tag');
      renderAll();
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadData();
  setupSearch();
  setupAskForm();
  setupFilters();
});