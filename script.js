// Wait for the DOM to be fully loaded before running script
document.addEventListener("DOMContentLoaded", () => {

    // Load saved data from localStorage
    savedSubjects = JSON.parse(localStorage.getItem("subjects") || "[]");
    savedTasks = JSON.parse(localStorage.getItem("tasks") || "[]");

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

    // Load saved subjects into dropdowns
    savedSubjects.forEach(sub => {
        const opt1 = document.createElement("option");
        opt1.value = opt1.textContent = sub;
        mainSubjectDropdown.add(opt1);

        const opt2 = document.createElement("option");
        opt2.value = opt2.textContent = sub;
        formSubjectDropdown.add(opt2);
    });

    // Helper to create task cards
    function createTaskCard(t) {
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

        return taskCard;
    }

    // Load saved tasks
    savedTasks.forEach(t => {
        taskListContainer.appendChild(createTaskCard(t));
    });

    // Track which task is being edited
    let taskBeingEdited = null;

    // Open/Close modal
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

        formSubjectDropdown.value = selectedCard.dataset.subject;
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

            // Update card visuals
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

            // Update localStorage
            const index = savedTasks.findIndex(t =>
                t.subject === oldSubject && t.taskName === oldName
            );

            if (index !== -1) {
                savedTasks[index] = { subject, taskName, dueDate, description };
                saveAll();
            }

        } else {
            // ADD NEW TASK
            noTasksMessage.style.display = "none";

            const newTask = { subject, taskName, dueDate, description };
            savedTasks.push(newTask);
            saveAll();

            taskListContainer.appendChild(createTaskCard(newTask));
        }

        closeModal();
    });

    // Delete task
    deleteTaskBtn.addEventListener('click', () => {
        const selectedCard = document.querySelector('.task-card.selected');

        if (selectedCard) {
            selectedCard.remove();

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
            // Remove from dropdowns
            mainSubjectDropdown.querySelector(`option[value="${selectedValue}"]`)?.remove();
            formSubjectDropdown.querySelector(`option[value="${selectedValue}"]`)?.remove();

            // Remove from memory
            savedSubjects = savedSubjects.filter(s => s !== selectedValue);
            savedTasks = savedTasks.filter(t => t.subject !== selectedValue);

            // Refresh task list visually
            document.querySelectorAll('.task-card').forEach(card => {
                if (card.dataset.subject === selectedValue) {
                    card.remove();
                }
            });

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

        noTasksMessage.style.display = tasksFound > 0 ? "none" : "block";
        noTasksMessage.textContent = selectedSubject === ""
            ? "No Tasks!"
            : `No tasks for "${selectedSubject}"`;
    });

});

// GLOBAL addSubject() function — now safe
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

    savedSubjects.push(subject);
    localStorage.setItem("subjects", JSON.stringify(savedSubjects));
}
