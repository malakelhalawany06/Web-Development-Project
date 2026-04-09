function checkOrUncheck(button) {
  const taskItem = button.closest('.task-item');
  const check = taskItem.querySelector('.task-check');
  const task = taskItem.querySelector('.task-name');
  
  check.checked = !check.checked;
  
  if (check.checked) {
    check.classList.add('done');
    check.innerHTML = "✓";
    task.classList.add('done');
  } else {
    check.classList.remove('done');
    check.innerHTML = "";
    task.classList.remove('done');
  }
}

function addTask(){
    
}