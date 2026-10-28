// --- STATE MANAGEMENT ---
let tasks = JSON.parse(localStorage.getItem('mobile_app_tasks')) || [
  { id: 1, text: 'Membaca buku 15 minit', category: 'Peribadi', completed: true },
  { id: 2, text: 'Kemaskini jadual mingguan', category: 'Kerja', completed: false },
  { id: 3, text: 'Beli barang dapur', category: 'Penting', completed: false }
];

let currentFilter = 'all';
let username = localStorage.getItem('mobile_app_username') || 'Pengguna Mobile';
let avatarUrl = localStorage.getItem('mobile_app_avatar') || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';
let isDarkMode = localStorage.getItem('mobile_app_dark') === 'true';

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
  updateClock();
  setInterval(updateClock, 1000);

  // Apply Initial Dark Mode State
  if (isDarkMode) {
    document.documentElement.classList.add('dark');
    document.getElementById('dark-mode-toggle').checked = true;
  }

  // Load User Data
  updateUserProfileUI();

  // Render Tasks
  renderTasks();

  // Task Form Submit Event
  document.getElementById('add-task-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('task-input');
    const category = document.getElementById('task-category').value;
    
    if (input.value.trim() === '') return;

    const newTask = {
      id: Date.now(),
      text: input.value.trim(),
      category: category,
      completed: false
    };

    tasks.unshift(newTask);
    saveTasks();
    renderTasks();
    input.value = '';
  });
});

// --- CLOCK FUNCTION ---
function updateClock() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  document.getElementById('clock-time').textContent = `${hours}:${minutes}`;
}

// --- NAVIGATION SYSTEM ---
function switchTab(tabName) {
  // Hide all tabs
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });

  // Reset Nav Styles
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.className = 'nav-btn flex flex-col items-center space-y-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300';
  });

  // Activate Selected Tab
  const targetTab = document.getElementById(`tab-${tabName}`);
  const targetNav = document.getElementById(`nav-${tabName}`);

  if (targetTab && targetNav) {
    targetTab.classList.add('active');
    targetNav.className = 'nav-btn flex flex-col items-center space-y-1 text-indigo-600 dark:text-indigo-400';
  }
}

// --- TASK FUNCTIONS ---
function renderTasks() {
  const listContainer = document.getElementById('task-list');
  const homePreviewContainer = document.getElementById('home-tasks-preview');
  
  listContainer.innerHTML = '';
  homePreviewContainer.innerHTML = '';

  // Filter Tasks
  let filteredTasks = tasks;
  if (currentFilter === 'active') {
    filteredTasks = tasks.filter(t => !t.completed);
  } else if (currentFilter === 'completed') {
    filteredTasks = tasks.filter(t => t.completed);
  }

  // Update Stats
  const completedCount = tasks.filter(t => t.completed).length;
  const pendingCount = tasks.length - completedCount;

  document.getElementById('stat-completed').textContent = completedCount;
  document.getElementById('stat-pending').textContent = pendingCount;
  document.getElementById('task-count-badge').textContent = `${tasks.length} Tugasan`;

  // Render Empty State
  if (filteredTasks.length === 0) {
    listContainer.innerHTML = `
      <div class="text-center py-8 text-slate-400">
        <i class="fas fa-clipboard-list text-3xl mb-2 opacity-50"></i>
        <p class="text-xs">Tiada tugasan dijumpai</p>
      </div>
    `;
  } else {
    // Render Full List
    filteredTasks.forEach(task => {
      const li = document.createElement('li');
      li.className = `p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between shadow-sm transition ${task.completed ? 'opacity-60' : ''}`;
      
      let categoryBadgeClass = 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300';
      if (task.category === 'Penting') categoryBadgeClass = 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300';
      if (task.category === 'Peribadi') categoryBadgeClass = 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300';

      li.innerHTML = `
        <div class="flex items-center space-x-3 overflow-hidden pr-2">
          <button onclick="toggleTask(${task.id})" class="w-5 h-5 rounded-md border flex items-center justify-center transition ${task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-slate-600'}">
            ${task.completed ? '<i class="fas fa-check text-xs"></i>' : ''}
          </button>
          <div class="truncate">
            <p class="text-xs font-medium text-slate-800 dark:text-slate-100 ${task.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''}">${escapeHtml(task.text)}</p>
            <span class="inline-block text-[9px] px-2 py-0.5 rounded-full mt-0.5 font-semibold ${categoryBadgeClass}">${task.category}</span>
          </div>
        </div>
        <button onclick="deleteTask(${task.id})" class="text-slate-400 hover:text-rose-500 transition p-1">
          <i class="fas fa-trash-alt text-xs"></i>
        </button>
      `;
      listContainer.appendChild(li);
    });
  }

  // Render Home Tab Preview (Top 3 active tasks)
  const homeTasks = tasks.filter(t => !t.completed).slice(0, 3);
  if (homeTasks.length === 0) {
    homePreviewContainer.innerHTML = `
      <div class="p-4 bg-white dark:bg-slate-800 rounded-xl text-center text-xs text-slate-400 border border-slate-200/60 dark:border-slate-700/60">
        ✨ Semua tugasan telah selesai!
      </div>
    `;
  } else {
    homeTasks.forEach(task => {
      const div = document.createElement('div');
      div.className = 'p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs';
      div.innerHTML = `
        <span class="font-medium text-slate-700 dark:text-slate-200 truncate pr-2">${escapeHtml(task.text)}</span>
        <button onclick="toggleTask(${task.id})" class="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline">Selesai</button>
      `;
      homePreviewContainer.appendChild(div);
    });
  }
}

function toggleTask(id) {
  tasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
}

function filterTasks(filter) {
  currentFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.className = 'filter-btn pb-2 hover:text-slate-700 dark:hover:text-slate-300';
  });
  
  const activeBtn = document.getElementById(`filter-${filter}`);
  if (activeBtn) {
    activeBtn.className = 'filter-btn pb-2 text-indigo-600 border-b-2 border-indigo-600 font-bold';
  }
  
  renderTasks();
}

function saveTasks() {
  localStorage.setItem('mobile_app_tasks', JSON.stringify(tasks));
}

// --- USER PROFILE & DARK MODE ---
function toggleDarkMode() {
  isDarkMode = !isDarkMode;
  if (isDarkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  document.getElementById('dark-mode-toggle').checked = isDarkMode;
  localStorage.setItem('mobile_app_dark', isDarkMode);
}

function updateUserProfileUI() {
  document.getElementById('user-display-name').textContent = username;
  document.getElementById('profile-name-text').textContent = username;
  document.getElementById('input-username').value = username;
  
  document.getElementById('user-display-img').src = avatarUrl;
  document.getElementById('profile-img-preview').src = avatarUrl;
}

function saveProfile() {
  const newName = document.getElementById('input-username').value.trim();
  if (newName) {
    username = newName;
    localStorage.setItem('mobile_app_username', username);
    updateUserProfileUI();
    alert('Profil berjaya dikemaskini!');
  }
}

function changeAvatar() {
  const avatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80'
  ];
  const nextAvatar = avatars[(avatars.indexOf(avatarUrl) + 1) % avatars.length];
  avatarUrl = nextAvatar;
  localStorage.setItem('mobile_app_avatar', avatarUrl);
  updateUserProfileUI();
}

function resetAppData() {
  if (confirm('Adakah anda pasti untuk menyet semula semua data aplikasi?')) {
    localStorage.clear();
    location.reload();
  }
}

// --- HELPER FUNCTION ---
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}