// Global function for the "Add Subject" button (must be outside DOMContentLoaded because it's called via onclick in HTML)
function addSubject() {
    const subject = prompt("Please enter the subject name:");
    if (subject && subject.trim() !== "") {
        const mainDropdown = document.getElementById("subjectDropdown");
        const formDropdown = document.getElementById("taskSubjectDropdown");
        
        // Add to main sidebar dropdown
        const mainOption = document.createElement("option");
        mainOption.text = subject;
        mainOption.value = subject;
        mainDropdown.add(mainOption);
        
        // Add to task creation dropdown
        const formOption = document.createElement("option");
        formOption.text = subject;
        formOption.value = subject;
        formDropdown.add(formOption);
    }
}

// Wait for the DOM to be fully loaded before running the main script
document.addEventListener("DOMContentLoaded", () => {

    // -------------------------------------------------------------------------
    // PART 1: AUTHENTICATION & SECURITY
    // -------------------------------------------------------------------------
    
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

    // References to Auth UI elements
    const loggedOutLinks = document.getElementById('loggedOutLinks');
    const loggedInLinks = document.getElementById('loggedInLinks');
    const userGreeting = document.getElementById('userGreeting');
    const logoutBtn = document.getElementById('logoutBtn');
    const mainContent = document.querySelector('main'); 

    // CHECK: Is the user logged in?
    if (token && user) {
        // User IS logged in: Show the app
        if(loggedOutLinks) loggedOutLinks.style.display = 'none';
        if(loggedInLinks) loggedInLinks.style.display = 'flex';
        if(userGreeting) userGreeting.textContent = `Hi, ${user.fullName.split(' ')[0]}!`;
        
        // Ensure main content is visible
        if(mainContent) mainContent.style.display = 'flex'; 
    } else {
        // User is NOT logged in: Block access
        if(loggedOutLinks) loggedOutLinks.style.display = 'block';
        if(loggedInLinks) loggedInLinks.style.display = 'none';
        if(mainContent) mainContent.style.display = 'none'; 
        
        alert("You must be logged in to view your tasks.");
        window.location.href = "login.html"; // Redirect to login
        return; // Stop the script here so no task code runs
    }

    // LOGOUT LOGIC
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'login.html';
        });
    }

    // -------------------------------------------------------------------------
    // PART 2: TASK MANAGEMENT (Frontend Only for now)
    // -------------------------------------------------------------------------

    // Get references to DOM elements
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

    function closeModal() {
        taskModal.style.display = "none";
        taskForm.reset();
        taskBeingEdited = null;
        const modalTitle = document.querySelector('#taskModal h3');
        const submitBtn = document.querySelector('#taskForm button[type="submit"]');
        if(modalTitle) modalTitle.textContent = "Add a New Task";
        if(submitBtn) submitBtn.textContent = "Submit Task";
    }

    // Event listeners for modal
    if(openTaskModalBtn) openTaskModalBtn.addEventListener('click', openModal);
    if(closeBtn) closeBtn.addEventListener('click', closeModal);

    window.addEventListener('click', (event) => {
        if (event.target == taskModal) {
            closeModal();
        }
    });

    // Edit Task Button
    if(editTaskBtn) {
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
    }

    // Handle form submission (Add or Update Task)
    if(taskForm) {
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
                taskBeingEdited = null; // Reset
            } else {
                // Creating a new task
                if (noTasksMessage) {
                    noTasksMessage.style.display = "none";
                }
                
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
    }

    // Delete task button functionality
    if(deleteTaskBtn) {
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
    }

    // Delete Subject functionality
    if(deleteSubjectBtn) {
        deleteSubjectBtn.addEventListener('click', () => {
            const selectedValue = mainSubjectDropdown.value;
            
            if (!selectedValue || selectedValue === "") {
                alert("Please select a subject from the dropdown to delete.");
                return;
            }
            
            if (confirm(`Are you sure you want to delete the subject "${selectedValue}"?`)) {
                const mainOptionToRemove = mainSubjectDropdown.querySelector(`option[value="${selectedValue}"]`);
                if (mainOptionToRemove) mainOptionToRemove.remove();
                
                const formOptionToRemove = formSubjectDropdown.querySelector(`option[value="${selectedValue}"]`);
                if (formOptionToRemove) formOptionToRemove.remove();
            }
        });
    }

    // Filter tasks based on selected subject
    if(mainSubjectDropdown) {
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
                if (selectedSubject === "") {
                    noTasksMessage.textContent = "No Tasks!";
                } else {
                    noTasksMessage.textContent = `No tasks for "${selectedSubject}"`;
                }
            }
        });
    }
});