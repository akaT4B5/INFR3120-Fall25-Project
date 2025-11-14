// Wait for the DOM to be fully loaded before running script
document.addEventListener("DOMContentLoaded", () => {

    // Load saved data from localStorage
    let savedSubjects = JSON.parse(localStorage.getItem("subjects") || "[]");
    let savedTasks = JSON.parse(localStorage.getItem("tasks") || "[]");

    function saveAll() {
        localStorage.setItem("subjects", JSON.stringify(savedSubjects));
        localStorage.setItem("tasks", JSON.stringify(savedTasks));
    }

    // Get references to all the necessary elements
    const taskModal = document.getElementById("taskModal");
    const openTaskModalBtn = document.getElementById("openTaskModalBtn");
    const closeBtn = document.querySelector(".close-btn");
    const taskForm = document.getElementById("taskForm");
    const mainSubjectDropdown = document.getElementById("subjectDropdown");
    const formSubjectDropdown = document.getElementById("taskSubjectDropdown");
    const taskListContainer = document.getElementById("taskList");
    const noTasksMessage = document.getElementById("noTasksMessage");
    const deleteTaskBtn = document.getElementById("deleteTaskBtn");
    const editTaskBtn = document.getElementById("editTaskBtn");
    const deleteSubjectBtn = document.getElementById("deleteSubjectBtn");

    // Load saved subjects
    savedSubjects.forEach(sub => {
        const opt1 = document.createElement("option");
        opt1.value = opt1.textContent = sub;
        mainSubjectDropdown.add(opt1);

        const opt2 = document.createElement("option");
        opt2.value = opt2.textContent = sub;
        formSubjectDropdown.add(opt2);
    });

    // Load saved tasks
    savedTasks.forEach(t => {
        const taskCard = document.createElement("div");
        taskCard.className = "task-card";

        taskCard.dataset.subject = t.subject;
        taskCard.dataset.taskName = t.taskName;
        taskCard.dataset.dueDate = t.dueDate;
        taskCard.dataset.description = t.description;

        taskCard.innerHTML = `
            <h4>${t.taskName}</h4>
            <div class="task-meta">
                <span><strong>Subject:</strong> ${t.subject}</span>
                <span><strong>Due:</strong> ${t.dueDate || 'N/A'}</span>
            </div>
            <p>${t.description || 'No description provided.'}</p>
        `;

        taskCard.addEventListener("click", () => {
            const currentSelected = document.querySelector(".task-card.selected");
            if (currentSelected && currentSelected !== taskCard) {
                currentSelected.classList.remove("selected");
            }
            taskCard.classList.toggle("selected");
        });

        taskListContainer.appendChild(taskCard);
    });

    // Variable to keep track of the task being edited
    let taskBeingEdited = null;

    // Functions to open and close the modal
    function openModal() {
        taskModal.style.display = "block";
    }

    function closeModal() {
        taskModal.style.display = "none";
        taskForm.reset();
        taskBeingEdited = null;
        document.querySelector('#taskModal h3').textContent = "Add a New Task";
        document.querySelector('#taskForm button[type="submit"]').textContent = "Submit Task";
    }

    openTaskModalBtn.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);

    window.addEventListener('click', (event) => {
        if (event.target == taskModal) closeModal();
    });

    // Edit task button
    editTaskBtn.addEventListener('click', () => {
        const selectedCard = document.querySelector('.task-card.selected');

        if (!selectedCard) {
            alert("Please select a task to edit first.");
            return;
        }

        taskBeingEdited = selectedCard;

        document.getElementById("taskSubjectDropdown").value = selectedCard.dataset.subject;
        document.getElementById("taskNameInput").value = selectedCard.dataset.taskName;
        document.getElementById("taskDueDateInput").value = selectedCard.dataset.dueDate;
        document.getElementById("taskDescriptionInput").value = selectedCard.dataset.description;

        document.querySelector('#taskModal h3').textContent = "Edit Task";
        document.querySelector('#taskForm button[type="submit"]').textContent = "Update Task";

        openModal();
    });

    // Form submit (add/edit task)
    taskForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const subject = formSubjectDropdown.value;
        const taskName = document.getElementById("taskNameInput").value;
        const dueDate = document.getElementById("taskDueDateInput").value;
        const description = document.getElementById("taskDescriptionInput").value;

        // EDIT TASK
        if (taskBeingEdited) {
            const oldSubject = taskBeingEdited.dataset.subject;
            const oldName = taskBeingEdited.dataset.taskName;

            taskBeingEdited.dataset.subject = subject;
            taskBeingEdited.dataset.taskName = taskName;
            taskBeingEdited.dataset.dueDate = dueDate;
            taskBeingEdited.dataset.description = description;

            taskBeingEdited.innerHTML = `
                <h4>${taskName}</h4>
                <div class="task-meta">
                    <span><strong>Subject:</strong> ${subject}</span>
                    <span><strong>Due:</strong> ${dueDate || 'N/A'}</span>
                </div>
                <p>${description || 'No description provided.'}</p>
            `;

            taskBeingEdited.classList.remove("selected");

            // Update saved task
            const index = savedTasks.findIndex(t =>
                t.subject === oldSubject && t.taskName === oldName
            );

            if (index !== -1) {
                savedTasks[index] = { subject, taskName, dueDate, description };
                saveAll();
            }

        } else {
            // ADD NEW TASK
            if (noTasksMessage) noTasksMessage.style.display = "none";

            const taskCard = document.createElement("div");
            taskCard.className = "task-card";

            taskCard.dataset.subject = subject;
            taskCard.dataset.taskName = taskName;
            taskCard.dataset.dueDate = dueDate;
            taskCard.dataset.description = description;

            taskCard.innerHTML = `
                <h4>${taskName}</h4>
                <div class="task-meta">
                    <span><strong>Subject:</strong> ${subject}</span>
                    <span><strong>Due:</strong> ${dueDate || 'N/A'}</span>
                </div>
                <p>${description || 'No description provided.'}</p>
            `;

            taskCard.addEventListener('click', () => {
                const currentSelected = document.querySelector('.task-card.selected');
                if (currentSelected && currentSelected !== taskCard) {
                    currentSelected.classList.remove('selected');
                }
                taskCard.classList.toggle('selected');
            });

            taskListContainer.appendChild(taskCard);

            savedTasks.push({ subject, taskName, dueDate, description });
            saveAll();
        }

        closeModal();
    });

    // Delete task
    deleteTaskBtn.addEventListener('click', () => {
        const selectedCard = document.querySelector('.task-card.selected');

        if (selectedCard) {
            // Remove from UI
            selectedCard.remove();

            // Remove from localStorage
            savedTasks = savedTasks.filter(t =>
                !(t.subject === selectedCard.dataset.subject &&
                  t.taskName === selectedCard.dataset.taskName)
            );
            saveAll();

            if (taskListContainer.children.length === 0) {
                noTasksMessage.style.display = "block";
            }
        } else {
            alert("Please click on a task to select it first.");
        }
    });

    // Delete subject
    deleteSubjectBtn.addEventListener('click', () => {
        const selectedValue = mainSubjectDropdown.value;

        if (!selectedValue) {
            alert("Please select a subject to delete.");
            return;
        }

        if (confirm(`Delete subject "${selectedValue}"?`)) {
            const opt1 = mainSubjectDropdown.querySelector(`option[value="${selectedValue}"]`);
            if (opt1) opt1.remove();

            const opt2 = formSubjectDropdown.querySelector(`option[value="${selectedValue}"]`);
            if (opt2) opt2.remove();

            savedSubjects = savedSubjects.filter(s => s !== selectedValue);
            savedTasks = savedTasks.filter(t => t.subject !== selectedValue);
            saveAll();
        }
    });

    // Filter tasks by subject
    mainSubjectDropdown.addEventListener('change', () => {
        const selectedSubject = mainSubjectDropdown.value;
        const allTasks = document.querySelectorAll('.task-card');
        let tasksFound = 0;

        allTasks.forEach(task => {
            if (selectedSubject === "" || task.dataset.subject === selectedSubject) {
                task.style.display = "block";
                tasksFound++;
            } else {
                task.style.display = "none";
            }
        });

        if (tasksFound > 0) {
            noTasksMessage.style.display = "none";
        } else {
            noTasksMessage.style.display = "block";
            noTasksMessage.textContent = selectedSubject === ""
                ? "No Tasks!"
                : `No tasks for "${selectedSubject}"`;
        }
    });

});

// Function to add a new subject
function addSubject() {
    let subject = prompt("Please enter the subject name (max 25 characters):");
    if (!subject) return;

function addSubject() {
    let subject = prompt("Please enter the subject name (max 25 characters):");
    if (!subject) return;
    subject = subject.trim();
    if (subject.length === 0) {
        alert("Subject cannot be empty.");
        return;
    }
    if (subject.length > 25) {
        alert("Subject must be 25 characters or fewer.");
        return;
    }

    const mainDropdown = document.getElementById("subjectDropdown");
    const formDropdown = document.getElementById("taskSubjectDropdown");

    const mainOption = document.createElement("option");
    mainOption.text = subject;
    mainOption.value = subject;
    mainDropdown.add(mainOption);

    const formOption = document.createElement("option");
    formOption.text = subject;
    formOption.value = subject;
    formDropdown.add(formOption);

    // Save subject
    savedSubjects.push(subject);
    saveAll();
    }
    if (subject.length > 25) {
        alert("Subject must be 25 characters or fewer.");
        return;
    }
    if (subject) {
        const mainDropdown = document.getElementById("subjectDropdown");
        const formDropdown = document.getElementById("taskSubjectDropdown");
        const mainOption = document.createElement("option");
        mainOption.text = subject;
        mainOption.value = subject;
        mainDropdown.add(mainOption);
        const formOption = document.createElement("option");
        formOption.text = subject;
        formOption.value = subject;
        formDropdown.add(formOption);
    }
}

}
