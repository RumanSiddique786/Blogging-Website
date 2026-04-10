// RumanWrites - Blogging Website

let currentUser = null;
let users = [];
let posts = [];
let currentPostId = null;
let currentAuthTab = 'login';

function seedData() {
    if (!localStorage.getItem('rumanwrites_users')) {
        users = [
            { id: 1, name: "Ruman Tanveer", email: "ruman@example.com", password: "123456", avatar: "🧔" }
        ];
        localStorage.setItem('rumanwrites_users', JSON.stringify(users));
    } else {
        users = JSON.parse(localStorage.getItem('rumanwrites_users'));
    }

    if (!localStorage.getItem('rumanwrites_posts')) {
        posts = [
            { id: 101, authorId: 1, title: "Why Consistency Beats Talent", content: "Showing up every day creates results talent cannot match.", timestamp: "2026-04-09T08:30:00Z", likes: [1], comments: [], category: "growth" },
            { id: 102, authorId: 1, title: "The Power of Writing in Public", content: "Writing publicly forces clarity and opens doors.", timestamp: "2026-04-08T14:20:00Z", likes: [], comments: [], category: "writing" },
            { id: 103, authorId: 1, title: "10 Life Lessons I Learned in 2025", content: "Small changes compound over time.", timestamp: "2026-04-07T11:45:00Z", likes: [1], comments: [], category: "life" },
            { id: 104, authorId: 1, title: "Modern Web Development Trends 2026", content: "Tailwind, AI tools, and new frameworks.", timestamp: "2026-04-06T18:45:00Z", likes: [], comments: [], category: "tech" },
            { id: 105, authorId: 1, title: "How to Build Better Habits", content: "Using technology to build good habits.", timestamp: "2026-04-05T09:15:00Z", likes: [], comments: [], category: "growth" },
            { id: 106, authorId: 1, title: "My Journey From 9-5 to Creator", content: "How I left corporate life.", timestamp: "2026-04-04T16:30:00Z", likes: [1], comments: [], category: "life" }
        ];
        localStorage.setItem('rumanwrites_posts', JSON.stringify(posts));
    } else {
        posts = JSON.parse(localStorage.getItem('rumanwrites_posts'));
    }
}

function getUser(id) {
    return users.find(u => u.id === id);
}

function formatDate(ts) {
    return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Render Posts
function renderPosts(containerId, filteredPosts = null) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    const postsToShow = filteredPosts || posts;

    postsToShow.forEach(post => {
        const author = getUser(post.authorId);
        const isLiked = currentUser && post.likes.includes(currentUser.id);

        container.innerHTML += `
            <div onclick="openPostModal(${post.id})" class="post-card bg-white rounded-3xl overflow-hidden border border-slate-100 cursor-pointer">
                <div class="p-7">
                    <div class="flex items-center gap-4">
                        <span class="text-4xl">${author ? author.avatar : '👤'}</span>
                        <div>
                            <p class="font-semibold">${author ? author.name : 'Unknown'}</p>
                            <p class="text-xs text-slate-400">${formatDate(post.timestamp)}</p>
                        </div>
                    </div>
                    <h3 class="mt-6 text-xl font-semibold leading-tight">${post.title}</h3>
                    <p class="text-slate-600 mt-4 line-clamp-3">${post.content.substring(0, 145)}...</p>
                </div>
                <div class="px-7 py-5 border-t flex items-center justify-between text-sm">
                    <button onclick="event.stopImmediatePropagation(); toggleLike(${post.id});" 
                            class="flex items-center gap-2 ${isLiked ? 'text-red-500' : 'text-slate-400 hover:text-red-500'}">
                        <i class="fa-solid fa-heart"></i> <span>${post.likes.length}</span>
                    </button>
                    <span class="text-slate-400">${post.comments.length} comments</span>
                </div>
            </div>
        `;
    });
}

function toggleLike(postId) {
    if (!currentUser) return showToast("Please login to like posts");
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    const index = post.likes.indexOf(currentUser.id);
    if (index > -1) post.likes.splice(index, 1);
    else post.likes.push(currentUser.id);
    localStorage.setItem('rumanwrites_posts', JSON.stringify(posts));
    renderAllGrids();
    if (currentPostId === postId) openPostModal(postId);
}

function openPostModal(postId) {
    currentPostId = postId;
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const author = getUser(post.authorId);
    const isLiked = currentUser && post.likes.includes(currentUser.id);

    const modalHTML = `
        <div onclick="event.stopImmediatePropagation()" class="modal bg-white w-full max-w-3xl rounded-3xl max-h-[90vh] flex flex-col overflow-hidden">
            <div class="px-8 py-6 border-b flex justify-between items-center">
                <div class="flex items-center gap-4">
                    <span class="text-5xl">${author ? author.avatar : '👤'}</span>
                    <div>
                        <p class="font-semibold">${author ? author.name : ''}</p>
                        <p class="text-xs text-slate-400">${formatDate(post.timestamp)}</p>
                    </div>
                </div>
                <button onclick="hidePostModal()" class="text-4xl text-slate-400">×</button>
            </div>
            <div class="flex-1 p-8 overflow-auto">
                <h1 class="text-3xl font-semibold mb-8">${post.title}</h1>
                <div class="text-lg leading-relaxed text-slate-700 whitespace-pre-line">${post.content}</div>

                <div class="my-10 border-y py-6 flex items-center gap-10">
                    <button onclick="toggleLike(${post.id})" class="flex items-center gap-3 text-2xl ${isLiked ? 'text-red-500' : 'text-slate-400'}">
                        <i class="fa-solid fa-heart"></i> <span>${post.likes.length}</span>
                    </button>
                </div>

                <h4 class="font-medium mb-5">Comments</h4>
                <div id="comments-list" class="space-y-6 mb-8"></div>

                ${currentUser ? `
                <div>
                    <textarea id="comment-text" rows="3" class="w-full border border-slate-200 rounded-2xl p-5" placeholder="Write your thoughts..."></textarea>
                    <button onclick="addComment()" class="mt-4 bg-indigo-600 text-white px-8 py-3 rounded-3xl">Post Comment</button>
                </div>` : ''}
            </div>
        </div>
    `;

    document.getElementById('post-modal').innerHTML = modalHTML;
    document.getElementById('post-modal').classList.remove('hidden');
    document.getElementById('post-modal').classList.add('flex');

    renderComments(post);
}

function renderComments(post) {
    const container = document.getElementById('comments-list');
    if (!container) return;
    container.innerHTML = post.comments.length === 0 ? `<p class="text-slate-400">No comments yet.</p>` : '';

    post.comments.forEach(c => {
        const author = getUser(c.authorId);
        container.innerHTML += `
            <div class="flex gap-4">
                <span class="text-3xl">${author ? author.avatar : '👤'}</span>
                <div>
                    <p class="font-medium">${author ? author.name : 'Anonymous'}</p>
                    <p class="text-slate-700">${c.text}</p>
                </div>
            </div>
        `;
    });
}

function addComment() {
    if (!currentUser || !currentPostId) return;
    const text = document.getElementById('comment-text').value.trim();
    if (!text) return;

    const post = posts.find(p => p.id === currentPostId);
    post.comments.push({ id: Date.now(), authorId: currentUser.id, text: text, timestamp: new Date().toISOString() });

    localStorage.setItem('rumanwrites_posts', JSON.stringify(posts));
    renderComments(post);
    openPostModal(currentPostId);
}

function hidePostModal() {
    document.getElementById('post-modal').classList.add('hidden');
    document.getElementById('post-modal').classList.remove('flex');
}

function publishPost() {
    if (!currentUser) return showToast("Please login to publish a story");
    const title = document.getElementById('post-title').value.trim();
    const content = document.getElementById('post-content').value.trim();
    if (!title || !content) return showToast("Title and content required", true);

    posts.unshift({
        id: Date.now(),
        authorId: currentUser.id,
        title: title,
        content: content,
        timestamp: new Date().toISOString(),
        likes: [],
        comments: []
    });

    localStorage.setItem('rumanwrites_posts', JSON.stringify(posts));
    showToast("🎉 Story published successfully!");
    document.getElementById('post-title').value = '';
    document.getElementById('post-content').value = '';
    navigateTo('feed');
}

// ====================== AUTH MODAL ======================
function showAuthModal() {
    currentAuthTab = 'login';
    renderAuthModal();
}

function renderAuthModal() {
    let html = `
        <div onclick="event.stopImmediatePropagation()" class="modal bg-white w-full max-w-md rounded-3xl p-8">
            <div class="flex border-b mb-6">
                <button onclick="switchAuthTab('login')" class="flex-1 pb-4 text-lg font-medium ${currentAuthTab === 'login' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-400'}">Login</button>
                <button onclick="switchAuthTab('register')" class="flex-1 pb-4 text-lg font-medium ${currentAuthTab === 'register' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-400'}">Sign Up</button>
            </div>
            ${currentAuthTab === 'login' ? `
            <input id="login-email" type="email" value="ruman@example.com" class="w-full px-5 py-4 border border-slate-200 rounded-2xl mb-4">
            <input id="login-password" type="password" value="123456" class="w-full px-5 py-4 border border-slate-200 rounded-2xl mb-6">
            <button onclick="login()" class="w-full bg-indigo-600 text-white py-4 rounded-3xl font-medium">Login</button>` : `
            <input id="register-name" type="text" placeholder="Full Name" class="w-full px-5 py-4 border border-slate-200 rounded-2xl mb-4">
            <input id="register-email" type="email" placeholder="Email" class="w-full px-5 py-4 border border-slate-200 rounded-2xl mb-4">
            <input id="register-password" type="password" placeholder="Password" class="w-full px-5 py-4 border border-slate-200 rounded-2xl mb-6">
            <button onclick="register()" class="w-full bg-violet-600 text-white py-4 rounded-3xl font-medium">Create Account</button>`}
        </div>
    `;
    document.getElementById('auth-modal').innerHTML = html;
    document.getElementById('auth-modal').classList.remove('hidden');
}

function switchAuthTab(tab) {
    currentAuthTab = tab;
    renderAuthModal();
}

function login() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        currentUser = user;
        localStorage.setItem('rumanwrites_current_user', JSON.stringify(user));
        document.getElementById('auth-modal').classList.add('hidden');
        document.getElementById('auth-btn').classList.add('hidden');
        document.getElementById('logout-btn').classList.remove('hidden');
        showToast(`Welcome back, ${user.name.split(' ')[0]}!`);
        renderAllGrids();
    } else {
        showToast("Invalid email or password", true);
    }
}

function register() {
    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value.trim();

    if (!name || !email || !password) return showToast("All fields required", true);
    if (users.find(u => u.email === email)) return showToast("Email already exists", true);

    const newUser = { id: Date.now(), name, email, password, avatar: "👤" };
    users.push(newUser);
    localStorage.setItem('rumanwrites_users', JSON.stringify(users));

    currentUser = newUser;
    localStorage.setItem('rumanwrites_current_user', JSON.stringify(newUser));

    document.getElementById('auth-modal').classList.add('hidden');
    document.getElementById('auth-btn').classList.add('hidden');
    document.getElementById('logout-btn').classList.remove('hidden');
    showToast(`Account created! Welcome, ${name.split(' ')[0]}!`);
    renderAllGrids();
}

// Close auth modal when clicking outside
document.getElementById('auth-modal').addEventListener('click', function(e) {
    if (e.target.id === 'auth-modal') {
        this.classList.add('hidden');
    }
});

function logout() {
    currentUser = null;
    localStorage.removeItem('rumanwrites_current_user');
    document.getElementById('auth-btn').classList.remove('hidden');
    document.getElementById('logout-btn').classList.add('hidden');
    showToast("Logged out successfully");
    navigateTo('feed');
}

// Navigation
function navigateTo(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    const activePage = document.getElementById('page-' + page);
    if (activePage) activePage.classList.remove('hidden');

    if (page === 'feed' || page === 'discover') renderAllGrids();
    if (page === 'profile' && currentUser) renderProfile();
}

function renderAllGrids() {
    renderPosts('posts-grid');
    renderPosts('discover-grid');
    renderTrending();
}

// Trending Function
function renderTrending() {
    const container = document.getElementById('trending-grid');
    if (!container) return;
    container.innerHTML = '';

    // Shuffle posts and take 4 random ones
    let shuffled = [...posts].sort(() => 0.5 - Math.random());
    let trendingPosts = shuffled.slice(0, 4);

    trendingPosts.forEach(post => {
        const author = getUser(post.authorId);
        
        container.innerHTML += `
            <div onclick="openPostModal(${post.id})" class="bg-white rounded-3xl p-5 border border-slate-100 cursor-pointer hover:border-indigo-200">
                <h4 class="font-medium line-clamp-2">${post.title}</h4>
                <p class="text-xs text-slate-400 mt-3">
                    ${author ? author.name.split(' ')[0] : 'Ruman'} • ${getRelativeDate(post.timestamp)}
                </p>
            </div>
        `;
    });
}

// Better relative date function (Today, Yesterday, 2 days ago, etc.)
function getRelativeDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return diffDays + " days ago";
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Filter Category
function filterCategory(el) {
    document.querySelectorAll('.category-chip').forEach(c => c.classList.remove('active', 'bg-indigo-100', 'text-indigo-700'));
    el.classList.add('active', 'bg-indigo-100', 'text-indigo-700');

    const categoryText = el.textContent.trim();
    let filtered = posts;

    if (categoryText === "Technology") {
        filtered = posts.filter(p => p.title.toLowerCase().includes("web") || p.title.toLowerCase().includes("trend") || p.title.toLowerCase().includes("development"));
    } else if (categoryText === "Life Lessons") {
        filtered = posts.filter(p => p.title.toLowerCase().includes("lesson") || p.title.toLowerCase().includes("life") || p.title.toLowerCase().includes("journey"));
    } else if (categoryText === "Writing Tips") {
        filtered = posts.filter(p => p.title.toLowerCase().includes("writing") || p.title.toLowerCase().includes("power"));
    } else if (categoryText === "Personal Growth") {
        filtered = posts.filter(p => p.title.toLowerCase().includes("habit") || p.title.toLowerCase().includes("consistency"));
    } 
    // "All" shows everything 

    renderPosts('posts-grid', filtered);
}

function renderProfile() {
    document.getElementById('profile-avatar').innerHTML = currentUser.avatar;
    document.getElementById('profile-name').innerHTML = currentUser.name;
    document.getElementById('profile-email').innerHTML = currentUser.email;

    const container = document.getElementById('my-posts');
    const myPosts = posts.filter(p => p.authorId === currentUser.id);

    container.innerHTML = myPosts.length === 0 ? `<p class="text-slate-400">No stories yet. Start writing!</p>` : '';

    myPosts.forEach(post => {
        container.innerHTML += `
            <div onclick="openPostModal(${post.id});navigateTo('feed')" class="bg-white p-6 rounded-3xl border border-slate-100 cursor-pointer hover:border-indigo-200">
                <h4 class="font-semibold">${post.title}</h4>
                <p class="text-xs text-slate-400 mt-2">${formatDate(post.timestamp)} • ${post.likes.length} likes</p>
            </div>
        `;
    });
}

function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.style.backgroundColor = isError ? '#ef4444' : '#1e2937';
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3000);
}

function init() {
    seedData();
    const savedUser = localStorage.getItem('rumanwrites_current_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        document.getElementById('auth-btn').classList.add('hidden');
        document.getElementById('logout-btn').classList.remove('hidden');
    }
    renderAllGrids();
}

window.onload = init;