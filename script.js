// Wait for the DOM to be fully loaded before running script
document.addEventListener("DOMContentLoaded", () => {


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

// Variable to keep track of the task being edited
    let taskBeingEdited = null;

// Functions to open and close the modal
    function openModal() {
        taskModal.style.display = "block";
    }
// Close modal and reset form
    function closeModal() {
        taskModal.style.display = "none";
        taskForm.reset(); 
        taskBeingEdited = null;
        document.querySelector('#taskModal h3').textContent = "Add a New Task";
        document.querySelector('#taskForm button[type="submit"]').textContent = "Submit Task";
    }

// Event listeners for various buttons and actions
    openTaskModalBtn.addEventListener('click', openModal);

    closeBtn.addEventListener('click', closeModal);

    window.addEventListener('click', (event) => {
        if (event.target == taskModal) {
            closeModal();
        }
    });

    editTaskBtn.addEventListener('click', () => {
        const selectedCard = document.querySelector('.task-card.selected');
       
        if (!selectedCard) {
            alert("Please select a task to edit first.");
            return;
        }
// Set the taskBeingEdited to the selected card
        taskBeingEdited = selectedCard;

// Pre-fill the form with the selected task's data
        document.getElementById("taskSubjectDropdown").value = selectedCard.dataset.subject;
        document.getElementById("taskNameInput").value = selectedCard.dataset.taskName;
        document.getElementById("taskDueDateInput").value = selectedCard.dataset.dueDate;
        document.getElementById("taskDescriptionInput").value = selectedCard.dataset.description;
        document.querySelector('#taskModal h3').textContent = "Edit Task";
        document.querySelector('#taskForm button[type="submit"]').textContent = "Update Task";

// Open the modal for editing
        openModal();
    });

    // Handle form submission for adding/editing tasks
    taskForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const subject = formSubjectDropdown.value;
        const taskName = document.getElementById("taskNameInput").value;
        const dueDate = document.getElementById("taskDueDateInput").value;
        const description = document.getElementById("taskDescriptionInput").value;

    
// If editing an existing task, update its details
        if (taskBeingEdited) {
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
            taskBeingEdited.classList.remove('selected');

// Reset taskBeingEdited after updating
        } else {
            if (noTasksMessage) {
                noTasksMessage.style.display = "none";
            }
            // Create a new task card
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
// Add click event to select the task card
            taskCard.addEventListener('click', () => {
                const currentSelected = document.querySelector('.task-card.selected');
                if (currentSelected && currentSelected !== taskCard) {
                    currentSelected.classList.remove('selected');
                }
                taskCard.classList.toggle('selected');
            });

            taskListContainer.appendChild(taskCard);
        }
        closeModal();
    });

// Delete task button functionality
    deleteTaskBtn.addEventListener('click', () => {

        const selectedCard = document.querySelector('.task-card.selected');
        if (selectedCard) {
            selectedCard.remove();

            if (taskListContainer.children.length === 0) {
                noTasksMessage.style.display = "block";
            }
        } else {
            alert("Please click on a task to select it first.");
        }
    });
    deleteSubjectBtn.addEventListener('click', () => {
        const selectedValue = mainSubjectDropdown.value;
        // Validate selection
        if (!selectedValue || selectedValue === "") {
            alert("Please select a subject from the dropdown to delete.");
            return;
        }
        // Confirm deletion with the user before proceeding
        if (confirm(`Are you sure you want to delete the subject "${selectedValue}"?`)) {
            const mainOptionToRemove = mainSubjectDropdown.querySelector(`option[value="${selectedValue}"]`);
            if (mainOptionToRemove) {
                mainOptionToRemove.remove();
            }
            const formOptionToRemove = formSubjectDropdown.querySelector(`option[value="${selectedValue}"]`);
            if (formOptionToRemove) {
                formOptionToRemove.remove();
            }
        }
    });
// Filter tasks based on selected subject from dropdown
    mainSubjectDropdown.addEventListener('change', () => {
        const selectedSubject = mainSubjectDropdown.value;
        const allTasks = document.querySelectorAll('.task-card');
        let tasksFound = 0;

// Show/hide tasks based on the selected subject
        allTasks.forEach(task => {
            if (selectedSubject === "" || task.dataset.subject === selectedSubject) {
                task.style.display = "block"; 
                tasksFound++;
            } else {
                task.style.display = "none"; 
            }
        });
// Update no tasks message based on filtering result
        if (tasksFound > 0) {
            noTasksMessage.style.display = "none";
        } else {
            noTasksMessage.style.display = "block";
            if (selectedSubject === "") {
                noTasksMessage.textContent = "No Tasks!";
            } else {
                noTasksMessage.textContent = `No tasks for "${selectedSubject}"`;
            }
        }
    });


});
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
