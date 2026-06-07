let dashCourses = [];

// Escape HTML securely preventing XSS mutation script payloads
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== TOGGLE VISIBILITY INPUT FORM PANEL =====
function toggleDashGpaForm() {
    const form = document.getElementById("dash-gpa-form");
    if (form) {
        form.style.display = (form.style.display === "none" || form.style.display === "") ? "flex" : "none";
    }
}

// ===== INTERACTIVE CALCULATOR SYNCHRONIZATION ENGINE LAYER =====
function calculateLiveDashboardGPA() {
    let liveGpaResultStr = "0.00";

    if (dashCourses.length > 0) {
        let cumulativeCredits = 0;
        let weightedPointsAccumulator = 0;

        dashCourses.forEach(c => {
            cumulativeCredits += Number(c.credits);
            weightedPointsAccumulator += parseFloat(c.points);
        });

        if (cumulativeCredits > 0) {
            liveGpaResultStr = (weightedPointsAccumulator / cumulativeCredits).toFixed(2);
        }
    }

    // 1. Sync inner text value inside the card metric wrapper box
    const cardGpaValueNode = document.getElementById("dashGpaValue");
    if (cardGpaValueNode) {
        cardGpaValueNode.innerText = liveGpaResultStr;
    }

    // 2. Adjust linear display bar fill tracking percentage safely
    const indicatorProgressBar = document.getElementById("dashGpaBar");
    if (indicatorProgressBar) {
        const fillPercentage = (parseFloat(liveGpaResultStr) / 4.0) * 100;
        indicatorProgressBar.style.width = `${Math.min(fillPercentage, 100)}%`;
    }

    // 3. RE-ROUTE VALUES LIVE: Updates top metrics card box context layout node seamlessly
    const topCardOverviewNode = document.getElementById("topDashboardGpaCard");
    if (topCardOverviewNode) {
        topCardOverviewNode.innerText = liveGpaResultStr;
    }

    // 4. Fire updates background network tracking parameters downstream to MongoDB collection
    saveGpaDataSyncToServer(liveGpaResultStr);
}

// ===== DISPATCH SYSTEM ASYNC SYNCHRONIZE ENGINE CALLS =====
async function saveGpaDataSyncToServer(gpaValue) {
    try {
        await fetch('/api/user/update-gpa', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gpa: gpaValue })
        });
        console.log(`[SYNC SUCCESS] Matrix updated smoothly across remote node registries: ${gpaValue}`);
    } catch (err) {
        console.error("[SYNC ANOMALY] Background sync connection hit an operational runtime fault:", err);
    }
}

// ===== INLINE CARD EVENT CONTROLLER MOUNT ACTIONS =====
function addDashCourse() {
    const nameInput = document.getElementById("dashCourseName");
    const creditsInput = document.getElementById("dashCredits");
    const gradeSelect = document.getElementById("dashGrade");

    if (!nameInput || !creditsInput || !gradeSelect) return;

    const name = nameInput.value.trim();
    const credits = parseInt(creditsInput.value);
    const gradeValue = parseFloat(gradeSelect.value);
    const gradeText = gradeSelect.options[gradeSelect.selectedIndex].text;

    if (!name || isNaN(credits) || isNaN(gradeValue)) {
        alert("Please provide proper structural row configurations!");
        return;
    }

    const calculatedPoints = (credits * gradeValue).toFixed(2);
    const newCourseRow = { id: Date.now(), name, credits, gradeValue, gradeText, points: calculatedPoints };

    dashCourses.push(newCourseRow);

    // Persist localized sequence tracking indexes inside local stores under profile context
    const appWrapperNode = document.getElementById("dashboardAppWrapper");
    const sessionUserId = appWrapperNode ? appWrapperNode.dataset.userId : "guest";
    localStorage.setItem(`loomhub_courses_${sessionUserId}`, JSON.stringify(dashCourses));

    // Reset layout fields
    nameInput.value = "";
    creditsInput.value = "";
    gradeSelect.value = "";

    renderDashGpaTable();
    calculateLiveDashboardGPA();
}

// ===== WIPE TRACK RECORD ACTIONS CONTROLLER CHANNEL =====
function removeDashCourse(id) {
    dashCourses = dashCourses.filter(c => c.id !== id);
    
    const appWrapperNode = document.getElementById("dashboardAppWrapper");
    const sessionUserId = appWrapperNode ? appWrapperNode.dataset.userId : "guest";
    localStorage.setItem(`loomhub_courses_${sessionUserId}`, JSON.stringify(dashCourses));

    renderDashGpaTable();
    calculateLiveDashboardGPA();
}

// ===== RENDER TRACKER ROW ELEMENTS INSIDE TABLE BODY GRID =====
function renderDashGpaTable() {
    const tbody = document.getElementById("dashCourseTable");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (dashCourses.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:1.5rem; font-size:12px; color:var(--text3);">No active track items loaded. Open standard inputs above to populate tracker rows.</td></tr>`;
        return;
    }

    dashCourses.forEach(c => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><strong>${escapeHtml(c.name)}</strong></td>
            <td>${c.credits} hrs</td>
            <td><span class="badge" style="background: rgba(59,130,246,0.12); color: #3b82f6; padding: 2px 6px; border-radius: 4px;">${escapeHtml(c.gradeText)}</span></td>
            <td style="color: #10b981; font-weight: 500;">${c.points}</td>
            <td style="text-align: center;">
                <button onclick="removeDashCourse(${c.id})" style="background: transparent; border: none; color: #ff4a4a; font-weight: bold; cursor: pointer; font-size: 15px;">&times;</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}
// ===== APP INITIALIZATION SIGNAL REGISTRY MOUNT =====
document.addEventListener('DOMContentLoaded', function() {

    // Pull localized user transaction arrays dynamically from local cache matrices
    const appWrapperNode = document.getElementById("dashboardAppWrapper");
    const sessionUserId = appWrapperNode ? appWrapperNode.dataset.userId : "guest";
    const storedHistoryCache = localStorage.getItem(`loomhub_courses_${sessionUserId}`);

    if (storedHistoryCache) {
        dashCourses = JSON.parse(storedHistoryCache);
        renderDashGpaTable();
        calculateLiveDashboardGPA();
    } else {
        // Safe configuration path setting up layout parameters from database properties data assets 
        const topCardOverviewNode = document.getElementById("topDashboardGpaCard");
        const cardGpaValueNode = document.getElementById("dashGpaValue");
        const indicatorProgressBar = document.getElementById("dashGpaBar");

        let databaseGpaVal = parseFloat(topCardOverviewNode?.innerText) || 0.00;
        if (cardGpaValueNode) cardGpaValueNode.innerText = databaseGpaVal.toFixed(2);
        if (indicatorProgressBar) {
            let percentage = (databaseGpaVal / 4.0) * 100;
            indicatorProgressBar.style.width = `${Math.min(percentage, 100)}%`;
        }
        renderDashGpaTable();
    }
});