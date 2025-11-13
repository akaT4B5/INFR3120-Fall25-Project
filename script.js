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
    const editTaskBtn = document.getElementById("editTaskBtn"); // --- NEW --- Get the edit button

    // --- NEW: State variable to track if we are editing ---
    let taskBeingEdited = null;

    // --- Modal Functions ---

    // Function to open the modal
    function openModal() {
        taskModal.style.display = "block";
    }

    // --- UPDATED: Function to close and reset the modal ---
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

    // --- NEW: Event Listener for Edit Button ---
    editTaskBtn.addEventListener('click', () => {
        const selectedCard = document.querySelector('.task-card.selected');
        
        if (!selectedCard) {
            alert("Please select a task to edit first.");
            return;
        }

        // Store the card we are editing
        taskBeingEdited = selectedCard;

        // Populate the form with data from the card's "dataset"
        // (We will add this dataset in the submit function)
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


    // --- UPDATED: Task Form Submission (Handles BOTH Create and Update) ---
    taskForm.addEventListener('submit', (event) => {
        event.preventDefault();

        // 1. Get values from the form
        const subject = formSubjectDropdown.value;
        const taskName = document.getElementById("taskNameInput").value;
        const dueDate = document.getElementById("taskDueDateInput").value;
        const description = document.getElementById("taskDescriptionInput").value;

        // --- NEW: Logic to check if we are Editing or Creating ---
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
            // --- CREATE new task (Original code) ---
            // 2. Hide the "no tasks" message
            if (noTasksMessage) {
                noTasksMessage.style.display = "none";
            }

            // 3. Create the new task card element
            const taskCard = document.createElement("div");
            taskCard.className = "task-card"; // Apply CSS class

            // --- NEW: Store the data in the dataset for editing ---
            taskCard.dataset.subject = subject;
            taskCard.dataset.taskName = taskName;
            taskCard.dataset.dueDate = dueDate;
            taskCard.dataset.description = description;

            // 4. Populate the card with HTML
            taskCard.innerHTML = `
                <h4>${taskName}</h4>
                <div class="task-meta">
                    <span><strong>Subject:</strong> ${subject}</span>
                    <span><strong>Due:</strong> ${dueDate || 'N/A'}</span>
                </div>
                <p>${description || 'No description provided.'}</p>
            `;

            // 5. Add click listener for selection
            taskCard.addEventListener('click', () => {
                const currentSelected = document.querySelector('.task-card.selected');
                if (currentSelected && currentSelected !== taskCard) {
                    currentSelected.classList.remove('selected');
                }
                taskCard.classList.toggle('selected');
            });
            
            // 6. Add the new task card to the task list
            taskListContainer.appendChild(taskCard);
        }
        
        // 7. Reset the form and close the modal
        // (This is now handled by closeModal)
        closeModal();
    });

    // --- Event Listener for Delete Button ---
    // (No changes needed here)
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

});

// --- Add Subject Function (Global) ---
// (No changes needed here)
function addSubject() {
    const subject = prompt("Please enter the subject name:");
    if (subject && subject.trim() !== "") {
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