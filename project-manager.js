let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

/* =======================
   ADD TASK
======================= */
function addTask() {
    let name = document.getElementById("taskName").value;
    let member = document.getElementById("assignedTo").value;
    let deadline = document.getElementById("deadline").value;
    let progress = parseInt(document.getElementById("progress").value);

    // validation
    if (name === "" || member === "" || deadline === "" || isNaN(progress)) {
        alert("Please fill all fields correctly!");
        return;
    }

    let task = {
        name: name,
        member: member,
        deadline: deadline,
        progress: progress
    };

    tasks.push(task);

    // SAVE 🔥
    localStorage.setItem("tasks", JSON.stringify(tasks));

    displayTasks();
    updateProjectProgress();

    // clear inputs
    document.getElementById("taskName").value = "";
    document.getElementById("assignedTo").value = "";
    document.getElementById("deadline").value = "";
    document.getElementById("progress").value = "";
}

/* =======================
   DISPLAY TASKS
======================= */
function displayTasks() {
    let table = document.getElementById("taskTable");

    if (!table) return; // safety check

    table.innerHTML = "";

    tasks.forEach((task, index) => {
        let row = `
        <tr>
            <td>${task.name}</td>
            <td>${task.member}</td>
            <td>${task.deadline}</td>
            <td>${task.progress}%</td>
            <td>
                <button onclick="deleteTask(${index})">❌ Delete</button>
                <button onclick="editTask(${index})">✏️ Edit</button>
            </td>
        </tr>
        `;
        table.innerHTML += row;
    });
}

/* =======================
   DELETE TASK
======================= */
function deleteTask(index) {
    tasks.splice(index, 1);

    localStorage.setItem("tasks", JSON.stringify(tasks));

    displayTasks();
    updateProjectProgress();
}

/* =======================
   EDIT TASK
======================= */
function editTask(index) {
    let task = tasks[index];

    document.getElementById("taskName").value = task.name;
    document.getElementById("assignedTo").value = task.member;
    document.getElementById("deadline").value = task.deadline;
    document.getElementById("progress").value = task.progress;

    tasks.splice(index, 1);

    localStorage.setItem("tasks", JSON.stringify(tasks));

    displayTasks();
    updateProjectProgress();
}

/* =======================
   PROJECT PROGRESS
======================= */
function updateProjectProgress() {
    let total = 0;

    tasks.forEach(task => {
        total += task.progress;
    });

    let avg = tasks.length === 0 ? 0 : total / tasks.length;

    let text = document.getElementById("projectProgressText");
    if (text) {
        text.innerText = avg.toFixed(0) + "%";
    }

    let bar = document.getElementById("projectProgressBar");
    if (bar) {
        bar.style.width = avg + "%";
    }

    // SAVE 🔥
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

/* =======================
   LOAD ON REFRESH
======================= */
window.onload = function () {
    displayTasks();
    updateProjectProgress();
};