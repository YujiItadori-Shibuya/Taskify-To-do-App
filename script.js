// Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyB9hHjs7GcHjYt1yg9rJ-ekgp0cjMGpLJQ",
    authDomain: "taskify-fa561.firebaseapp.com",
    projectId: "taskify-fa561",
    storageBucket: "taskify-fa561.firebasestorage.app",
    messagingSenderId: "939807735888",
    appId: "1:939807735888:web:129954b6e14ce9768f9155",
    measurementId: "G-81HNG0RY00"
};

// Initialize Firebase (Compat)
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const googleProvider = new firebase.auth.GoogleAuthProvider();

// DOM Elements
const authSection = document.getElementById('authSection');
const appSection = document.getElementById('appSection');
const userEmailDisplay = document.getElementById('userEmail');

// Inputs for Auth
const emailInput = document.getElementById('emailInput');
const passwordInput = document.getElementById('passwordInput');
const authError = document.getElementById('authError');

// Buttons
const googleSignInBtn = document.getElementById('googleSignInBtn');
const emailSignInBtn = document.getElementById('emailSignInBtn');
const emailSignUpBtn = document.getElementById('emailSignUpBtn');
const logoutBtn = document.getElementById('logoutBtn');

// Task UI Elements
const taskInput = document.getElementById('taskInput');
const categorySelect = document.getElementById('categorySelect');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const filterBtns = document.querySelectorAll('.filter-btn');
const emptyState = document.getElementById('emptyState');
const countAll = document.getElementById('countAll');
const countActive = document.getElementById('countActive');
const countCompleted = document.getElementById('countCompleted');

let currentFilter = 'all';
let unsubscribeTasks = null;
let allTasks = [];

// --- Auth State Management ---
auth.onAuthStateChanged((user) => {
    if (user) {
        // User is signed in
        authSection.style.display = 'none';
        appSection.style.display = 'block';
        userEmailDisplay.textContent = user.email;
        setupTaskListener(user.uid);
    } else {
        // User is signed out
        authSection.style.display = 'flex';
        appSection.style.display = 'none';
        userEmailDisplay.textContent = '';
        if (unsubscribeTasks) unsubscribeTasks();
        taskList.innerHTML = '';
        allTasks = [];
        updateStats(allTasks);
        currentFilter = 'all'; // Reset filter
        updateFilterUI();
    }
});

// --- Auth Functions ---
function signInWithGoogle() {
    auth.signInWithPopup(googleProvider)
        .then(() => {
            authError.textContent = '';
        })
        .catch((error) => {
            authError.textContent = error.message;
        });
}

function signInEmail() {
    const email = emailInput.value;
    const password = passwordInput.value;
    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            authError.textContent = '';
        })
        .catch((error) => {
            authError.textContent = error.message;
        });
}

function signUpEmail() {
    const email = emailInput.value;
    const password = passwordInput.value;
    auth.createUserWithEmailAndPassword(email, password)
        .then(() => {
            authError.textContent = '';
        })
        .catch((error) => {
            authError.textContent = error.message;
        });
}

function logout() {
    auth.signOut();
}

// --- Firestore Functions ---
function setupTaskListener(userId) {
    // Query tasks for this user, ordered by creation time
    const q = db.collection("tasks")
        .where("uid", "==", userId)
        .orderBy("createdAt", "desc");

    unsubscribeTasks = q.onSnapshot((snapshot) => {
        allTasks = [];
        snapshot.forEach((doc) => {
            allTasks.push({ id: doc.id, ...doc.data() });
        });
        renderTasks(allTasks);
    });
}

function addTask() {
    const user = auth.currentUser;
    if (!user) return;

    const text = taskInput.value.trim();
    if (!text) return;

    db.collection("tasks").add({
        text: text,
        category: categorySelect.value,
        completed: false,
        uid: user.uid,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    })
        .then(() => {
            taskInput.value = '';
        })
        .catch((e) => {
            console.error("Error adding doc: ", e);
        });
}

function toggleTask(task) {
    db.collection("tasks").doc(task.id).update({
        completed: !task.completed
    });
}

function deleteTask(taskId) {
    db.collection("tasks").doc(taskId).delete();
}

// --- UI Rendering ---
function renderTasks(tasks) {
    let filteredTasks = tasks;
    if (currentFilter === 'active') {
        filteredTasks = tasks.filter(t => !t.completed);
    } else if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(t => t.completed);
    }

    updateStats(tasks);

    taskList.innerHTML = '';
    if (filteredTasks.length === 0) {
        emptyState.style.display = 'block';
    } else {
        emptyState.style.display = 'none';
        filteredTasks.forEach(task => {
            taskList.appendChild(createTaskElement(task));
        });
    }
}

function createTaskElement(task) {
    const item = document.createElement('div');
    item.className = 'task-item';
    item.setAttribute('data-id', task.id);

    // Escape HTML (basic)
    const escapedText = task.text.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    item.innerHTML = `
        <label class="task-checkbox-wrapper">
            <input type="checkbox" class="task-checkbox-input" ${task.completed ? 'checked' : ''}>
            <span class="custom-checkbox">
                <i class="fa-solid fa-check"></i>
            </span>
        </label>
        <div class="task-content">
            <span class="task-text">${escapedText}</span>
            <span class="task-category cat-${task.category}">${task.category}</span>
        </div>
        <button class="delete-btn" aria-label="Delete Task">
            <i class="fa-solid fa-trash"></i>
        </button>
    `;

    // Listeners must be attached to the new elements
    const checkbox = item.querySelector('.task-checkbox-input');
    checkbox.addEventListener('change', () => toggleTask(task));

    const deleteBtn = item.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => deleteTask(task.id));

    return item;
}

function updateStats(tasks) {
    const total = tasks.length;
    const active = tasks.filter(t => !t.completed).length;
    const completed = tasks.filter(t => t.completed).length;

    countAll.textContent = total;
    countActive.textContent = active;
    countCompleted.textContent = completed;
}

function updateFilterUI() {
    filterBtns.forEach(btn => {
        if (btn.dataset.filter === currentFilter) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

function setFilter(filterType) {
    currentFilter = filterType;
    updateFilterUI();
    renderTasks(allTasks);
}

// Event Listeners
googleSignInBtn.addEventListener('click', signInWithGoogle);
emailSignInBtn.addEventListener('click', signInEmail);
emailSignUpBtn.addEventListener('click', signUpEmail);
logoutBtn.addEventListener('click', logout);

addTaskBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
});

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        setFilter(btn.dataset.filter);
    });
});
