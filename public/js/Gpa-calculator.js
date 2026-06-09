let courses = [];

// ===== 1. INITIALIZE PAGE & FETCH DATA FROM MONGO DB =====
document.addEventListener("DOMContentLoaded", async () => {
    console.log("LoomHub Cloud Database-driven GPA Calculator Active (No Local Storage).");
    
    try {
        // Fetch the active user session directly from our server endpoint
        const response = await fetch('/api/user/session');
        const data = await response.json();

        if (data.success && data.user && data.user.courses) {
            // Load the courses array straight out of MongoDB into memory
            courses = data.user.courses;
            
            // Render the rows inside your HTML table structure
            renderTable();
            
            // Recalculate values and push them to the UI text display on load
            const initialGPA = calculateLiveGPAScore();
            const gpaValBox = document.getElementById("gpaValue");
            if (gpaValBox) gpaValBox.innerText = initialGPA;
        }
    } catch (err) {
        console.error("Failed to load user course history from cloud:", err);
    }
    
    // Ensure the visual meter bar stretches to match the true loaded database GPA score
    updateGPABarDisplay();
});

// ===== 2. ADD COURSE & SYNC TO CLOUD =====
async function addCourse() {
    const nameInput = document.getElementById("courseName");
    const creditsInput = document.getElementById("credits");
    const gradeSelect = document.getElementById("grade");

    if (!nameInput || !creditsInput || !gradeSelect) return;

    const name = nameInput.value.trim();
    const credits = parseInt(creditsInput.value);
    const gradeValue = parseFloat(gradeSelect.value);
    const gradeText = gradeSelect.options[gradeSelect.selectedIndex].text;

    // Validation: Block negative numbers or zero for credit hours
    if (isNaN(credits) || credits <= 0) {
        alert("Invalid Input: Credit hours must be a positive number greater than 0!");
        creditsInput.value = "";
        return;
    }

    if (!name || isNaN(gradeValue)) {
        alert("Please fill out all course details correctly.");
        return;
    }

    const points = (credits * gradeValue).toFixed(2);
    // Generate an ID for rendering and deletion tracking
    const newCourse = { id: Date.now(), name, credits, gradeValue, gradeText, points };
    
    // Add to our running local array state
    courses.push(newCourse);

    // Sync full courses array to database alongside recalculated GPA
    const liveGPA = calculateLiveGPAScore();
    await syncAllDataToDatabase(liveGPA, courses);

    // Reset layout input forms safely
    nameInput.value = "";
    creditsInput.value = "";
    gradeSelect.value = "";

    renderTable();
    updateGPABarDisplay();
}

// ===== 3. REMOVE COURSE & ARCHIVE TO HIDDEN FILES =====
async function removeCourse(id) {
    const targetCourse = courses.find(c => c.id === id);
    
    if (targetCourse) {
        try {
            // First step: Log to the archive backup collection
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
            console.log("[ARCHIVE SUCCESS] Course cataloged securely in hidden_files collection.");
        } catch (err) {
            console.error("Archive syncing encountered an error:", err);
        }
    }

    // Filter out the course from local list array
    courses = courses.filter(c => c.id !== id);
    
    // Recalculate and push updated arrays to MongoDB
    const liveGPA = calculateLiveGPAScore();
    await syncAllDataToDatabase(liveGPA, courses);
    
    renderTable();
    updateGPABarDisplay();
}

// ===== 4. HELPER: MATHEMATICAL CALCULATIONS EXTRACTOR =====
function calculateLiveGPAScore() {
    if (courses.length === 0) return "0.00";

    let totalCredits = 0;
    let totalPoints = 0;

    courses.forEach(c => {
        totalCredits += c.credits;
        totalPoints += parseFloat(c.points);
    });

    return (totalPoints / totalCredits).toFixed(2);
}

// ===== 5. SINGLE SOURCE OF TRUTH CLOUD COMMUNICATOR =====
async function syncAllDataToDatabase(gpaValue, completeCoursesArray) {
    try {
        const response = await fetch('/api/user/update-gpa', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                gpa: gpaValue,
                courses: completeCoursesArray
            })
        });
        
        const data = await response.json();
        if (data.success) {
            console.log("Database synchronized permanently. GPA:", gpaValue);
        }
    } catch (err) {
        console.error("Critical communication error syncing data to MongoDB:", err);
    }
}

// ===== 6. RENDER TABLE VIEW MODIFIER =====
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

// ===== 7. UI VISUAL METER FILLER EXTRACTOR =====
function updateGPABarDisplay() {
    const gpaValBox = document.getElementById("gpaValue");
    if (!gpaValBox) return;
    
    const liveGPA = calculateLiveGPAScore();
    gpaValBox.innerText = liveGPA;
    
    const percentage = (parseFloat(liveGPA) / 4.0) * 100;
    const gpaBarFill = document.getElementById("gpaBar");
    if (gpaBarFill) gpaBarFill.style.width = `${Math.min(percentage, 100)}%`;
}