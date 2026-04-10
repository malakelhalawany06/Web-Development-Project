let courses = JSON.parse(localStorage.getItem("courses")) || [];

// ===== ADD COURSE =====
function addCourse() {
    let name = document.getElementById("courseName").value;
    let credits = parseFloat(document.getElementById("credits").value);
    let grade = parseFloat(document.getElementById("grade").value);

    // validation
    if (name === "" || isNaN(credits) || isNaN(grade)) {
        alert("Please fill all fields correctly!");
        return;
    }

    let course = {
        name: name,
        credits: credits,
        grade: grade
    };

    courses.push(course);

    // SAVE to localStorage 🔥
    localStorage.setItem("courses", JSON.stringify(courses));

    displayCourses();
    calculateGPA();

    // clear inputs
    document.getElementById("courseName").value = "";
    document.getElementById("credits").value = "";
    document.getElementById("grade").value = "";
}

// ===== DISPLAY COURSES =====
function displayCourses() {
    let table = document.getElementById("courseTable");
    table.innerHTML = "";

    courses.forEach((course, index) => {
        let row = `
        <tr>
            <td>${course.name}</td>
            <td>${course.credits}</td>
            <td>${course.grade}</td>
            <td>${(course.grade * course.credits).toFixed(2)}</td>
            <td>
                <button onclick="deleteCourse(${index})">❌ Delete</button>
            </td>
        </tr>
        `;
        table.innerHTML += row;
    });
}

// ===== CALCULATE GPA =====
function calculateGPA() {
    let totalPoints = 0;
    let totalCredits = 0;

    courses.forEach(course => {
        totalPoints += course.grade * course.credits;
        totalCredits += course.credits;
    });

    let gpa = totalCredits === 0 ? 0 : totalPoints / totalCredits;

    document.getElementById("gpaValue").innerText = gpa.toFixed(2);

    // progress bar
    let percentage = (gpa / 4) * 100;
    document.getElementById("gpaBar").style.width = percentage + "%";

    // SAVE update (important)
    localStorage.setItem("courses", JSON.stringify(courses));
}

// ===== DELETE COURSE =====
function deleteCourse(index) {
    courses.splice(index, 1);

    localStorage.setItem("courses", JSON.stringify(courses));

    displayCourses();
    calculateGPA();
}

// ===== LOAD ON REFRESH =====
window.onload = function () {
    displayCourses();
    calculateGPA();
};