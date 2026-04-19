(function () {
    const STORAGE_KEY = 'app_users';
    const CURRENT_USER_KEY = 'app_current_user';

    // ===== LOAD =====
    function loadUsersFromStorage() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return [];

        try {
            return JSON.parse(stored);
        } catch (e) {
            console.error("User data corrupted:", e);
            return [];
        }
    }

    // ===== SAVE =====
    function saveUsersToStorage(users) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    }

    // ===== INIT DEFAULT USERS =====
    function initDemoUsers() {
        const users = loadUsersFromStorage();

        if (users.length > 0) return; // already exists → STOP

        const demoUsers = [
            //admin
            {
                username: 'admin_loom',
                firstName: 'Admin',
                lastName: 'LoomHub',
                university: 'MIU',
                major: 'System Admin',
                academicYear: '',
                email: 'admin@loomhub.com',
                password: 'admin123',
                role: 'admin'
            },
            // student 
            {
                username: 'ahmed_khalid',
                firstName: 'Ahmed',
                lastName: 'Khalid',
                university: 'MIU',
                major: 'Computer Science',
                academicYear: '3',
                email: 'ahmed@loomhub.com',
                password: 'pass123',
                role: 'student'
            },
            {
                username: 'sara_ali',
                firstName: 'Sara',
                lastName: 'Ali',
                university: 'AUC',
                major: 'Business Informatics',
                academicYear: '2',
                email: 'sara@loomhub.com',
                password: 'sara456',
                role: 'student'
            },
            {
                username: 'osama_salah',
                firstName: 'Osama',
                lastName: 'Salah',
                university: 'AAST',
                major: 'dentistry',
                academicYear: '1',
                email: 'osama@loomhub.com',
                password: 'osama44',
                role: 'student'
            },
            {
                username: 'khaled_mohamed',
                firstName: 'Khaled',
                lastName: 'Mohamed',
                university: 'BUE',
                major: 'Applied Arts',
                academicYear: '2',
                email: 'khaled@loomhub.com',
                password: 'khaled123',
                role: 'student'
            },
            {
                username: 'marwan_alaa',
                firstName: 'Marwan',
                lastName: 'Alaa',
                university: 'GUC',
                major: 'Law',
                academicYear: '4',
                email: 'marwan@loomhub.com',
                password: 'marwan77',
                role: 'student'
            },
            // instructor 
            {
                username: 'dr_hassan',
                firstName: 'Hassan',
                lastName: 'Mahmoud',
                university: 'MIU',
                major: 'Computer Science',
                academicYear: '',
                email: 'hassan@loomhub.com',
                password: 'teach123',
                role: 'instructor'
            }
        ];

        saveUsersToStorage(demoUsers);
        console.log("Demo users initialized");
    }

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