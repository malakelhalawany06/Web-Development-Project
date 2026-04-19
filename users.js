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

        //get user-specific study groups
        getUserStudyGroups: function(username){
            const key=`user_${username}_studyGroups`;
            const stored=localStorage.getItem(key);
            if(stored){
                return JSON.parse(stored);
            }
            return this.getDefaultStudyGroups(username);
        },
        //save user-specific study groups
        saveUserStudyGroups: function(username,groups){
            const key=`user_${username}_studyGroups`;
            localStorage.setItem(key,JSON.stringify(groups));
        },
        //get default study groups based on user's major 
        getDefaultStudyGroups: function(username){
            const user=this.getUser(username);
            const major=user?.major||'Computer Science';

            const defaultGroups={'Computer Science': [
            { id: 1, name: 'CS Algorithm Group', course: 'Data Structures & Algorithms', members: 8, resources: 12, messages: 45, status: 'joined', category: 'cs', description: 'Weekly algorithm practice and exam preparation' },
            { id: 2, name: 'Web Dev Squad', course: 'Web Development', members: 10, resources: 18, messages: 56, status: 'available', category: 'cs', description: 'HTML/CSS, JavaScript frameworks, and full-stack projects' },
            { id: 3, name: 'AI Research Club', course: 'Artificial Intelligence', members: 15, resources: 28, messages: 89, status: 'available', category: 'cs', description: 'Machine learning algorithms and research paper discussions' }
        ],
        'Business Informatics': [
            { id: 1, name: 'Business Analytics Group', course: 'Data Analysis', members: 6, resources: 10, messages: 32, status: 'joined', category: 'business', description: 'Learning data analysis techniques and tools' },
            { id: 2, name: 'Marketing Study Circle', course: 'Digital Marketing', members: 8, resources: 14, messages: 41, status: 'available', category: 'business', description: 'Digital marketing strategies and case studies' }
        ],
        'Applied Arts': [
            { id: 1, name: 'Design Studio', course: 'Graphic Design', members: 7, resources: 15, messages: 28, status: 'joined', category: 'arts', description: 'Graphic design principles and software practice' },
            { id: 2, name: 'UI/UX Workshop', course: 'User Experience', members: 9, resources: 12, messages: 35, status: 'available', category: 'arts', description: 'User interface and experience design' }
        ],
        'Law': [
            { id: 1, name: 'Legal Studies Group', course: 'Constitutional Law', members: 11, resources: 22, messages: 63, status: 'joined', category: 'law', description: 'Constitutional law discussions and case studies' }
        ],
        'Dentistry': [
            { id: 1, name: 'Anatomy Study Group', course: 'Human Anatomy', members: 14, resources: 25, messages: 78, status: 'joined', category: 'science', description: 'Human anatomy study and exam preparation' }
        ],
        'Networks': [
            { id: 1, name: 'Network Security Group', course: 'Network Security', members: 9, resources: 16, messages: 44, status: 'joined', category: 'cs', description: 'Network security concepts and protocols' }
        ]};

        return defaultGroups[major] || defaultGroups['Computer Science'];
        },
        //save user-specified notes and file in localStorage

        saveUserNotesFiles:function(username,files){
            const key=`user_${username}_notesFiles`;
            localStorage.setItem(key,JSON.stringify(files));
        },
        //get user-specified notes and files
        getUserNotesFiles:function(username){
            const key=`user_${username}_notesFiles`;
            const stored=localStorage.getItem(key);
            if(stored){
                return JSON.parse(stored);
            }
            return [];
        },
        //Share file with another user
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