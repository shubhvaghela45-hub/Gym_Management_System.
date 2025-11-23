// Keys for localStorage
const STORAGE_KEYS = {
    members: 'gym_members',
    bills: 'gym_bills',
    packages: 'gym_packages',
    notifications: 'gym_notifications',
    supplements: 'gym_supplements',
    diets: 'gym_diets'
};

// Load demo data if empty
function loadDemoData() {
    if (!localStorage.getItem(STORAGE_KEYS.members)) {
        localStorage.setItem(STORAGE_KEYS.members, JSON.stringify([
            { id: 1, name: 'John Doe', email: 'member@gym.com', password: 'memberpass', createdAt: new Date().toISOString() }
        ]));
        localStorage.setItem(STORAGE_KEYS.bills, JSON.stringify([
            { id: 1, memberId: 1, amount: 50.00, date: new Date().toISOString().split('T')[0] }
        ]));
        localStorage.setItem(STORAGE_KEYS.notifications, JSON.stringify([
            { id: 1, memberId: 1, message: 'Gym closed on holidays', date: new Date().toISOString().split('T')[0] }
        ]));
        localStorage.setItem(STORAGE_KEYS.packages, JSON.stringify([
            { id: 1, memberId: 1, packageType: 'Basic', assignedAt: new Date().toISOString() }
        ]));
        localStorage.setItem(STORAGE_KEYS.supplements, JSON.stringify([
            { id: 1, name: 'Protein Powder', price: 29.99, stock: 10 }
        ]));
        localStorage.setItem(STORAGE_KEYS.diets, JSON.stringify([
            { id: 1, memberId: 1, plan: 'High Protein Diet: 200g/day', createdAt: new Date().toISOString() }
        ]));
        console.log('Demo data loaded');
    }
}

// Helpers to get and set data
function getData(key) {
    return JSON.parse(localStorage.getItem(key) || '[]');
}

function setData(key, data) {
    const existing = getData(key);
    const newId = existing.length > 0 ? Math.max(...existing.map(item => item.id)) + 1 : 1;
    const itemWithId = { id: newId, ...data };
    const updated = [...existing, itemWithId];
    localStorage.setItem(key, JSON.stringify(updated));
    return newId;
}

function updateData(key, id, updates) {
    const data = getData(key);
    const index = data.findIndex(item => item.id === id);
    if (index !== -1) {
        data[index] = { ...data[index], ...updates };
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    }
    return false;
}

function deleteData(key, id) {
    const filtered = getData(key).filter(item => item.id !== id);
    localStorage.setItem(key, JSON.stringify(filtered));
}

// Validate inputs
function validateInput(...fields) {
    return fields.every(f => typeof f === 'string' && f.trim() !== '');
}

// Show module & hide others
function showModule(moduleId) {
    document.querySelectorAll('.module').forEach(m => m.classList.add('hidden'));
    const module = document.getElementById(moduleId);
    if (module) {
        module.classList.remove('hidden');
    }
    document.getElementById('userInfo').classList.remove('hidden');
    document.getElementById('loginForm').classList.add('hidden');
}

function hideAllModules() {
    document.querySelectorAll('.module').forEach(m => m.classList.add('hidden'));
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('userInfo').classList.add('hidden');
}

function renderList(containerId, items, templateFn) {
    const container = document.getElementById(containerId);
    if (!items.length) {
        container.innerHTML = '<p>No items found.</p>';
        return;
    }
    container.innerHTML = items.map(templateFn).join('');
}

// --- Admin functions ---
function initAdmin() {
    const content = document.getElementById('adminContent');
    content.innerHTML = '';

    const addBtn = document.getElementById('addMemberBtn');
    addBtn.onclick = () => {
        const name = prompt('Member Name:');
        const email = prompt('Member Email:');
        const password = prompt('Member Password:');
        if (validateInput(name, email, password)) {
            setData(STORAGE_KEYS.members, { name, email, password, createdAt: new Date().toISOString() });
            alert('Member added!');
            showMembersList();
        } else {
            alert('Invalid input! Name, email, and password are required.');
        }
    };

    document.getElementById('viewMembersBtn').onclick = showMembersList;

    document.getElementById('createBillBtn').onclick = () => {
        const memberId = Number(prompt('Member ID:'));
        const amount = Number(prompt('Amount (₹):'));
        const date = prompt('Date (YYYY-MM-DD):') || new Date().toISOString().split('T')[0];
        if (memberId > 0 && !isNaN(amount) && validateInput(date)) {
            setData(STORAGE_KEYS.bills, { memberId, amount, date });
            alert('Bill created!');
        } else {
            alert('Invalid input!');
        }
    };

    document.getElementById('assignPackageBtn').onclick = () => {
        const memberId = Number(prompt('Enter Member ID to assign package:'));
        const packageType = prompt('Package Type (Basic, Pro, Premium):');
        if (memberId > 0 && validateInput(packageType)) {
            let packages = getData(STORAGE_KEYS.packages);
            const exists = packages.find(p => p.memberId === memberId);
            if (exists) {
                if (!confirm('Member already has a package. Overwrite?')) return;
                updateData(STORAGE_KEYS.packages, exists.id, { packageType, assignedAt: new Date().toISOString() });
            } else {
                setData(STORAGE_KEYS.packages, { memberId, packageType, assignedAt: new Date().toISOString() });
            }
            alert('Package assigned!');
        } else {
            alert('Invalid input!');
        }
    };

    document.getElementById('assignNotificationBtn').onclick = () => {
        const message = prompt('Notification Message:');
        const members = getData(STORAGE_KEYS.members);
        if (validateInput(message) && members.length) {
            members.forEach(m => {
                setData(STORAGE_KEYS.notifications, { memberId: m.id, message, date: new Date().toISOString().split('T')[0] });
            });
            alert('Notifications assigned to all members!');
        } else {
            alert('Invalid input or no members!');
        }
    };

    document.getElementById('exportReportBtn').onclick = () => {
        const bills = getData(STORAGE_KEYS.bills);
        const members = getData(STORAGE_KEYS.members);
        const csvRows = ['Member Name,Amount,Date'];
        bills.forEach(bill => {
            const m = members.find(mem => mem.id === bill.memberId);
            csvRows.push(`"${m ? m.name : 'Unknown'}",${bill.amount},"${bill.date}"`);
        });
        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'gym-report.csv';
        a.click();
        URL.revokeObjectURL(url);
        alert('Report exported!');
    };

    document.getElementById('supplementStoreBtn').onclick = () => {
        const name = prompt('Supplement Name:');
        const price = Number(prompt('Price ($):'));
        const stock = Number(prompt('Stock:')) || 0;
        if (validateInput(name) && !isNaN(price) && !isNaN(stock)) {
            setData(STORAGE_KEYS.supplements, { name, price, stock });
            alert('Supplement added!');
            showSupplements();
        } else {
            alert('Invalid input!');
        }
    };

    document.getElementById('dietDetailsBtn').onclick = () => {
        const memberId = Number(prompt('Member ID (optional):'));
        const plan = prompt('Diet Plan:');
        if (validateInput(plan)) {
            setData(STORAGE_KEYS.diets, { memberId: memberId > 0 ? memberId : null, plan, createdAt: new Date().toISOString() });
            alert('Diet plan added!');
        } else {
            alert('Invalid input!');
        }
    };

    function showMembersList() {
        const members = getData(STORAGE_KEYS.members);
        content.innerHTML = '<h3>Members List</h3>' +
            members.map(m => `
            <div class="item" style="margin-bottom:10px;">
                <div>
                    <b>${m.name}</b><br/>
                    Email: ${m.email}<br/>
                    Created: ${new Date(m.createdAt).toLocaleDateString()}
                </div>
                <div>
                    <button onclick="updateMember(${m.id})">Update</button>
                    <button onclick="deleteMember(${m.id}, '${STORAGE_KEYS.members}')">Delete</button>
                </div>
            </div>
        `).join('');
    }
}

// Update member data
window.updateMember = function(id) {
    const name = prompt('New Name:');
    const email = prompt('New Email:');
    const password = prompt('New Password (leave blank to keep current):');
    if (validateInput(name, email)) {
        const updates = { name, email };
        if (password && password.trim() !== '') updates.password = password.trim();
        if (updateData(STORAGE_KEYS.members, id, updates)) {
            alert('Member updated!');
            initAdmin();
        } else {
            alert('Update failed!');
        }
    } else {
        alert('Invalid input!');
    }
};

// Delete member - global function
window.deleteMember = function(id, key) {
    if (confirm('Are you sure you want to delete this member?')) {
        deleteData(key, id);
        alert('Deleted!');
        initAdmin();
    }
};

// LOGIN FUNCTION
function login(email, password, role) {
    const demoUsers = [
        { email: "admin@gym.com", password: "adminpass", role: "admin" },
        { email: "member@gym.com", password: "memberpass", role: "member" },
        { email: "user@gym.com", password: "userpass", role: "user" }
    ];

    let members = getData(STORAGE_KEYS.members);

    const users = demoUsers.concat(members.map(m => ({
        email: m.email,
        password: m.password,
        role: "member"
    })));

    const user = users.find(u =>
        u.email.toLowerCase() === email.toLowerCase() &&
        u.password === password &&
        u.role.toLowerCase() === role.toLowerCase()
    );

    return !!user;
}

// --- Member module ---
function initMember() {
    const welcomeMsg = document.getElementById('welcomeMsg');
    const email = sessionStorage.getItem('currentUser');
    const members = getData(STORAGE_KEYS.members);
    const member = members.find(m => m.email === email);

    if (!member) {
        document.getElementById('billReceipts').innerHTML = '<p>No member data found.</p>';
        document.getElementById('billNotifications').innerHTML = '';
        document.getElementById('memberPlan').innerHTML = '<p>No member data found.</p>';
        welcomeMsg.textContent = 'Member data not found';
        return;
    }

    welcomeMsg.textContent = `Welcome, Member (${email})`;

    const bills = getData(STORAGE_KEYS.bills).filter(b => b.memberId === member.id);
    const billReceipts = document.getElementById('billReceipts');
    billReceipts.innerHTML = bills.length ? bills.map(b => `
        <div class="bill-item" style="margin-bottom:10px;">
            <b>Bill:</b> ₹${b.amount.toFixed(2)}<br/>
            <b>Date:</b> ${b.date}
        </div>
    `).join('') : '<p>No items found.</p>';

    const notifications = getData(STORAGE_KEYS.notifications).filter(n => n.memberId === member.id);
    const billNotifications = document.getElementById('billNotifications');
    billNotifications.innerHTML = notifications.length ? notifications.map(n => `
        <div class="notification-item" style="margin-bottom:10px;">
            ${n.message}<br/>
            <small><i>Date: ${n.date}</i></small>
        </div>
    `).join('') : '<p>No items found.</p>';

    // Show assigned package plan
    const assignedPackages = getData(STORAGE_KEYS.packages);
    const plan = assignedPackages.find(p => p.memberId === member.id);
    const planContainer = document.getElementById('memberPlan');
    if (!plan) {
        planContainer.innerHTML = '<p><b>Your Plan:</b> No plan assigned.</p>';
    } else {
        const packageDetails = {
            "Basic": ["Smart Workout Plan", "At Home Workout"],
            "Pro": ["Pro Workout Plan", "At Home Workout", "Personal Training"],
            "Premium": [
                "Premium Workout Plan",
                "Personal Training",
                "At Home Workout",
                "Immunity Booster workouts",
                "Yoga Classes"
            ]
        };
        const benefits = packageDetails[plan.packageType] || [];
        planContainer.innerHTML = `
            <p><b>Package Type:</b> ${plan.packageType}</p>
            <p><b>Assigned On:</b> ${new Date(plan.assignedAt).toLocaleDateString()}</p>
            ${benefits.length ? `<ul>${benefits.map(b => `<li>${b}</li>`).join('')}</ul>` : ''}
        `;
    }
}

// --- User module ---
function initUser() {
    const searchInput = document.getElementById('searchInput');
    searchInput.value = '';
    const resultsDiv = document.getElementById('searchResults');
    resultsDiv.innerHTML = '<p>Enter search terms to find members.</p>';

    searchInput.oninput = function () {
        const q = this.value.trim().toLowerCase();
        if (!q) {
            resultsDiv.innerHTML = '<p>Enter search terms to find members.</p>';
            return;
        }
        const members = getData(STORAGE_KEYS.members);
        const filtered = members.filter(m =>
            m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)
        );
        renderList('searchResults', filtered, m => `
            <div class="search-item">
                <b>${m.name}</b><br/>
                <small>${m.email}</small>
            </div>
        `);
    };
}

// DOM ready
document.addEventListener('DOMContentLoaded', () => {
    loadDemoData();

    const loginForm = document.getElementById('loginForm');
    const logoutBtn = document.getElementById('logoutBtn');
    const homeBtn = document.getElementById('homeBtn');

    loginForm.addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const role = document.getElementById('role').value;

        if (login(email, password, role)) {
            sessionStorage.setItem('currentUser', email);
            sessionStorage.setItem('currentRole', role);
            document.getElementById('welcomeMsg').textContent = `Welcome, ${role.toUpperCase()} (${email})`;
            showModule(`${role}-module`);
            if (role === "admin") initAdmin();
            else if (role === "member") initMember();
            else initUser();
        } else {
            alert('Invalid credentials! Please check email, password, and role.');
        }
    });

    logoutBtn.addEventListener('click', () => {
        sessionStorage.clear();
        hideAllModules();
        document.getElementById('welcomeMsg').textContent = '';
        loginForm.reset();
    });

    homeBtn.addEventListener('click', () => {
        sessionStorage.clear();
        hideAllModules();
        document.getElementById('welcomeMsg').textContent = '';
        loginForm.reset();
        window.scrollTo(0, 0);
    });

    const currentRole = sessionStorage.getItem('currentRole');
    const currentUser = sessionStorage.getItem('currentUser');
    if (currentRole && currentUser) {
        document.getElementById('welcomeMsg').textContent = `Welcome, ${currentRole.toUpperCase()} (${currentUser})`;
        showModule(`${currentRole}-module`);
        if (currentRole === "admin") initAdmin();
        else if (currentRole === "member") initMember();
        else initUser();
    }
});

