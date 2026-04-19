(function () {

let tasks = [];

// =====================
// LOAD TASKS SAFELY
// =====================
function loadTasks() {
    const stored = localStorage.getItem("tasks");

    if (!stored) {
        tasks = [];
        return;
    }

    try {
        tasks = JSON.parse(stored);
    } catch (e) {
        console.error("Tasks data corrupted:", e);
        tasks = [];
    }
}

// =====================
// SAVE TASKS
// =====================
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// =====================
// ADD TASK (GLOBAL)
// =====================
window.addTask = function () {

    const nameEl = document.getElementById("taskName");
    const memberEl = document.getElementById("assignedTo");
    const deadlineEl = document.getElementById("deadline");

    if (!nameEl || !memberEl || !deadlineEl) return;

    const name = nameEl.value.trim();
    const member = memberEl.value.trim();
    const deadline = deadlineEl.value;

    if (!name || !member || !deadline) {
        alert("Please fill all fields!");
        return;
    }

    tasks.push({
        name,
        member,
        deadline,
        progress: 0
    });

    saveTasks();
    displayTasks();

    nameEl.value = "";
    memberEl.value = "";
    deadlineEl.value = "";
};

// =====================
// DISPLAY TASKS
// =====================
window.displayTasks = function () {

    const container = document.getElementById("taskTable");
    if (!container) return;

    container.innerHTML = "";

    tasks.forEach((task, index) => {
        container.innerHTML += `
        <div class="task-card">

            <div class="task-card-header">
                <div class="task-info">
                    <h3>${task.name}</h3>
                    <p>Assigned to: ${task.member}</p>
                </div>
            </div>

            <div class="task-meta">
                <div>Due: ${task.deadline}</div>
            </div>

            <div class="progress-section">
                <div>${task.progress}%</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width:${task.progress}%"></div>
                </div>
            </div>

            <div class="task-card-actions">
                <input type="number" id="prog-${index}" value="${task.progress}" min="0" max="100">
                <button onclick="updateTaskProgress(${index})">Update</button>
                <button onclick="deleteTask(${index})">Delete</button>
            </div>

        </div>
        `;
    });

    updateProjectProgress();
};

// =====================
// UPDATE PROGRESS
// =====================
window.updateTaskProgress = function (index) {

    const input = document.getElementById(`prog-${index}`);
    if (!input) return;

    let value = parseInt(input.value);

    if (isNaN(value)) value = 0;
    if (value < 0) value = 0;
    if (value > 100) value = 100;

    tasks[index].progress = value;

    saveTasks();
    displayTasks();
};

// =====================
// DELETE TASK
// =====================
window.deleteTask = function (index) {
    tasks.splice(index, 1);
    saveTasks();
    displayTasks();
};

// =====================
// PROJECT PROGRESS
// =====================
function updateProjectProgress() {

    let total = 0;

    tasks.forEach(t => {
        total += t.progress;
    });

    let avg = tasks.length ? Math.round(total / tasks.length) : 0;

    const text = document.getElementById("projectProgressText");
    const value = document.getElementById("projectProgressValue");
    const ring = document.getElementById("projectProgressRing");

    if (text) text.innerText = avg + "%";
    if (value) value.innerText = avg + "%";

    if (ring) {
        ring.style.background =
            `conic-gradient(#3b82f6 ${avg * 3.6}deg, #212631 0deg)`;
    }
}

// =====================
// INIT (SAFE LOAD)
// =====================
document.addEventListener("DOMContentLoaded", function () {
    loadTasks();
    displayTasks();
});

})();