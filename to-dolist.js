function checkOrUncheck(){
        
        const check=document.querySelector('.task-check');
        const task=document.querySeelector('.task-name')
        if(check.classList.contains('done') && task.classList.contains('done')){
        check.classList.remove('done');
        task.classList.remove('done');
        }
        else {
            check.classList.add('done');
            task.classList.add('done');
        }

    }