// Global variable tracking active courses in memory
let courses = [];

document.addEventListener("DOMContentLoaded", () => {
    console.load = console.log("LoomHub Database-driven GPA Calculator Active.");
    
    // 1. Recover any courses cached in local storage for historical continuity
    const currentUserId = document.getElementById("gpaCalculatorApp")?.dataset?.userId || "guest";
    const storedCourses = localStorage.getItem(`loomhub_courses_${currentUserId}`);
    
    if (storedCourses) {
        courses = JSON.parse(storedCourses);
        renderTable();
    }
    updateGPABarDisplay();
});

// ===== ADD COURSE =====
function addCourse() {
    const nameInput = document.getElementById("courseName");
    const creditsInput = document.getElementById("credits");
    const gradeSelect = document.getElementById("grade");

    if (!nameInput || !creditsInput || !gradeSelect) return;

    const name = nameInput.value.trim();
    const credits = parseInt(creditsInput.value);
    const gradeValue = parseFloat(gradeSelect.value);
    const gradeText = gradeSelect.options[gradeSelect.selectedIndex].text;

    // Validation check
    if (!name || isNaN(credits) || isNaN(gradeValue)) {
        alert("Please fill out all course details correctly.");
        return;
    }

    const points = (credits * gradeValue).toFixed(2);
    const course = { id: Date.now(), name, credits, gradeValue, gradeText, points };
    
    courses.push(course);

    // Sync to browser state tracking
    const currentUserId = document.getElementById("gpaCalculatorApp")?.dataset?.userId || "guest";
    localStorage.setItem(`loomhub_courses_${currentUserId}`, JSON.stringify(courses));

    // Clear active UI elements
    nameInput.value = "";
    creditsInput.value = "";
    gradeSelect.value = "";

    renderTable();
    calculateLiveGPA();
}

// ===== DELETE COURSE (WITH MONGODB HIDDEN_FILES SOFT ARCHIVE) =====
async function removeCourse(id) {
    const targetCourse = courses.find(c => c.id === id);
    
    if (targetCourse) {
        try {
            // Asynchronously dispatch backup tracking data straight into MongoDB 'hidden_files' collection
            await fetch('/api/user/archive-deleted-course', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courseName: targetCourse.name,
                    credits: targetCourse.credits,
                    gradeText: targetCourse.gradeText,
                    points: targetCourse.points
                })
            });
            console.log("[ARCHIVE] Course metadata pushed safely to hidden_files collection.");
        } catch (err) {
            console.error("Archive transaction processing failed:", err);
        }
    }

    // Filter item from local tracking and redraw
    courses = courses.filter(c => c.id !== id);
    const currentUserId = document.getElementById("gpaCalculatorApp")?.dataset?.userId || "guest";
    localStorage.setItem(`loomhub_courses_${currentUserId}`, JSON.stringify(courses));
    
    renderTable();
    calculateLiveGPA();
}

// ===== RENDER TABLE VIEW =====
function renderTable() {
    const tbody = document.getElementById("courseTable");
    if (!tbody) return;
    
    tbody.innerHTML = "";

    courses.forEach(c => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><strong>${c.name}</strong></td>
            <td>${c.credits} hrs</td>
            <td><span class="badge">${c.gradeText}</span></td>
            <td>${c.points}</td>
            <td>
                <button class="btn" style="background:#ff4a4a;padding:4px 8px;font-size:11px;color:white;border:none;border-radius:4px;cursor:pointer;" onclick="removeCourse(${c.id})">🗑 Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// ===== CALCULATE LIVE GPA & SEND TO SERVER =====
function calculateLiveGPA() {
    let liveGPA = "0.00";

    if (courses.length > 0) {
        let totalCredits = 0;
        let totalPoints = 0;

        courses.forEach(c => {
            totalCredits += c.credits;
            totalPoints += parseFloat(c.points);
        });

        liveGPA = (totalPoints / totalCredits).toFixed(2);
    }

    // Update screen components live
    const gpaValBox = document.getElementById("gpaValue");
    if (gpaValBox) gpaValBox.innerText = liveGPA;}