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