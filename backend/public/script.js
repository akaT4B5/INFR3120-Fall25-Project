// ==========================================
// GLOBAL CONFIGURATION & HELPER FUNCTIONS
// ==========================================

const API_URL = '/api/tasks';

// Function to add a new subject (Called by the HTML button)
function addSubject() {
    const subject = prompt("Please enter the subject name:");
    if (subject && subject.trim() !== "") {
        addSubjectToDropdowns(subject);
    }
}

// Helper to add subject to both dropdowns if it doesn't exist
function addSubjectToDropdowns(subject) {
    const mainDropdown = document.getElementById("subjectDropdown");
    const formDropdown = document.getElementById("taskSubjectDropdown");

    // Check if subject already exists to avoid duplicates
    let exists = false;
    for (let i = 0; i < mainDropdown.options.length; i++) {
        if (mainDropdown.options[i].value === subject) exists = true;
    }

    if (!exists) {
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

// ==========================================
// MAIN APPLICATION LOGIC
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    // --- 1. AUTHENTICATION CHECK ---
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

    const loggedOutLinks = document.getElementById('loggedOutLinks');
    const loggedInLinks = document.getElementById('loggedInLinks');
    const userGreeting = document.getElementById('userGreeting');
    const logoutBtn = document.getElementById('logoutBtn');
    const mainContent = document.querySelector('main');

    // If no token, redirect to login immediately
    if (!token || !user) {
        if(mainContent) mainContent.style.display = 'none';
        window.location.href = "login.html";
        return;
    }

    // Update UI for logged-in user
    if (loggedOutLinks) loggedOutLinks.style.display = 'none';
    if (loggedInLinks) loggedInLinks.style.display = 'flex';
    if (userGreeting) userGreeting.textContent = `Hi, ${user.fullName.split(' ')[0]}!`;
    if (mainContent) mainContent.style.display = 'flex';

    // Logout Logic
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'login.html';
        });
    }

    // --- 2. DOM ELEMENTS ---
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

    // State to track editing
    let currentTaskId = null; // We now use the MongoDB _id

    // --- 3. API FUNCTIONS (The Bridge to Backend) ---

    // Fetch all tasks from MongoDB
    async function fetchTasks() {
        try {
            const res = await fetch(API_URL, {
                headers: { 'x-auth-token': token }
            });
            const tasks = await res.json();
            
            // Clear current list
            taskListContainer.innerHTML = '';
            
            if (tasks.length > 0) {
                noTasksMessage.style.display = 'none';
                tasks.forEach(task => {
                    renderTaskCard(task);
                    // Ensure subject exists in dropdowns so we can filter by it
                    addSubjectToDropdowns(task.subject);
                });
            } else {
                noTasksMessage.style.display = 'block';
            }
        } catch (err) {
            console.error("Error fetching tasks:", err);
            alert("Could not load tasks.");
        }
    }

    // Render a single task card to the DOM
    function renderTaskCard(task) {
        const taskCard = document.createElement("div");
        taskCard.className = "task-card";
        
        // Store data in dataset for easy access
        taskCard.dataset.id = task._id; // MongoDB ID
        taskCard.dataset.subject = task.subject;
        taskCard.dataset.taskName = task.taskName;
        taskCard.dataset.dueDate = task.dueDate ? task.dueDate.split('T')[0] : ''; // Format date
        taskCard.dataset.description = task.description;

        taskCard.innerHTML = `
            <h4>${task.taskName}</h4>
            <div class="task-meta">
                <span><strong>Subject:</strong> ${task.subject}</span>
                <span><strong>Due:</strong> ${taskCard.dataset.dueDate || 'N/A'}</span>
            </div>
            <p>${task.description || 'No description provided.'}</p>
        `;

        // Selection Logic
        taskCard.addEventListener('click', () => {
            const currentSelected = document.querySelector('.task-card.selected');
            if (currentSelected && currentSelected !== taskCard) {
                currentSelected.classList.remove('selected');
            }
            taskCard.classList.toggle('selected');
        });

        taskListContainer.appendChild(taskCard);
    }

    // --- 4. UI INTERACTION LOGIC ---

    // Initial Load
    fetchTasks();

    // Modal Logic
    function openModal() {
        taskModal.style.display = "block";
    }

    function closeModal() {
        taskModal.style.display = "none";
        taskForm.reset();
        currentTaskId = null;
        document.querySelector('#taskModal h3').textContent = "Add a New Task";
        document.querySelector('#taskForm button[type="submit"]').textContent = "Submit Task";
    }

    if(openTaskModalBtn) openTaskModalBtn.addEventListener('click', openModal);
    if(closeBtn) closeBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => { if (e.target == taskModal) closeModal(); });

    // Edit Button Logic
    if(editTaskBtn) {
        editTaskBtn.addEventListener('click', () => {
            const selectedCard = document.querySelector('.task-card.selected');
            if (!selectedCard) {
                alert("Please select a task to edit first.");
                return;
            }

            // Populate form with existing data
            currentTaskId = selectedCard.dataset.id;
            document.getElementById("taskSubjectDropdown").value = selectedCard.dataset.subject;
            document.getElementById("taskNameInput").value = selectedCard.dataset.taskName;
            document.getElementById("taskDueDateInput").value = selectedCard.dataset.dueDate;
            document.getElementById("taskDescriptionInput").value = selectedCard.dataset.description;

            // Update Modal UI
            document.querySelector('#taskModal h3').textContent = "Edit Task";
            document.querySelector('#taskForm button[type="submit"]').textContent = "Update Task";
            
            openModal();
        });
    }

    // Form Submit (Create OR Update)
    if(taskForm) {
        taskForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const taskData = {
                subject: formSubjectDropdown.value,
                taskName: document.getElementById("taskNameInput").value,
                dueDate: document.getElementById("taskDueDateInput").value,
                description: document.getElementById("taskDescriptionInput").value
            };

            try {
                let response;
                
                if (currentTaskId) {
                    // UPDATE existing task (PUT)
                    response = await fetch(`${API_URL}/${currentTaskId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-auth-token': token
                        },
                        body: JSON.stringify(taskData)
                    });
                } else {
                    // CREATE new task (POST)
                    response = await fetch(API_URL, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-auth-token': token
                        },
                        body: JSON.stringify(taskData)
                    });
                }

                if (response.ok) {
                    closeModal();
                    fetchTasks(); // Refresh list from DB
                } else {
                    const errData = await response.json();
                    alert(`Error: ${errData.message}`);
                }

            } catch (err) {
                console.error("Error saving task:", err);
            }
        });
    }

    // Delete Task Logic
    if(deleteTaskBtn) {
        deleteTaskBtn.addEventListener('click', async () => {
            const selectedCard = document.querySelector('.task-card.selected');
            if (!selectedCard) {
                alert("Please click on a task to select it first.");
                return;
            }

            const taskId = selectedCard.dataset.id;

            if(confirm("Are you sure you want to delete this task?")) {
                try {
                    const res = await fetch(`${API_URL}/${taskId}`, {
                        method: 'DELETE',
                        headers: { 'x-auth-token': token }
                    });

                    if (res.ok) {
                        selectedCard.remove();
                        if (taskListContainer.children.length === 0) {
                            noTasksMessage.style.display = "block";
                        }
                    } else {
                        alert("Failed to delete task.");
                    }
                } catch (err) {
                    console.error("Error deleting task:", err);
                }
            }
        });
    }

    // Delete Subject Logic (Frontend only for now as Subjects aren't a separate DB model)
    if(deleteSubjectBtn) {
        deleteSubjectBtn.addEventListener('click', () => {
            const selectedValue = mainSubjectDropdown.value;
            if (!selectedValue) return alert("Select a subject to delete.");

            if (confirm(`Delete subject "${selectedValue}"?`)) {
                const mainOp = mainSubjectDropdown.querySelector(`option[value="${selectedValue}"]`);
                if(mainOp) mainOp.remove();
                
                const formOp = formSubjectDropdown.querySelector(`option[value="${selectedValue}"]`);
                if(formOp) formOp.remove();
                
                // Re-trigger filter to hide tasks if needed
                mainSubjectDropdown.dispatchEvent(new Event('change'));
            }
        });
    }

    // Filtering Logic
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
                noTasksMessage.textContent = selectedSubject === "" ? "No Tasks!" : `No tasks for "${selectedSubject}"`;
            }
        });
    }
});