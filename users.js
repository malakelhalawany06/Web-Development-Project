// userManager.js – Complete user storage system with admin support

(function() {
    const STORAGE_KEY = 'app_users';
    const CURRENT_USER_KEY = 'app_current_user';

    function loadUsersFromStorage() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch(e) {
                console.error('Failed to parse users from localStorage', e);
                return [];
            }
        }
        return [];
    }

    function saveUsersToStorage(users) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    }

    window.UserManager = {
        getAllUsers: function() {
            return loadUsersFromStorage();
        },

        getUser: function(username) {
            const users = loadUsersFromStorage();
            return users.find(user => user.username === username) || null;
        },

        addUser: function(userData) {
            const users = loadUsersFromStorage();
            const { username, firstName, lastName, university, major, academicYear, email, password, isAdmin } = userData;

            if (!username || !firstName || !lastName || !email || !password) {
                console.error('Missing required fields');
                return false;
            }
            if (users.find(u => u.username === username)) {
                console.error('Username already exists');
                return false;
            }
            if (users.find(u => u.email === email)) {
                console.error('Email already registered');
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
                isAdmin: isAdmin || false
            };
            users.push(newUser);
            saveUsersToStorage(users);
            return true;
        },

        updateUser: function(username, updatedData) {
            const users = loadUsersFromStorage();
            const index = users.findIndex(u => u.username === username);
            if (index === -1) return false;
            users[index] = { ...users[index], ...updatedData, username: username };
            saveUsersToStorage(users);
            return true;
        },

        deleteUser: function(username) {
            let users = loadUsersFromStorage();
            const newUsers = users.filter(u => u.username !== username);
            if (newUsers.length === users.length) return false;
            saveUsersToStorage(newUsers);
            return true;
        },

        authenticate: function(username, password) {
            const user = this.getUser(username);
            if (user && user.password === password) {
                localStorage.setItem(CURRENT_USER_KEY, username);
                return user;
            }
            return null;
        },

        getCurrentUser: function() {
            const currentUsername = localStorage.getItem(CURRENT_USER_KEY);
            if (!currentUsername) return null;
            return this.getUser(currentUsername);
        },

        logout: function() {
            localStorage.removeItem(CURRENT_USER_KEY);
        },

        // Preload 3 users: 2 normal, 1 admin
        loadDemoUsers: function() {
            const users = loadUsersFromStorage();
            if (users.length === 0) {
                // Admin user
                this.addUser({
                    username: 'admin_loom',
                    firstName: 'Admin',
                    lastName: 'LoomHub',
                    university: 'MIU',
                    major: 'System Admin',
                    academicYear: '5',
                    email: 'admin@loomhub.com',
                    password: 'admin123',
                    isAdmin: true
                });
                // Normal user 1
                this.addUser({
                    username: 'ahmed_khalid',
                    firstName: 'Ahmed',
                    lastName: 'Khalid',
                    university: 'MIU',
                    major: 'Computer Science',
                    academicYear: '3',
                    email: 'ahmed@loomhub.com',
                    password: 'pass123',
                    isAdmin: false
                });
                // Normal user 2
                this.addUser({
                    username: 'sara_ali',
                    firstName: 'Sara',
                    lastName: 'Ali',
                    university: 'AUC',
                    major: 'Business Informatics',
                    academicYear: '2',
                    email: 'sara@loomhub.com',
                    password: 'sara456',
                    isAdmin: false
                });
                console.log('Demo users loaded: 1 admin, 2 normal users');
            }
        }
    };

    document.addEventListener('DOMContentLoaded', function() {
        UserManager.loadDemoUsers();
        console.log('UserManager ready. Users:', UserManager.getAllUsers());
    });
})();