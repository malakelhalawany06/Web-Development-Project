(function () {

    // =====================
    // ADD TASK TO MONGO DATABASE
    // =====================
    window.addTask = async function () {
        const nameEl = document.getElementById("taskName");
        const deadlineEl = document.getElementById("deadline");

        if (!nameEl || !deadlineEl) return;

        const taskName = nameEl.value.trim();
        const deadline = deadlineEl.value;

        if (!taskName || !deadline) {
            alert("Please fill all descriptive task fields correctly!");
            return;
        }

        try {
            const response = await fetch('/api/projects/add-task', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ taskName, deadline })
            });

            const data = await response.json();
            if (data.success) {
                // Instantly refresh the window layout view to query the freshly injected document
                window.location.reload();
            } else {
                alert("Failed to insert target project task: " + data.message);
            }
        } catch (err) {
            console.error("Network communication failure mapping task creation:", err);
            alert("An architectural error occurred while transmitting task data.");
        }
    };

    // =====================
    // UPDATE TASK PROGRESS IN DATABASE LIVE
    // =====================
    window.updateTaskProgress = async function (projectId, taskId) {
        const input = document.getElementById(`prog-${taskId}`);
        if (!input) return;

        let completionPercentage = parseInt(input.value);

        if (isNaN(completionPercentage)) completionPercentage = 0;
        if (completionPercentage < 0) completionPercentage = 0;
        if (completionPercentage > 100) completionPercentage = 100;

        try {
            const response = await fetch(`/api/projects/${projectId}/tasks/${taskId}/progress`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completionPercentage })
            });

            const data = await response.json();
            if (data.success) {
                // Update local elements immediately without hard window reload loops
                document.getElementById(`text-${taskId}`).innerText = completionPercentage + "%";
                document.getElementById(`bar-${taskId}`).style.width = completionPercentage + "%";
                
                // Recalculate global container circular averages asynchronously
                recalculateGlobalProgressRing();
            } else {
                alert("Server rejected processing your progress modifications.");
            }
        } catch (err) {
            console.error("Failed executing asynchronous progressive patch workflow:", err);
        }
    };

    // =====================
    // DELETE TASK FROM DATABASE
    // =====================
    window.deleteTask = async function (projectId, taskId) {
        if (!confirm("Are you sure you want to drop this project milestone task?")) return;

        try {
            const response = await fetch(`/api/projects/${projectId}/tasks/${taskId}/delete`, {
                method: 'POST'
            });

            const data = await response.json();
            if (data.success) {
                // Remove task wrapper from frontend cleanly
                const targetCard = document.getElementById(`card-box-${taskId}`);
                if (targetCard) targetCard.remove();
                
                // Recalculate container progress details or check if section is empty
                recalculateGlobalProgressRing();
                
                // If no task cards are left, show placeholder statement
                const container = document.getElementById("taskTable");
                if (container && container.querySelectorAll('.task-card').length === 0) {
                    container.innerHTML = '<p style="color: #94a3b8; padding: 20px;">No tasks assigned to you at the moment.</p>';
                }
            } else {
                alert("Database operations engine failed deleting target task reference.");
            }
        } catch (err) {
            console.error("Failed communication connection pipeline clearing task:", err);
        }
    };

    // =====================
    // FRONTEND AGGREGATE CALCULATOR
    // =====================
    function recalculateGlobalProgressRing() {
        const valueBoxes = document.querySelectorAll('[id^="text-"]');
        let total = 0;
        let count = valueBoxes.length;

        valueBoxes.forEach(box => {
            total += parseInt(box.innerText) || 0;
        });

        let avg = count ? Math.round(total / count) : 0;

        const text = document.getElementById("projectProgressText");
        const value = document.getElementById("projectProgressValue");
        const ring = document.getElementById("projectProgressRing");

        if (text) text.innerText = avg + "%";
        if (value) value.innerText = avg + "%";

        if (ring) {
            ring.style.background = `conic-gradient(#3b82f6 ${avg * 3.6}deg, #212631 0deg)`;
        }
    }

})();