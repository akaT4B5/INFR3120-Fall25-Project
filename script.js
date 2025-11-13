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

    // --- Modal Functions ---

    // Function to open the modal
    function openModal() {
        taskModal.style.display = "block";
    }

    // Function to close the modal
    function closeModal() {
        taskModal.style.display = "none";
    }

    // --- Event Listeners for Modal ---

    // When the user clicks "Add task", open the modal
    openTaskModalBtn.addEventListener('click', openModal);

    // When the user clicks on <span> (x), close the modal
    closeBtn.addEventListener('click', closeModal);

    // When the user clicks anywhere outside of the modal, close it
    window.addEventListener('click', (event) => {
        if (event.target == taskModal) {
            closeModal();
        }
    });

    // --- Task Form Submission ---

    taskForm.addEventListener('submit', (event) => {
        // Prevent the form from submitting the traditional way
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

        // 5. Add the new task card to the task list
        taskListContainer.appendChild(taskCard);

        // 6. Reset the form and close the modal
        taskForm.reset(); // Clears all form fields
        closeModal();
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

        // --- This is the new part ---
        // ALSO create a new option for the form's dropdown
        const formOption = document.createElement("option");
        formOption.text = subject;
        formOption.value = subject;
        formDropdown.add(formOption);
        // -----------------------------
    }
}