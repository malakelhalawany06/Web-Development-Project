(function () {
    const STORAGE_KEY = 'app_users';
    const CURRENT_USER_KEY = 'app_current_user';

    // ===== LOAD USERS =====
    function loadUsersFromStorage() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error('Error parsing users:', e);
                return [];
            }
        }
        return [];
    }

    // ===== SAVE USERS =====
    function saveUsersToStorage(users) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    }

    // ===== MAIN OBJECT =====
    window.UserManager = {

        // ===== GET USERS =====
        getAllUsers: function () {
            return loadUsersFromStorage();
        },

        getUser: function (username) {
            const users = loadUsersFromStorage();
            return users.find(user => user.username === username) || null;
        },

        // ===== ADD USER =====
        addUser: function (userData) {
            const users = loadUsersFromStorage();

            const {
                username,
                firstName,
                lastName,
                university,
                major,
                academicYear,
                email,
                password,
                role
            } = userData;

            // Validation
            if (!username || !firstName || !lastName || !email || !password) {
                console.error('Missing required fields');
                return false;
            }

            if (users.find(u => u.username === username)) {
                console.error('Username already exists');
                return false;
            }

            if (users.find(u => u.email === email)) {
                console.error('Email already exists');
                return false;
            }

            const newUser = {
                username: username,
                firstName: firstName,
                lastName: lastName,
                university: university || '',
                major: major || '',
                academicYear: academicYear || '',
                email: email,
                password: password,
                role: role || 'student' // default role
            };

            users.push(newUser);
            saveUsersToStorage(users);

            return true;
        },

        // ===== UPDATE USER =====
        updateUser: function (username, updatedData) {
            const users = loadUsersFromStorage();
            const index = users.findIndex(u => u.username === username);

            if (index === -1) return false;

            users[index] = {
                ...users[index],
                ...updatedData,
                username: username 
            };

            saveUsersToStorage(users);
            return true;
        },

        // ===== DELETE USER =====
        deleteUser: function (username) {
            let users = loadUsersFromStorage();
            const newUsers = users.filter(u => u.username !== username);

            if (newUsers.length === users.length) return false;

            saveUsersToStorage(newUsers);
            return true;
        },

        // ===== Validation =====
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

        // ===== ROLE HELPERS =====
        isAdmin: function (user) {
            return user && user.role === 'admin';
        },

        isInstructor: function (user) {
            return user && user.role === 'instructor';
        },

        isStudent: function (user) {
            return user && user.role === 'student';
        },

        // ===== USERS =====
        loadDemoUsers: function () {
            const users = loadUsersFromStorage();

            if (users.length === 0) {

                // ADMIN
                this.addUser({
                    username: 'admin_loom',
                    firstName: 'Admin',
                    lastName: 'LoomHub',
                    university: 'MIU',
                    major: 'System Admin',
                    academicYear: '',
                    email: 'admin@loomhub.com',
                    password: 'admin123',
                    role: 'admin'
                });

                // STUDENTS
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
                    firstName: 'ALi',
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

                // INSTRUCTORS
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

                console.log('Demo users created (admin, students, instructors)');
            }
        }
    };

    
    document.addEventListener('DOMContentLoaded', function () {
        UserManager.loadDemoUsers();
        console.log('UserManager Ready:', UserManager.getAllUsers());
    });

})();