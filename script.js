// --- Global Variables ---
let username = localStorage.getItem("username");
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let taskList = document.getElementById("taskList");

// --- Initialization ---
// Combined into ONE onload function to prevent conflicts
window.onload = function () {
    if (username) {
        showApp();
        displayTasks(tasks);
    } else {
        showLogin();
    }
};

// --- Task Functions ---

function addTask() {
    let input = document.getElementById("taskInput");
    let taskText = input.value.trim();

    if (taskText === "") {
        alert("Please enter a task!");
        return;
    }

    let taskObj = {
        id: Date.now(), // Unique ID for each task
        text: taskText,
        completed: false,
        timestamp: new Date().toLocaleString()
    };

    tasks.push(taskObj);
    saveTasks();
    createTaskElement(taskObj);
    input.value = "";
}

function createTaskElement(taskObj) {
    let li = document.createElement("li");
    li.draggable = true;
    li.dataset.id = taskObj.id;

    // Task text and Date
    let span = document.createElement("span");
    span.innerHTML = `<strong>${taskObj.text}</strong> <br> <small>${taskObj.timestamp}</small>`;
    if (taskObj.completed) span.classList.add("completed");

    span.onclick = function () {
        span.classList.toggle("completed");
        toggleStatus(taskObj.id);
    };

    // Edit Button
    let editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.onclick = function () {
        let newText = prompt("Edit your task:", taskObj.text);
        if (newText !== null && newText.trim() !== "") {
            updateTaskText(taskObj.id, newText.trim());
            location.reload(); // Refresh to show changes
        }
    };

    // Delete Button
    let deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.onclick = function () {
        li.remove();
        deleteTask(taskObj.id);
    };

    li.appendChild(span);
    li.appendChild(editBtn);
    li.appendChild(deleteBtn);
    taskList.appendChild(li);

    // Drag & Drop Listeners
    li.addEventListener('dragstart', dragStart);
    li.addEventListener('dragover', dragOver);
    li.addEventListener('drop', drop);
}

// --- Data Management ---

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function toggleStatus(id) {
    tasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    saveTasks();
}

function updateTaskText(id, newText) {
    tasks = tasks.map(t => t.id === id ? { ...t, text: newText } : t);
    saveTasks();
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
}

function displayTasks(arr) {
    taskList.innerHTML = "";
    arr.forEach(t => createTaskElement(t));
}

// --- User & App Flow ---

function login() {
    let name = document.getElementById("usernameInput").value.trim();
    if (name === "") {
        alert("Please enter your name");
        return;
    }
    localStorage.setItem("username", name);
    username = name;
    showApp();
    displayTasks(tasks);
}

function logout() {
    localStorage.removeItem("username");
    // Clear the username variable and reload the page to go back to login screen
    username = null;
    location.reload(); 
}

function showApp() {
    document.getElementById("loginBox").style.display = "none";
    document.getElementById("appBox").style.display = "block";
    document.getElementById("welcome").innerText = "Welcome, " + username + " 👋";
}

function showLogin() {
    document.getElementById("loginBox").style.display = "block";
    document.getElementById("appBox").style.display = "none";
}

// --- Search & Drag/Drop ---

function searchTasks() {
    let val = document.getElementById("searchInput").value.toLowerCase();
    let filtered = tasks.filter(t => t.text.toLowerCase().includes(val));
    displayTasks(filtered);
}

let dragged;
function dragStart(e) { dragged = e.target; }
function dragOver(e) { e.preventDefault(); }
function drop(e) {
    e.preventDefault();
    if (e.target.tagName === "LI" && e.target !== dragged) {
        taskList.insertBefore(dragged, e.target.nextSibling);
        reorderTasks();
    }
}

function reorderTasks() {
    let newList = [];
    taskList.querySelectorAll("li").forEach(li => {
        let id = parseInt(li.dataset.id);
        let found = tasks.find(t => t.id === id);
        newList.push(found);
    });
    tasks = newList;
    saveTasks();
}

function toggleDarkMode() {
    const body = document.body;
    const btn = document.getElementById("themeToggle");
    
    // Toggle the class
    body.classList.toggle("dark-mode");
    
    // Save the preference
    const isDark = body.classList.contains("dark-mode");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    
    // Update button text/icon
    btn.innerHTML = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
}

// Keep this inside your window.onload to apply the saved theme
if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
    document.getElementById("themeToggle").innerHTML = "☀️ Light Mode";
}
// Filter: Show everything
function showAll() { 
    displayTasks(tasks); 
}

// Filter: Show only tasks where completed is true
function showCompleted() { 
    const filtered = tasks.filter(t => t.completed === true);
    displayTasks(filtered); 
}

// Filter: Show only tasks where completed is false
function showActive() { 
    const filtered = tasks.filter(t => t.completed === false);
    displayTasks(filtered); 
}

// The Core Display Function
function displayTasks(arr) {
    taskList.innerHTML = ""; // Clear current list
    arr.forEach(t => createTaskElement(t)); // Re-build list from the array
}