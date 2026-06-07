// controllers/adminController.js
import { connectToDatabase } from '../config/db.js';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';

async function getUserGrowthData(days) {
  const db = await connectToDatabase();
  const labels = [];
  const data = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const pipeline = [
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ];

  const studentGrowth = await db.collection('students').aggregate(pipeline).toArray();
  const instructorGrowth = await db.collection('instructors').aggregate(pipeline).toArray();
  const adminGrowth = await db.collection('admins').aggregate(pipeline).toArray();

  const merged = new Map();
  [...studentGrowth, ...instructorGrowth, ...adminGrowth].forEach(item => {
    merged.set(item._id, (merged.get(item._id) || 0) + item.count);
  });

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    labels.push(dateStr);
    data.push(merged.get(dateStr) || 0);
  }

  return { labels, data };
}

// ==================== PAGE CONTROLLERS ====================

export const getAdminDashboard = async (req, res) => {
  try {
    const db = await connectToDatabase();

    const totalStudents = await db.collection('students').countDocuments();
    const activeToday = await db.collection('students').countDocuments({
      lastActive: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });
    const totalCourses = 64;
    const completionRate = 87;
    const assignmentsToday = 3405;
    const avgScore = 82.4;
    const pendingGrading = 840;

    res.render('admin-dashboard', {
      user: res.locals.user,
      userRole: req.session.userRole,
      activePage: 'dashboard',
      stats: {
        totalStudents,
        activeToday,
        totalCourses,
        completionRate,
        assignmentsToday,
        avgScore,
        pendingGrading
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

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const activeUsers = await db.collection('students').countDocuments({
      lastActive: { $gte: fiveMinutesAgo }
    });

    // Recent activity feed: last 10 registrations across students & instructors
    const recentStudents = await db.collection('students')
      .find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    const recentInstructors = await db.collection('instructors')
      .find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

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
    ]
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 10);

    const chartData = await getUserGrowthData(7);

    res.render('analytics', {
      user: res.locals.user,
      userRole: req.session.userRole,
      activePage: 'analytics',
      totalUsers,
      totalStudents,
      totalInstructors,
      activeUsers,
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
      ...students.map(u => ({ ...u, role: 'student', collection: 'students' })),
      ...instructors.map(u => ({ ...u, role: 'instructor', collection: 'instructors' })),
      ...admins.map(u => ({ ...u, role: 'admin', collection: 'admins' }))
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
    const db = await connectToDatabase();
    await db.collection('warnings').insertOne({
      userId: new ObjectId(id),
      userCollection: collection,
      message,
      createdAt: new Date()
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
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