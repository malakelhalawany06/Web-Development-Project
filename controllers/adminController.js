import { connectToDatabase } from '../config/db.js';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';
import { sendWarningEmail } from '../utils/emailService.js';
async function getUserGrowthData(days) {
    try {
        const db = await connectToDatabase();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        startDate.setHours(0, 0, 0, 0);

        const pipeline = [
            { 
                $match: { 
                    $or: [
                        { createdAt: { $gte: startDate } },
                        { _id: { $gte: ObjectId.createFromTime(startDate.getTime() / 1000) } }
                    ]
                } 
            },
            {
                $group: {
                    _id: { 
                        $dateToString: { 
                            format: "%Y-%m-%d", 
                            date: { $ifNull: ["$createdAt", { $toDate: "$_id" }] } 
                        } 
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ];

        const studentGrowth = await db.collection('students').aggregate(pipeline).toArray();
        const instructorGrowth = await db.collection('instructors').aggregate(pipeline).toArray();

        const merged = new Map();
        const totalGrowth = [...studentGrowth, ...instructorGrowth];
        
        totalGrowth.forEach(item => {
            if (item && item._id) {
                merged.set(item._id, (merged.get(item._id) || 0) + item.count);
            }
        });

        const labels = [];
        const data = [];
        for (let i = 0; i < days; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            labels.push(dateStr);
            data.push(merged.get(dateStr) || 0);
        }

        return { labels, data };
    } catch (error) {
        console.error("Error in getUserGrowthData aggregation:", error);
        return { labels: [], data: [] };
    }
}

// ==================== PAGE CONTROLLERS ====================

export const getAdminDashboard = async (req, res) => {
    try {
        const db = await connectToDatabase();

        // Start of current month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const [
            totalStudents,
            totalInstructors,
            newStudentsThisMonth,
            newInstructorsThisMonth,
            activeToday
        ] = await Promise.all([
            db.collection('students').countDocuments(),
            db.collection('instructors').countDocuments(),
            db.collection('students').countDocuments({
                $or: [
                    { createdAt: { $gte: startOfMonth } },
                    { _id: { $gte: ObjectId.createFromTime(startOfMonth.getTime() / 1000) } }
                ]
            }),
            db.collection('instructors').countDocuments({
                $or: [
                    { createdAt: { $gte: startOfMonth } },
                    { _id: { $gte: ObjectId.createFromTime(startOfMonth.getTime() / 1000) } }
                ]
            }),
            db.collection('students').countDocuments({
                lastActive: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
            })
        ]);

        res.render('admin-dashboard', {
            user: res.locals.user,
            userRole: req.session.userRole,
            activePage: 'dashboard',
            stats: {
                totalStudents,
                totalInstructors,
                activeToday,
                newStudentsThisMonth,
                newInstructorsThisMonth,
                totalCourses: 0,
                assignmentsToday: 0,
                avgScore: 0,
                pendingGrading: 0
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Dashboard error');
    }
};

export const getAnalytics = async (req, res) => {
    try {
        const db = await connectToDatabase();

        const [totalStudents, totalInstructors] = await Promise.all([
            db.collection('students').countDocuments(),
            db.collection('instructors').countDocuments()
        ]);

        const totalUsers = totalStudents + totalInstructors;

        const pendingAccounts = await db.collection('students').countDocuments({
            status: 'pending'
        });

        const recentStudents = await db.collection('students')
            .find({}).sort({ createdAt: -1 }).limit(5).toArray();
        const recentInstructors = await db.collection('instructors')
            .find({}).sort({ createdAt: -1 }).limit(5).toArray();

        const recentActivities = [
            ...recentStudents.map(u => ({
                type: 'student',
                text: `${u.firstName || u.name || 'A student'} joined as a student`,
                time: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Recently'
            })),
            ...recentInstructors.map(u => ({
                type: 'instructor',
                text: `${u.firstName || u.name || 'An instructor'} joined as an instructor`,
                time: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Recently'
            }))
        ].slice(0, 10);

        const chartData = await getUserGrowthData(7);

        res.render('analytics', {
            user: res.locals.user,
            userRole: req.session.userRole,
            activePage: 'analytics',
            totalUsers,
            totalStudents,
            totalInstructors,
            pendingAccounts,
            chartData,
            recentActivities
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Analytics error');
    }
};

export const getUserManagement = async (req, res) => {
    try {
        const db = await connectToDatabase();

        const students = await db.collection('students').find({}).toArray();
        const instructors = await db.collection('instructors').find({}).toArray();
        const admins = await db.collection('admins').find({}).toArray();

        const users = [
            ...students.map(u => ({ 
                ...u, 
                email: u.mail || u.email || 'N/A',
                firstName: u.name || u.firstName || 'User',
                role: 'student', 
                collection: 'students' 
            })),
            ...instructors.map(u => ({ 
                ...u, 
                email: u.mail || u.email || 'N/A',
                firstName: u.name || u.firstName || 'User',
                role: 'instructor', 
                collection: 'instructors' 
            })),
            ...admins.map(u => ({ 
                ...u, 
                email: u.mail || u.email || 'N/A',
                firstName: u.name || u.firstName || 'User',
                role: 'admin', 
                collection: 'admins' 
            }))
        ];

        res.render('admin-users', {
            user: res.locals.user,
            userRole: req.session.userRole,
            activePage: 'users',
            users
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('User management error');
    }
};

// ==================== API CONTROLLERS ====================

export const editUser = async (req, res) => {
    try {
        const { id, collection, firstName, lastName, email } = req.body;
        
        if (!collection) return res.status(400).json({ success: false, error: 'Collection required' });

        const db = await connectToDatabase();
        const fullName = `${firstName} ${lastName}`.trim();

        const result = await db.collection(collection).updateOne(
            { _id: new ObjectId(id) },
            { $set: { name: fullName, mail: email } } 
        );

        if (result.matchedCount === 0) {
            return res.json({ success: false, error: 'User not found in database' });
        }

        res.json({ success: true });
    } catch (err) {
        console.error('Edit error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

export const updateUserStatus = async (req, res) => {
    try {
        const { id, collection, status } = req.body;
        if (!['active', 'suspended', 'banned'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }
        const db = await connectToDatabase();
        await db.collection(collection).updateOne(
            { _id: new ObjectId(id) },
            { $set: { status } }
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id, collection } = req.body;
        const db = await connectToDatabase();
        await db.collection(collection).deleteOne({ _id: new ObjectId(id) });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { id, collection } = req.body;
        const tempPassword = Math.random().toString(36).slice(-8);
        const hashed = await bcrypt.hash(tempPassword, 10);
        const db = await connectToDatabase();
        await db.collection(collection).updateOne(
            { _id: new ObjectId(id) },
            { $set: { hashed_password: hashed, forcePasswordReset: true } }
        );
        res.json({ success: true, tempPassword });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const forceReset = async (req, res) => {
    try {
        const { id, collection } = req.body;
        const db = await connectToDatabase();
        await db.collection(collection).updateOne(
            { _id: new ObjectId(id) },
            { $set: { forcePasswordReset: true } }
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const logoutAllDevices = async (req, res) => {
    try {
        const { userId } = req.body;
        const db = await connectToDatabase();
        await db.collection('sessions').deleteMany({ 'session.userId': userId });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const sendWarning = async (req, res) => {
    try {
        const { id, collection, message } = req.body;
        
        if (!id || !collection || !message) {
            return res.status(400).json({ success: false, error: 'Missing required parameters' });
        }

        const db = await connectToDatabase();
        
        // Fetch user data to extract target name and email mapping coordinates
        const user = await db.collection(collection).findOne({ _id: new ObjectId(id) });
        if (!user) {
            return res.status(404).json({ success: false, error: 'Target user record not found' });
        }

        const userEmail = user.mail || user.email;
        const userName = user.name || user.firstName || 'User';

        if (!userEmail || userEmail === 'N/A') {
            return res.status(400).json({ success: false, error: 'User does not have a valid registered email address' });
        }

        // Dispatch email wrapper
        const emailResult = await sendWarningEmail(userEmail, userName, message);

        // 2. Optimized failure evaluation logic line
        if (!emailResult || !emailResult.success) {
            return res.status(500).json({ 
                success: false, 
                error: emailResult?.error || 'Failed to send warning email out via SMTP handler' 
            });
        }

        // 3. Document historical ledger entry to the warnings database collection
        await db.collection('warnings').insertOne({
            userId: new ObjectId(id),
            userCollection: collection,
            message,
            createdAt: new Date()
        });

        res.json({ success: true });
    } catch (err) {
        console.error("Warning notification handler crash logic:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};

export const restrictUser = async (req, res) => {
    try {
        const { id, collection, restrict } = req.body;
        const db = await connectToDatabase();
        await db.collection(collection).updateOne(
            { _id: new ObjectId(id) },
            { $set: { isRestricted: restrict } }
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getGrowthDataAPI = async (req, res) => {
    try {
        const days = parseInt(req.query.period) || 7;
        const data = await getUserGrowthData(days);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};