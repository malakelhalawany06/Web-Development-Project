(function () {
    const STORAGE_KEY = 'app_users';
    const CURRENT_USER_KEY = 'app_current_user';

    // =========================
    // LOAD USERS
    // =========================
    function loadUsersFromStorage() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error("Error parsing users:", e);
                return [];
            }
        }
        return [];
    }

    // =========================
    // SAVE USERS
    // =========================
    function saveUsersToStorage(users) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    }

    // =========================
    // USER MANAGER
    // =========================
    window.UserManager = {

        // GET ALL USERS
        getAllUsers: function () {
            return loadUsersFromStorage();
        },

        // GET ONE USER
        getUser: function (username) {
            return loadUsersFromStorage().find(u => u.username === username) || null;
        },

        // ADD USER
        addUser: function (userData) {
            const users = loadUsersFromStorage();

            if (users.find(u => u.username === userData.username)) return false;
            if (users.find(u => u.email === userData.email)) return false;

            users.push(userData);
            saveUsersToStorage(users);
            return true;
        },

        // UPDATE USER
        updateUser: function (username, updatedData) {
            const users = loadUsersFromStorage();
            const index = users.findIndex(u => u.username === username);

            if (index === -1) return false;

            users[index] = { ...users[index], ...updatedData };
            saveUsersToStorage(users);
            return true;
        },

        // DELETE USER
        deleteUser: function (username) {
            let users = loadUsersFromStorage();
            const filtered = users.filter(u => u.username !== username);

            if (filtered.length === users.length) return false;

            saveUsersToStorage(filtered);
            return true;
        },

        // LOGIN
        authenticate: function (username, password) {
            const user = this.getUser(username);

            if (user && user.password === password) {
                localStorage.setItem(CURRENT_USER_KEY, username);
                return user;
            }
            return null;
        },

        // CURRENT USER
        getCurrentUser: function () {
            const username = localStorage.getItem(CURRENT_USER_KEY);
            if (!username) return null;
            return this.getUser(username);
        },

        logout: function () {
            localStorage.removeItem(CURRENT_USER_KEY);
        },

        // ROLE HELPERS
        isAdmin: u => u?.role === "admin",
        isInstructor: u => u?.role === "instructor",
        isStudent: u => u?.role === "student",

        // =========================
        // DEMO USERS (FIXED + COMPLETE)
        // =========================
        loadDemoUsers: function () {
            const users = loadUsersFromStorage();

            if (users.length > 0) return; // prevent duplication

            // ===== ADMINS (2) =====
            this.addUser({
                username: 'admin_loom',
                firstName: 'Admin',
                lastName: 'One',
                university: 'MIU',
                major: 'System Admin',
                academicYear: '',
                email: 'admin1@loomhub.com',
                password: 'admin123',
                role: 'admin'
            });

            this.addUser({
                username: 'admin_root',
                firstName: 'Admin',
                lastName: 'Root',
                university: 'MIU',
                major: 'System Admin',
                academicYear: '',
                email: 'admin2@loomhub.com',
                password: 'admin456',
                role: 'admin'
            });

            // ===== INSTRUCTORS (2) =====
            this.addUser({
                username: 'dr_hassan',
                firstName: 'Hassan',
                lastName: 'Mahmoud',
                university: 'MIU',
                major: 'Computer Science',
                academicYear: '',
                email: 'hassan@loomhub.com',
                password: 'teach123',
                role: 'instructor'
            });

            this.addUser({
                username: 'dr_nadia',
                firstName: 'Nadia',
                lastName: 'Youssef',
                university: 'AUC',
                major: 'Networks',
                academicYear: '',
                email: 'nadia@loomhub.com',
                password: 'nadia999',
                role: 'instructor'
            });

            // ===== STUDENTS (5) =====
            this.addUser({
                username: 'ahmed_khalid',
                firstName: 'Ahmed',
                lastName: 'Khalid',
                university: 'MIU',
                major: 'Computer Science',
                academicYear: '3',
                email: 'ahmed@loomhub.com',
                password: 'pass123',
                role: 'student'
            });

            this.addUser({
                username: 'sara_ali',
                firstName: 'Sara',
                lastName: 'Ali',
                university: 'AUC',
                major: 'Business Informatics',
                academicYear: '2',
                email: 'sara@loomhub.com',
                password: 'sara456',
                role: 'student'
            });

            this.addUser({
                username: 'ali_ashraf',
                firstName: 'Ali',
                lastName: 'Ashraf',
                university: 'BUE',
                major: 'Applied Arts',
                academicYear: '4',
                email: 'ali@loomhub.com',
                password: 'ali9090',
                role: 'student'
            });

            this.addUser({
                username: 'ebrahim_ahmed',
                firstName: 'Ebrahim',
                lastName: 'Ahmed',
                university: 'GUC',
                major: 'Law',
                academicYear: '2',
                email: 'ebrahim@loomhub.com',
                password: 'ebrahim456',
                role: 'student'
            });

            this.addUser({
                username: 'marwan_osama',
                firstName: 'Marwan',
                lastName: 'Osama',
                university: 'AUC',
                major: 'Dentistry',
                academicYear: '1',
                email: 'marwan@loomhub.com',
                password: 'marwan7878',
                role: 'student'
            });

            console.log("✅ Demo users loaded successfully");
        }
    };

    // =========================
    // INIT
    // =========================
    document.addEventListener("DOMContentLoaded", function () {
        UserManager.loadDemoUsers();
        console.log("Users loaded:", UserManager.getAllUsers());
    });

    // ===== USER MANAGER =====
    window.UserManager = {

        getAllUsers: function () {
            return loadUsersFromStorage();
        },

        getUser: function (username) {
            return loadUsersFromStorage().find(u => u.username === username) || null;
        },

        getUserByEmail: function (email) {
            return loadUsersFromStorage().find(u => u.email === email) || null;
        },

        addUser: function (userData) {
            const users = loadUsersFromStorage();

            if (users.find(u => u.username === userData.username)) return false;
            if (users.find(u => u.email === userData.email)) return false;

            users.push(userData);
            saveUsersToStorage(users);
            return true;
        },

        authenticate: function (username, password) {
            const user = this.getUser(username);

            if (user && user.password === password) {
                localStorage.setItem(CURRENT_USER_KEY, username);
                return user;
            }
            return null;
        },

        getCurrentUser: function () {
            const username = localStorage.getItem(CURRENT_USER_KEY);
            if (!username) return null;
            return this.getUser(username);
        },

        logout: function () {
            localStorage.removeItem(CURRENT_USER_KEY);
        },

        isAdmin: u => u?.role === 'admin',
        isInstructor: u => u?.role === 'instructor',
        isStudent: u => u?.role === 'student'
    };

    // ===== SAFE AUTO INIT (IMPORTANT FIX) =====
    initDemoUsers();

})();