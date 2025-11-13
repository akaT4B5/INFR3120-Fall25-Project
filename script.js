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

    // --- State variable to track if we are editing ---
    let taskBeingEdited = null;

    // --- Modal Functions ---

    // Function to open the modal
    function openModal() {
        taskModal.style.display = "block";
    }

    // Function to close and reset the modal
    function closeModal() {
        taskModal.style.display = "none";
        taskForm.reset(); // Clear all form fields
        
        // Reset modal to "Add Task" mode
        taskBeingEdited = null;
        document.querySelector('#taskModal h3').textContent = "Add a New Task";
        document.querySelector('#taskForm button[type="submit"]').textContent = "Submit Task";
    }

    // --- Event Listeners for Modal ---

    // When the user clicks "Add task", open the modal (in "add" mode)
    openTaskModalBtn.addEventListener('click', openModal);

    // When the user clicks on <span> (x), close the modal
    closeBtn.addEventListener('click', closeModal);

    // When the user clicks anywhere outside of the modal, close it
    window.addEventListener('click', (event) => {
        if (event.target == taskModal) {
            closeModal();
        }
    });

    // --- Event Listener for Edit Button ---
    editTaskBtn.addEventListener('click', () => {
        const selectedCard = document.querySelector('.task-card.selected');
        
        if (!selectedCard) {
            alert("Please select a task to edit first.");
            return;
        }

        // Store the card we are editing
        taskBeingEdited = selectedCard;

        // Populate the form with data from the card's "dataset"
        document.getElementById("taskSubjectDropdown").value = selectedCard.dataset.subject;
        document.getElementById("taskNameInput").value = selectedCard.dataset.taskName;
        document.getElementById("taskDueDateInput").value = selectedCard.dataset.dueDate;
        document.getElementById("taskDescriptionInput").value = selectedCard.dataset.description;

        // Change modal title and button text
        document.querySelector('#taskModal h3').textContent = "Edit Task";
        document.querySelector('#taskForm button[type="submit"]').textContent = "Update Task";
        
        // Open the modal
        openModal();
    });


    // --- Task Form Submission (Handles BOTH Create and Update) ---
    taskForm.addEventListener('submit', (event) => {
        event.preventDefault();

        // 1. Get values from the form
        const subject = formSubjectDropdown.value;
        const taskName = document.getElementById("taskNameInput").value;
        const dueDate = document.getElementById("taskDueDateInput").value;
        const description = document.getElementById("taskDescriptionInput").value;

        // Check if we are Editing or Creating
        if (taskBeingEdited) {
            // --- UPDATE existing task ---
            // 1. Update the card's dataset
            taskBeingEdited.dataset.subject = subject;
            taskBeingEdited.dataset.taskName = taskName;
            taskBeingEdited.dataset.dueDate = dueDate;
            taskBeingEdited.dataset.description = description;

            // 2. Update the card's inner HTML
            taskBeingEdited.innerHTML = `
                <h4>${taskName}</h4>
                <div class="task-meta">
                    <span><strong>Subject:</strong> ${subject}</span>
                    <span><strong>Due:</strong> ${dueDate || 'N/A'}</span>
                </div>
                <p>${description || 'No description provided.'}</p>
            `;

            // 3. Deselect the card after editing
            taskBeingEdited.classList.remove('selected');

        } else {
            // --- CREATE new task ---
            // 2. Hide the "no tasks" message
            if (noTasksMessage) {
                noTasksMessage.style.display = "none";
            }

            // 3. Create the new task card element
            const taskCard = document.createElement("div");
            taskCard.className = "task-card"; // Apply CSS class

            // 4. Store the data in the dataset for editing
            taskCard.dataset.subject = subject;
            taskCard.dataset.taskName = taskName;
            taskCard.dataset.dueDate = dueDate;
            taskCard.dataset.description = description;

            // 5. Populate the card with HTML
            taskCard.innerHTML = `
                <h4>${taskName}</h4>
                <div class="task-meta">
                    <span><strong>Subject:</strong> ${subject}</span>
                    <span><strong>Due:</strong> ${dueDate || 'N/A'}</span>
                </div>
                <p>${description || 'No description provided.'}</p>
            `;

            // 6. Add click listener for selection
            taskCard.addEventListener('click', () => {
                const currentSelected = document.querySelector('.task-card.selected');
                if (currentSelected && currentSelected !== taskCard) {
                    currentSelected.classList.remove('selected');
                }
                taskCard.classList.toggle('selected');
            });
            
            // 7. Add the new task card to the task list
            taskListContainer.appendChild(taskCard);
        }
        
        // 8. Close the modal (which also resets it)
        closeModal();
    });

    // --- Event Listener for Delete Task Button ---
    deleteTaskBtn.addEventListener('click', () => {
        // 1. Find the card that is currently selected
        const selectedCard = document.querySelector('.task-card.selected');

        // 2. If a selected card is found, remove it
        if (selectedCard) {
            selectedCard.remove();

            // 3. Check if the task list is now empty
            if (taskListContainer.children.length === 0) {
                noTasksMessage.style.display = "block";
            }
        } else {
            // 4. If no card is selected, alert the user
            alert("Please click on a task to select it first.");
        }
    });
    
    // --- Event Listener for Delete Subject Button ---
    deleteSubjectBtn.addEventListener('click', () => {
        const selectedValue = mainSubjectDropdown.value;

        // 1. Check if a valid subject is selected
        if (!selectedValue || selectedValue === "") {
            alert("Please select a subject from the dropdown to delete.");
            return;
        }

        // 2. Confirm the destructive action
        if (confirm(`Are you sure you want to delete the subject "${selectedValue}"?`)) {
            
            // 3. Remove from the main dropdown
            const mainOptionToRemove = mainSubjectDropdown.querySelector(`option[value="${selectedValue}"]`);
            if (mainOptionToRemove) {
                mainOptionToRemove.remove();
            }

            // 4. Remove from the form's dropdown
            const formOptionToRemove = formSubjectDropdown.querySelector(`option[value="${selectedValue}"]`);
            if (formOptionToRemove) {
                formOptionToRemove.remove();
            }
        }
    });

    // --- Event Listener for Filtering Tasks by Subject ---
    mainSubjectDropdown.addEventListener('change', () => {
        const selectedSubject = mainSubjectDropdown.value;
        const allTasks = document.querySelectorAll('.task-card');
        let tasksFound = 0;

        // Loop through every task card
        allTasks.forEach(task => {
            // Check if the user selected "Select a subject..." (value="")
            // OR if the task's subject matches the selected one
            if (selectedSubject === "" || task.dataset.subject === selectedSubject) {
                task.style.display = "block"; // Show the task
                tasksFound++;
            } else {
                task.style.display = "none"; // Hide the task
            }
        });

        // Show or hide the "No Tasks!" message
        if (tasksFound > 0) {
            noTasksMessage.style.display = "none";
        } else {
            noTasksMessage.style.display = "block";
            // Optional: Change text based on filter
            if (selectedSubject === "") {
                noTasksMessage.textContent = "No Tasks!";
            } else {
                noTasksMessage.textContent = `No tasks for "${selectedSubject}"`;
            }
        }
    });

});

// --- Add Subject Function (Global) ---
// This function is in the global scope because it's called by onclick="" in the HTML

function addSubject() {
    const subject = prompt("Please enter the subject name:");
    if (subject && subject.trim() !== "") { // Check if subject is not null or just whitespace
        
        // Get both dropdowns
        const mainDropdown = document.getElementById("subjectDropdown");
        const formDropdown = document.getElementById("taskSubjectDropdown");

        // Create new option for the main sidebar dropdown
        const mainOption = document.createElement("option");
        mainOption.text = subject;
        mainOption.value = subject; // Set a value
        mainDropdown.add(mainOption);

        // ALSO create a new option for the form's dropdown
        const formOption = document.createElement("option");
        formOption.text = subject;
        formOption.value = subject;
        formDropdown.add(formOption);
    }
}