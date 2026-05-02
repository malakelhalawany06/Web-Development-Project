(function () {
    const STORAGE_KEY = 'app_users';
    const CURRENT_USER_KEY = 'app_current_user';

    function loadUsersFromStorage() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                return [];
            }
        }
        return [];
    }

    function saveUsersToStorage(users) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    }

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

        authenticate: function (email, password) {
            const user = this.getUserByEmail(email);
            if (user && user.password === password) {
                localStorage.setItem(CURRENT_USER_KEY, user.username);
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

        isAdmin: function(user) {
            return user && user.role === 'admin';
        },

        isInstructor: function(user) {
            return user && user.role === 'instructor';
        },

        isStudent: function(user) {
            return user && user.role === 'student';
        },

        //study groups helper functions
        getUserStudyGroups: function(username) {
            const key = `user_${username}_studyGroups`;
            const stored = localStorage.getItem(key);
            if (stored && JSON.parse(stored).length > 0) {
                return JSON.parse(stored);
            }
            return this.getDefaultStudyGroups(username);
        },

        saveUserStudyGroups: function(username, groups) {
            const key = `user_${username}_studyGroups`;
            localStorage.setItem(key, JSON.stringify(groups));
        },

        getDefaultStudyGroups: function(username) {
            const user = this.getUser(username);
            const major = user?.major || 'Computer Science';
            
            const defaultGroups = {
                'Computer Science': [
                    { id: 1, name: 'CS Algorithm Group', course: 'Data Structures & Algorithms', members: 8, resources: 12, messages: 45, status: 'joined', category: 'cs', description: 'Weekly algorithm practice and exam preparation.' },
                    { id: 2, name: 'Web Dev Squad', course: 'Web Development', members: 10, resources: 18, messages: 56, status: 'available', category: 'cs', description: 'HTML/CSS, JavaScript frameworks, and full-stack projects.' },
                    { id: 3, name: 'AI Research Club', course: 'Artificial Intelligence', members: 15, resources: 28, messages: 89, status: 'available', category: 'cs', description: 'Machine learning algorithms and research paper discussions.' }
                ],
                'Business Informatics': [
                    { id: 1, name: 'Business Analytics Group', course: 'Data Analysis', members: 6, resources: 10, messages: 32, status: 'joined', category: 'business', description: 'Learning data analysis techniques and tools.' },
                    { id: 2, name: 'Marketing Study Circle', course: 'Digital Marketing', members: 8, resources: 14, messages: 41, status: 'available', category: 'business', description: 'Digital marketing strategies and case studies.' }
                ],
                'Applied Arts': [
                    { id: 1, name: 'Design Studio', course: 'Graphic Design', members: 7, resources: 15, messages: 28, status: 'joined', category: 'arts', description: 'Graphic design principles and software practice.' },
                    { id: 2, name: 'UI/UX Workshop', course: 'User Experience', members: 9, resources: 12, messages: 35, status: 'available', category: 'arts', description: 'User interface and experience design.' }
                ],
                'Law': [
                    { id: 1, name: 'Legal Studies Group', course: 'Constitutional Law', members: 11, resources: 22, messages: 63, status: 'joined', category: 'law', description: 'Constitutional law discussions and case studies.' }
                ],
                'Dentistry': [
                    { id: 1, name: 'Anatomy Study Group', course: 'Human Anatomy', members: 14, resources: 25, messages: 78, status: 'joined', category: 'science', description: 'Human anatomy study and exam preparation.' }
                ],
                'Networks': [
                    { id: 1, name: 'Network Security Group', course: 'Network Security', members: 9, resources: 16, messages: 44, status: 'joined', category: 'cs', description: 'Network security concepts and protocols.' }
                ]
            };
            return defaultGroups[major] || defaultGroups['Computer Science'];
        },

        //notes and files helper functions
        getUserNotesFiles: function(username) {
            const key = `user_${username}_notesFiles`;
            const stored = localStorage.getItem(key);
            if (stored && JSON.parse(stored).length > 0) {
                return JSON.parse(stored);
            }
            return this.getDefaultNotesFiles(username);
        },

        saveUserNotesFiles: function(username, files) {
            const key = `user_${username}_notesFiles`;
            localStorage.setItem(key, JSON.stringify(files));
        },

        getDefaultNotesFiles: function(username) {
            const user = this.getUser(username);
            const major = user?.major || 'Computer Science';
            
            const defaultFiles = {
                'Computer Science': [
                    { fileName: 'Binary Trees Lecture Notes.pdf', title: 'Binary Trees Explained', description: 'Complete guide to binary trees and traversal methods.', fileMeta: 'Data Structures • Uploaded by Prof. Smith', fileSize: '2.4 MB', fileIcon: '📘', course: 'ds', date: 'Apr 15, 2025' },
                    { fileName: 'Sorting Algorithms Cheatsheet.docx', title: 'Sorting Algorithms', description: 'Quick reference for bubble sort, merge sort, quicksort.', fileMeta: 'Data Structures • Uploaded by Ahmed K.', fileSize: '1.1 MB', fileIcon: '📄', course: 'ds', date: 'Apr 12, 2025' }
                ],
                'Business Informatics': [
                    { fileName: 'Data Analytics Basics.pdf', title: 'Introduction to Data Analytics', description: 'Fundamentals of data analysis and visualization.', fileMeta: 'Data Analysis • Uploaded by Prof. Johnson', fileSize: '2.1 MB', fileIcon: '📘', course: 'db', date: 'Apr 14, 2025' }
                ],
                'Applied Arts': [
                    { fileName: 'Color Theory Guide.pdf', title: 'Color Theory for Designers', description: 'Understanding color wheels and harmony in design.', fileMeta: 'Graphic Design • Uploaded by Prof. Davis', fileSize: '3.1 MB', fileIcon: '🎨', course: 'arts', date: 'Apr 13, 2025' }
                ],
                'Law': [
                    { fileName: 'Constitutional Law Notes.pdf', title: 'Constitutional Law Overview', description: 'Key amendments and landmark cases.', fileMeta: 'Law • Uploaded by Prof. Roberts', fileSize: '3.5 MB', fileIcon: '⚖️', course: 'law', date: 'Apr 14, 2025' }
                ],
                'Dentistry': [
                    { fileName: 'Human Anatomy Atlas.pdf', title: 'Complete Anatomy Guide', description: 'Detailed diagrams of human anatomy for dental students.', fileMeta: 'Anatomy • Uploaded by Prof. Wilson', fileSize: '8.5 MB', fileIcon: '🦷', course: 'science', date: 'Apr 15, 2025' }
                ],
                'Networks': [
                    { fileName: 'TCP IP Protocol Suite.pdf', title: 'Networking Fundamentals', description: 'Complete guide to TCP/IP and OSI model.', fileMeta: 'Networks • Uploaded by Prof. Chen', fileSize: '4.2 MB', fileIcon: '🌐', course: 'net', date: 'Apr 14, 2025' }
                ]
            };
            return defaultFiles[major] || defaultFiles['Computer Science'];
        },

        //shared materials function 
        shareFileWithUser: function(fromUsername, toUsername, fileData) {
            const key = `user_${toUsername}_sharedFiles`;
            const stored = localStorage.getItem(key);
            let sharedFiles = stored ? JSON.parse(stored) : [];
            sharedFiles.unshift({
                ...fileData,
                sharedBy: fromUsername,
                sharedAt: new Date().toISOString()
            });
            localStorage.setItem(key, JSON.stringify(sharedFiles));
        },

        getSharedFiles: function(username) {
            const key = `user_${username}_sharedFiles`;
            const stored = localStorage.getItem(key);
            return stored ? JSON.parse(stored) : [];
        },

        updateBadges:function(){
            const currentUser=this.getCurrentUser();
            if(!currentUser) return;

            const username=currentUser.username;
            const groups=this.getUserStudyGroups(username);
            const files=this.getUserNotesFiles(username);
            const joinedGroups=groups.filter(q=>groups.status==='joined').length;
            const groupsBadge=document.getElementById('studyGroupsBadge');
            const filesBadge=document.getElementById('notesFilesBadge');
            if(grouupsBadge) groupsBadge.textContent=joinedGroups;
            if(filesBadge) filesBadge.textContent=files.length;
        },

        //users
        loadDemoUsers: function () {
            const users = loadUsersFromStorage();
            if (users.length > 0) return;

            const demoUsers = [
                { username: 'admin_loom', firstName: 'Admin', lastName: 'Loom', university: 'MIU', major: 'System Admin', academicYear: '', email: 'admin@loomhub.com', password: 'admin123', role: 'admin' },
                { username: 'ahmed_khalid', firstName: 'Ahmed', lastName: 'Khalid', university: 'MIU', major: 'Computer Science', academicYear: '3', email: 'ahmed@loomhub.com', password: 'pass123', role: 'student' },
                { username: 'sara_ali', firstName: 'Sara', lastName: 'Ali', university: 'AUC', major: 'Business Informatics', academicYear: '2', email: 'sara@loomhub.com', password: 'sara456', role: 'student' },
                { username: 'ali_ashraf', firstName: 'Ali', lastName: 'Ashraf', university: 'BUE', major: 'Applied Arts', academicYear: '4', email: 'ali@loomhub.com', password: 'ali9090', role: 'student' },
                { username: 'dr_hassan', firstName: 'Hassan', lastName: 'Mahmoud', university: 'MIU', major: 'Computer Science', academicYear: '', email: 'hassan@loomhub.com', password: 'teach123', role: 'instructor' },
                { username: 'dr_nadia', firstName: 'Nadia', lastName: 'Youssef', university: 'AUC', major: 'Networks', academicYear: '', email: 'nadia@loomhub.com', password: 'nadia999', role: 'instructor' }
            ];

            demoUsers.forEach(user => {
                this.addUser(user);
            });
            
            console.log("Demo users loaded. Total users:", this.getAllUsers().length);
        }
    };

    document.addEventListener("DOMContentLoaded", function () {
        UserManager.loadDemoUsers();
    });
})();