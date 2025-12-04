//Task Management Application Script
const API_URL = '/api/tasks';

document.addEventListener("DOMContentLoaded", () => {

    // ----------------------------------------------------------------------
    // Fix: Strong redirect to block browser back-button after logout
    // ----------------------------------------------------------------------
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

    // If no token, redirect immediately using replace() so back button can't return
    if (!token || !user) {
        window.location.replace("login.html");
        return;
    }
    // ----------------------------------------------------------------------
    const navPic = document.getElementById("navProfilePic");

if (navPic && user && user.profileImage) {
    if (!user.profileImage.startsWith("http")) {
        navPic.src = `/uploads/${user.profileImage}`;
    } else {
        // If full URL
        navPic.src = user.profileImage;
    }
}

// Handle clicking the profile picture
const profileUploadInput = document.getElementById("profileUploadInput");

if (navPic && profileUploadInput) {
    navPic.addEventListener("click", () => {
        profileUploadInput.click(); // open hidden file input
    });

    profileUploadInput.addEventListener("change", async () => {
        const file = profileUploadInput.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("profileImage", file);

        try {
            const response = await fetch("/api/auth/upload-profile", {
                method: "POST",
                headers: { "x-auth-token": token },
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                // Update UI
                navPic.src = `/uploads/${data.filename}`;

                // Update saved user
                user.profileImage = data.filename;
                localStorage.setItem("user", JSON.stringify(user));

                alert("Profile picture updated!");
            } else {
                alert("Error: " + data.message);
            }

        } catch (err) {
            console.error("Upload error:", err);
            alert("Failed to upload image.");
        }
    });
}

// Authentication Check
    // NOTE: your original check is replaced by the stronger version above
    // but comments are kept here unchanged
    // const token = localStorage.getItem('token');
    // const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

    // UI Elements for Auth State
    const loggedOutLinks = document.getElementById('loggedOutLinks');
    const loggedInLinks = document.getElementById('loggedInLinks');
    const userGreeting = document.getElementById('userGreeting');
    const logoutBtn = document.getElementById('logoutBtn');
    const mainContent = document.querySelector('main');

    // Update UI for logged-in user
    if (loggedOutLinks) loggedOutLinks.style.display = 'none';
    if (loggedInLinks) loggedInLinks.style.display = 'flex';
    if (userGreeting) userGreeting.textContent = `Hi, ${user.fullName.split(' ')[0]}!`;
    if (mainContent) mainContent.style.display = 'flex';

    // Logout Logic
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {

            // Clear auth data
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            // ----------------------------------------------------------------------
            // Fix: Use replace() so user can't press BACK to return to protected page
            // ----------------------------------------------------------------------
            window.location.replace('login.html');
        });
    }

    //DOM Elements for Task Management
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
    let currentTaskId = null;

    //API Interaction Logic

    // Fetch all tasks from MongoDB
    async function fetchTasks() {
        try {
            const res = await fetch(API_URL, {
                headers: { 'x-auth-token': token }
            });
            const tasks = await res.json();

            // Clear current list
            taskListContainer.innerHTML = '';

            // If tasks exist, render them
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
        taskCard.dataset.dueDate = task.dueDate ? task.dueDate.split('T')[0] : '';
        taskCard.dataset.description = task.description;

        // Inner HTML structure
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

    //user Interface Logic

    // Initial Load
    fetchTasks();

    // Modal Logic
    function openModal() {
        taskModal.style.display = "block";
    }

    // Close and reset modal
    function closeModal() {
        taskModal.style.display = "none";
        taskForm.reset();
        currentTaskId = null;
        document.querySelector('#taskModal h3').textContent = "Add a New Task";
        document.querySelector('#taskForm button[type="submit"]').textContent = "Submit Task";
    }

    // Event Listeners
    if (openTaskModalBtn) openTaskModalBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target == taskModal) closeModal();
    });

    // Edit Button Logic
    if (editTaskBtn) {
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
    if (taskForm) {
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

                // Handle response
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
    if (deleteTaskBtn) {
        deleteTaskBtn.addEventListener('click', async () => {
            const selectedCard = document.querySelector('.task-card.selected');
            if (!selectedCard) {
                alert("Please click on a task to select it first.");
                return;
            }

            // Get task ID from dataset
            const taskId = selectedCard.dataset.id;

            // Confirm deletion and send DELETE request
            if (confirm("Are you sure you want to delete this task?")) {
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

    // Delete Subject Logic : Frontend only for now as Subjects aren't a separate DB model - Possible update for Part 3
    if (deleteSubjectBtn) {
        deleteSubjectBtn.addEventListener('click', () => {
            const selectedValue = mainSubjectDropdown.value;
            if (!selectedValue) return alert("Select a subject to delete.");

            // Confirm deletion
            if (confirm(`Delete subject "${selectedValue}"?`)) {
                const mainOp = mainSubjectDropdown.querySelector(`option[value="${selectedValue}"]`);
                if (mainOp) mainOp.remove();

                // Also remove from form dropdown
                const formOp = formSubjectDropdown.querySelector(`option[value="${selectedValue}"]`);
                if (formOp) formOp.remove();

                // Re-trigger filter to hide tasks if needed
                mainSubjectDropdown.dispatchEvent(new Event('change'));
            }
        });
    }

    // Filtering Logic
    if (mainSubjectDropdown) {
        mainSubjectDropdown.addEventListener('change', () => {
            const selectedSubject = mainSubjectDropdown.value;
            const allTasks = document.querySelectorAll('.task-card');
            let tasksFound = 0;

            // Show/hide tasks based on selected subject
            allTasks.forEach(task => {
                if (selectedSubject === "" || task.dataset.subject === selectedSubject) {
                    task.style.display = "block";
                    tasksFound++;
                } else {
                    task.style.display = "none";
                }
            });

            // Show message if no tasks found
            if (tasksFound > 0) {
                noTasksMessage.style.display = "none";
            } else {
                noTasksMessage.style.display = "block";
                noTasksMessage.textContent = selectedSubject === "" ?
                    "No Tasks!" :
                    `No tasks for "${selectedSubject}"`;
            }
        });
    }

});

// ------------------------------------------------------------------
// Helper: Add New Subject
// ------------------------------------------------------------------
function addSubject() {
    const subject = prompt("Please enter the subject name:");
    if (subject && subject.trim() !== "") {
        addSubjectToDropdowns(subject);
    }
}

//Helper to add subject to both dropdowns if it doesn't exist
function addSubjectToDropdowns(subject) {
    const mainDropdown = document.getElementById("subjectDropdown");
    const formDropdown = document.getElementById("taskSubjectDropdown");

    // Check if subject already exists to avoid duplicates
    let exists = false;
    for (let i = 0; i < mainDropdown.options.length; i++) {
        if (mainDropdown.options[i].value === subject) exists = true;
    }

    // If not exists, add to both dropdowns
    if (!exists) {
        const mainOption = document.createElement("option");
        mainOption.text = subject;
        mainOption.value = subject;
        mainDropdown.add(mainOption);

        // Also add to form dropdown
        const formOption = document.createElement("option");
        formOption.text = subject;
        formOption.value = subject;
        formDropdown.add(formOption);
    }
}

// Profile Picture Upload Logi

document.addEventListener("DOMContentLoaded", () => {
    const profileModal = document.getElementById("profileModal");
    const closeProfile = document.querySelector(".close-profile");
    const navPic = document.getElementById("navProfilePic");
    const profileForm = document.getElementById("profileForm");
    const fileInput = document.getElementById("profileImageInput");

    // Open modal when clicking profile picture
    if (navPic) {
        navPic.addEventListener("click", () => {
            profileModal.style.display = "block";
        });
    }

    // Close modal
    if (closeProfile) {
        closeProfile.addEventListener("click", () => {
            profileModal.style.display = "none";
        });
    }

    // Close modal by clicking outside
    window.addEventListener("click", (e) => {
        if (e.target === profileModal) {
            profileModal.style.display = "none";
        }
    });

    // Upload new profile picture
    if (profileForm) {
        profileForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const user = JSON.parse(localStorage.getItem("user"));
            const token = localStorage.getItem("token");
            const file = fileInput.files[0];

            if (!file) return alert("Please select an image.");

            const formData = new FormData();
            formData.append("profile", file);
            formData.append("id", user.id);

            try {
                const response = await fetch("/api/auth/upload-profile", {
                    method: "POST",
                    headers: { "x-auth-token": token },
                    body: formData
                });

                const data = await response.json();

                if (response.ok) {
                    // Update navbar image immediately
                    navPic.src = `/uploads/${data.profileImage}`;

                    // Update localStorage
                    user.profileImage = data.profileImage;
                    localStorage.setItem("user", JSON.stringify(user));

                    alert("Profile updated!");
                    profileModal.style.display = "none";
                } else {
                    alert("Error: " + data.message);
                }
            } catch (err) {
                console.error(err);
                alert("Upload failed.");
            }
        });
    }
});
