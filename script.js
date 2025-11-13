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
    const deleteTaskBtn = document.getElementById("deleteTaskBtn"); // --- NEW --- Get the delete button

    // --- Modal Functions ---
    // (No changes needed here)
    function openModal() {
        taskModal.style.display = "block";
    }

    function closeModal() {
        taskModal.style.display = "none";
    }

    // --- Event Listeners for Modal ---
    // (No changes needed here)
    openTaskModalBtn.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (event) => {
        if (event.target == taskModal) {
            closeModal();
        }
    });

    // --- Task Form Submission ---
    taskForm.addEventListener('submit', (event) => {
        event.preventDefault();

        // 1. Get values from the form
        const subject = formSubjectDropdown.value;
        const taskName = document.getElementById("taskNameInput").value;
        const dueDate = document.getElementById("taskDueDateInput").value;
        const description = document.getElementById("taskDescriptionInput").value;

        // 2. Hide the "no tasks" message
        if (noTasksMessage) {
            noTasksMessage.style.display = "none";
        }

        // 3. Create the new task card element
        const taskCard = document.createElement("div");
        taskCard.className = "task-card"; // Apply CSS class

        // 4. Populate the card with HTML
        taskCard.innerHTML = `
            <h4>${taskName}</h4>
            <div class="task-meta">
                <span><strong>Subject:</strong> ${subject}</span>
                <span><strong>Due:</strong> ${dueDate || 'N/A'}</span>
            </div>
            <p>${description || 'No description provided.'}</p>
        `;

        // --- NEW: Add click listener for selection ---
        taskCard.addEventListener('click', () => {
            // First, check if another card is already selected and remove it
            const currentSelected = document.querySelector('.task-card.selected');
            if (currentSelected && currentSelected !== taskCard) {
                currentSelected.classList.remove('selected');
            }
            // Toggle the 'selected' class on the clicked card
            taskCard.classList.toggle('selected');
        });
        // ---------------------------------------------

        // 5. Add the new task card to the task list
        taskListContainer.appendChild(taskCard);

        // 6. Reset the form and close the modal
        taskForm.reset();
        closeModal();
    });

    // --- NEW: Event Listener for Delete Button ---
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
    // -------------------------------------------

});

// --- Add Subject Function (Global) ---
// (No changes needed here)
function addSubject() {
    // ... same as before
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