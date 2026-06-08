let courses = [];

document.addEventListener("DOMContentLoaded", () => {
    console.log("LoomHub External JS Database-driven GPA Calculator Active.");
    
    // Read the user ID metadata embedded safely in our HTML node structure
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

    // ✅ VALIDATION: Block negative numbers or zero for credit hours
    if (isNaN(credits) || credits <= 0) {
        alert("Invalid Input: Credit hours must be a positive number greater than 0!");
        creditsInput.value = ""; // Clear the input field
        return;
    }

    if (!name || isNaN(gradeValue)) {
        alert("Please fill out all course details correctly.");
        return;
    }

    const points = (credits * gradeValue).toFixed(2);
    const course = { id: Date.now(), name, credits, gradeValue, gradeText, points };
    
    courses.push(course);

    const currentUserId = document.getElementById("gpaCalculatorApp")?.dataset?.userId || "guest";
    localStorage.setItem(`loomhub_courses_${currentUserId}`, JSON.stringify(courses));

    nameInput.value = "";
    creditsInput.value = "";
    gradeSelect.value = "";

    renderTable();
    calculateLiveGPA();
}

// ===== DELETE COURSE (TRIGGERS MONGODB ARCHIVAL AUTOMATICALLY) =====
async function removeCourse(id) {
    const targetCourse = courses.find(c => c.id === id);
    
    if (targetCourse) {
        try {
            // Send the data block over to the archive endpoint
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
            console.log("[SOFT-DELETE SUCCESS] Course tracking cataloged securely in hidden_files collection.");
        } catch (err) {
            console.error("Soft-deletion archive sync pipeline encountered an error:", err);
        }
    }

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

    const gpaValBox = document.getElementById("gpaValue");
    if (gpaValBox) gpaValBox.innerText = liveGPA;
    
    const percentage = (parseFloat(liveGPA) / 4.0) * 100;
    const gpaBarFill = document.getElementById("gpaBar");
    if (gpaBarFill) gpaBarFill.style.width = `${Math.min(percentage, 100)}%`;

    saveGpaToDatabase(liveGPA);
}

// ===== STABILIZE PROGRESS BAR SCALER ON PAGE LOAD =====
function updateGPABarDisplay() {
    const gpaValBox = document.getElementById("gpaValue");
    if (!gpaValBox) return;
    
    const currentVal = parseFloat(gpaValBox.innerText) || 0.00;
    const percentage = (currentVal / 4.0) * 100;
    
    const gpaBarFill = document.getElementById("gpaBar");
    if (gpaBarFill) gpaBarFill.style.width = `${Math.min(percentage, 100)}%`;
}

// ===== ASYNC MONGODB COMMUNICATOR BACKBONE =====
async function saveGpaToDatabase(gpaValue) {
    try {
        const response = await fetch('/api/user/update-gpa', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gpa: gpaValue })
        });
        const data = await response.json();
        if (data.success) {
            console.log("Successfully synchronized real-time GPA inside Mongo collection:", gpaValue);
        }
    } catch (err) {
        console.error("Critical communications error processing database sync request:", err);
    }
}