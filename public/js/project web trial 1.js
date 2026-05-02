// === DASHBOARD GPA LOGIC ===

// 1. Pre-fill the array with your default courses
let dashCourses = [
  { name: "Data Structures", credits: 3, grade: 4.0 },
  { name: "Calculus II", credits: 4, grade: 3.3 },
  { name: "Database Systems", credits: 3, grade: 3.7 },
  { name: "Networks", credits: 3, grade: 3.0 },
  { name: "Tech Writing", credits: 2, grade: 2.3 }
];

// Map numerical grades to your custom CSS classes and colors
const dashGradeMap = {
  "4.0": { letter: "A", cls: "grade-a", color: "var(--accent3)" },
  "3.7": { letter: "A-", cls: "grade-a", color: "var(--accent3)" },
  "3.3": { letter: "B+", cls: "grade-b", color: "var(--accent)" },
  "3.0": { letter: "B", cls: "grade-b", color: "var(--accent)" },
  "2.7": { letter: "B-", cls: "grade-b", color: "var(--accent)" },
  "2.3": { letter: "C+", cls: "grade-c", color: "var(--warn)" },
  "2.0": { letter: "C", cls: "grade-c", color: "var(--warn)" },
  "1.0": { letter: "D", cls: "grade-c", color: "var(--warn)" },
  "0.0": { letter: "F", cls: "grade-f", color: "var(--danger)" }
};

// 2. Toggle the Quick Add Form
function toggleDashGpaForm() {
  const form = document.getElementById('dash-gpa-form');
  form.style.display = form.style.display === 'none' ? 'flex' : 'none';
}

// 3. Add a new course from the dashboard
function addDashCourse() {
  let name = document.getElementById("dashCourseName").value.trim();
  let credits = parseFloat(document.getElementById("dashCredits").value);
  let grade = parseFloat(document.getElementById("dashGrade").value);

  if (name === "" || isNaN(credits) || isNaN(grade)) {
    alert("Please fill all fields correctly!");
    return;
  }

  dashCourses.push({ name: name, credits: credits, grade: grade });

  // Clear inputs and hide the form
  document.getElementById("dashCourseName").value = "";
  document.getElementById("dashCredits").value = "";
  document.getElementById("dashGrade").value = "";
  toggleDashGpaForm();

  renderDashCourses();
}

// 4. Delete a course
function deleteDashCourse(index) {
  dashCourses.splice(index, 1);
  renderDashCourses();
}

// 5. Render the table and calculate GPA
function renderDashCourses() {
  let table = document.getElementById("dashCourseTable");
  table.innerHTML = "";
  
  let totalPoints = 0;
  let totalCredits = 0;

  dashCourses.forEach((course, index) => {
    // Get styling for the badge
    let style = dashGradeMap[course.grade.toFixed(1)] || { letter: "?", cls: "grade-c", color: "var(--text)" };
    
    // Create the row (with your CSS styling and a delete button)
    let row = `
      <tr>
        <td>${course.name}</td>
        <td>${course.credits}</td>
        <td><span class="grade-badge ${style.cls}">${style.letter}</span></td>
        <td style="font-family:var(--mono);color:${style.color};">${(course.grade).toFixed(1)}</td>
        <td style="text-align: right;">
          <button class="btn btn-ghost" onclick="deleteDashCourse(${index})" style="padding: 2px 6px; font-size: 10px; color: var(--danger); min-width: auto; height: auto;">❌</button>
        </td>
      </tr>
    `;
    table.innerHTML += row;
    
    totalPoints += course.grade * course.credits;
    totalCredits += course.credits;
  });

  // Calculate and update the GPA values
  let gpa = totalCredits === 0 ? 0 : totalPoints / totalCredits;
  document.getElementById("dashGpaValue").innerText = gpa.toFixed(2);
  
  // Update the visual progress bar
  let percentage = (gpa / 4.0) * 100;
  document.getElementById("dashGpaBar").style.width = percentage + "%";
}

// Render everything as soon as the page loads!
window.addEventListener('DOMContentLoaded', renderDashCourses);

// === DASHBOARD Q&A LOGIC ===

// 1. Load data from localStorage (or set defaults if empty)
function loadDashQAData() {
  let stored = localStorage.getItem("loomhub_qa_forum");
  
  if (!stored) {
    // If empty, prepopulate with your original dashboard design data
    const initialData = [
      { id: 1, title: "How does Dijkstra's algorithm handle negative weights?", tag: "Data Structures", author: "Yusuf R.", initials: "YR", color: "purple", upvotes: 12, answers: [1,2,3], timestamp: Date.now() - 7200000 },
      { id: 2, title: "Best resources for understanding JOIN types in SQL?", tag: "Database Systems", author: "Nadia M.", initials: "NM", color: "green", upvotes: 8, answers: [1,2,3,4,5,6,7], timestamp: Date.now() - 18000000 },
      { id: 3, title: "Can someone explain the difference between TCP and UDP?", tag: "Networks", author: "Sara O.", initials: "SO", color: "warn", upvotes: 15, answers: [1,2,3,4,5], timestamp: Date.now() - 86400000 }
    ];
    localStorage.setItem("loomhub_qa_forum", JSON.stringify(initialData));
    return initialData;
  }
  return JSON.parse(stored);
}

// 2. Toggle the Quick Ask Form
function toggleDashQAForm() {
  const form = document.getElementById("dash-qa-form");
  form.style.display = form.style.display === "none" ? "flex" : "none";
}

// 3. Post a new question from the Dashboard
function submitDashQuestion() {
  let title = document.getElementById("dashQATitle").value.trim();
  let tag = document.getElementById("dashQATag").value;

  if (!title) {
    alert("Please type a question first!");
    return;
  }

  let qaList = loadDashQAData();
  
  // Add new question to the beginning of the array
  qaList.unshift({
    id: Date.now(),
    title: title,
    tag: tag,
    author: "Ahmed K.",  // Defaulting to your profile name
    initials: "AK",
    color: "blue",       // Default avatar color for the user
    upvotes: 0,
    answers: [],
    timestamp: Date.now()
  });

  // Save back to local storage (syncs with the Q&A page!)
  localStorage.setItem("loomhub_qa_forum", JSON.stringify(qaList));
  
  // Clean up UI
  document.getElementById("dashQATitle").value = "";
  toggleDashQAForm();
  renderDashQA();
}

// 4. Quick upvote feature for the Dashboard
function upvoteDashQuestion(id) {
  let qaList = loadDashQAData();
  let question = qaList.find(q => q.id === id);
  if (question) {
    question.upvotes = (question.upvotes || 0) + 1;
    localStorage.setItem("loomhub_qa_forum", JSON.stringify(qaList));
    renderDashQA();
  }
}

// 5. Render the top 3 questions
function renderDashQA() {
  let qaList = loadDashQAData();
  let container = document.getElementById("dashQAContainer");
  container.innerHTML = "";

  // Sort by newest first, then grab only the top 3 for the dashboard
  let dashboardItems = qaList.sort((a, b) => b.timestamp - a.timestamp).slice(0, 3);

  dashboardItems.forEach(q => {
    let answersCount = q.answers ? q.answers.length : 0;
    
    // Assign tag colors based on subject
    let tagClass = "tag-blue";
    if (q.tag === "Database Systems" || q.tag === "Database") tagClass = "tag-green";
    if (q.tag === "Networks") tagClass = "tag-warn";

    // Build the exact HTML layout you originally designed
    let html = `
      <div class="qa-item">
        <div class="qa-top">
          <div class="avatar sm ${q.color || "blue"}">${q.initials || "U"}</div>
          <div>
            <div class="qa-q">${q.title}</div>
            <div class="qa-meta">${q.author || "User"} · ${q.tag} · <strong style="color:var(--accent3);">${answersCount} answers</strong></div>
          </div>
        </div>
        <div style="display:flex;gap:6px;margin-top:6px;">
          <div class="vote-btn ${q.upvotes > 0 ? "active" : ""}" onclick="upvoteDashQuestion(${q.id})" style="cursor:pointer;">
            ▲ ${q.upvotes || 0}
          </div>
          <span class="task-tag ${tagClass}">${q.tag}</span>
        </div>
      </div>
    `;
    container.innerHTML += html;
  });
}
document.addEventListener("DOMContentLoaded", function (){
const el = document.querySelector(".topbar-subtitle");

const today = new Date();
el.textContent = today.toLocaleDateString('en-US' ,{
  weekday: 'long',
  year:'numeric' ,
  month:'long' ,
  day:'numeric' ,
}) ;

});

// Render immediately when page loads
window.addEventListener('DOMContentLoaded', renderDashQA);

document.addEventListener("DOMContentLoaded", function () {
    const loader = document.getElementById('page-loader');
    
    if (loader) {
        // 1. BULLETPROOF RELOAD CHECK (Works for local file:/// links)
        let isReload = false;
        if (window.performance) {
            const navEntries = performance.getEntriesByType("navigation");
            // Modern browsers
            if (navEntries.length > 0 && navEntries[0].type === "reload") {
                isReload = true;
            } 
            // Fallback for local files and older browser mechanics
            else if (performance.navigation && performance.navigation.type === 1) {
                isReload = true; 
            }
        }
        
        // 2. Check if this is their first time opening the tab
        const isFirstVisit = !sessionStorage.getItem('welcomeScreenPlayed');

        // 3. Play animation IF it's the first visit OR if they just reloaded
        if (isFirstVisit || isReload) {
            sessionStorage.setItem('welcomeScreenPlayed', 'true');
            
            window.addEventListener('load', function() {
                setTimeout(() => {
                    loader.classList.add('hidden');
                    setTimeout(() => loader.remove(), 600); 
                }, 500); 
            });
            
        } else {
            // 4. HIDE INSTANTLY when just clicking sidebar links
            loader.style.display = 'none';
            loader.remove();
        }
    }
});

//newww
// ===== LOAD GPA ON DASHBOARD =====
document.addEventListener("DOMContentLoaded", function () {
    // Look for the top card on the dashboard
    const topCard = document.getElementById('top-card-gpa');
    
    // If we are on the dashboard...
    if (topCard) {
        // Grab the saved GPA from memory, or use "0.00" if there isn't one yet
        const savedGPA = localStorage.getItem('userSavedGPA') || "0.00";
        topCard.innerText = savedGPA;
    }
});