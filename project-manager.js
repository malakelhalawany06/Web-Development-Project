// Load tasks from local storage, or start empty
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

/* =======================
   ADD TASK
======================= */
function addTask() {
    let name = document.getElementById("taskName").value.trim();
    let member = document.getElementById("assignedTo").value.trim();
    let deadline = document.getElementById("deadline").value;

    // validation (progress is removed since it defaults to 0)
    if (name === "" || member === "" || deadline === "") {
        alert("Please fill all fields (Task Name, Member, Deadline)!");
        return;
    }

    let task = {
        name: name,
        member: member,
        deadline: deadline,
        progress: 0 // Default to 0% when created
    };

    tasks.push(task);

    // SAVE 🔥
    localStorage.setItem("tasks", JSON.stringify(tasks));

    displayTasks();

    // clear inputs
    document.getElementById("taskName").value = "";
    document.getElementById("assignedTo").value = "";
    document.getElementById("deadline").value = "";
}

/* =======================
   DISPLAY TASKS (Cards instead of Table)
======================= */
function displayTasks() {
    let container = document.getElementById("taskTable");

    if (!container) return; // safety check

    container.innerHTML = "";

    tasks.forEach((task, index) => {
        // Build the card UI
        let card = `
        <div class="task-card">
            <div class="task-card-header">
                <div class="task-icon"><i class="fa-solid fa-clipboard-check"></i></div>
                <div class="task-info">
                    <h3>${task.name}</h3>
                    <p>Assigned to: ${task.member}</p>
                </div>
            </div>
            <div class="task-meta">
                <div class="date">Due: ${task.deadline}</div>
            </div>
            <div class="progress-section">
                <div class="progress-header">${task.progress}%</div>
                <div class="progress-bar">
                    <div class="progress-fill fill-blue" style="width: ${task.progress}%;"></div>
                </div>
            </div>
            
            <div class="task-card-actions">
                <div class="progress-update">
                    <input type="number" id="update-prog-${index}" value="${task.progress}" min="0" max="100">
                    <button class="btn btn-small" onclick="updateTaskProgress(${index})">Set %</button>
                </div>
                <button class="btn btn-small btn-danger" onclick="deleteTask(${index})">Delete</button>
            </div>
        </div>
        `;
        container.innerHTML += card;
    });

    // Update overall progress whenever tasks are displayed
    updateProjectProgress();
}

/* =======================
   UPDATE INDIVIDUAL TASK PROGRESS
======================= */
function updateTaskProgress(index) {
    let newProgress = parseInt(document.getElementById(`update-prog-${index}`).value);
    
    // Safety check for valid percentage
    if (isNaN(newProgress) || newProgress < 0) newProgress = 0;
    if (newProgress > 100) newProgress = 100;

    tasks[index].progress = newProgress;

    // SAVE 🔥
    localStorage.setItem("tasks", JSON.stringify(tasks));

    displayTasks();
}

/* =======================
   DELETE TASK
======================= */
function deleteTask(index) {
    tasks.splice(index, 1);

    // SAVE 🔥
    localStorage.setItem("tasks", JSON.stringify(tasks));

    displayTasks();
}

/* =======================
   PROJECT PROGRESS (Updated for Circular Ring)
======================= */
function updateProjectProgress() {
    let total = 0;

    tasks.forEach(task => {
        total += task.progress;
    });

    let avg = tasks.length === 0 ? 0 : Math.round(total / tasks.length);

    // Update text elements
    let textElement = document.getElementById("projectProgressText");
    let valueElement = document.getElementById("projectProgressValue");
    
    if (textElement) textElement.innerText = avg + "%";
    if (valueElement) valueElement.innerText = avg + "%";

    // Update the circular gradient ring
    let ring = document.getElementById("projectProgressRing");
    if (ring) {
        // 3.6 degrees per 1%
        ring.style.background = `conic-gradient(#3b82f6 ${avg * 3.6}deg, #212631 0deg)`;
    }
}

/* =======================
   LOAD ON REFRESH
======================= */
window.onload = function () {
    displayTasks();
};