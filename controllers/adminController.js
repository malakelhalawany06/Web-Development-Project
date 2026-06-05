// controllers/adminController.js
import { connectToDatabase } from '../config/db.js';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcrypt'; // make sure bcrypt is installed

// Helper: Get user growth data for last N days
async function getUserGrowthData(days) {
  const db = await connectToDatabase();
  const labels = [];
  const data = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const pipeline = [
    { $match: { createdAt: { $gte: startDate } } },
    { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
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

// GET /admin/dashboard
export const getAdminDashboard = async (req, res) => {
  try {
    const db = await connectToDatabase();
    const totalStudents = await db.collection('students').countDocuments();
    const activeToday = await db.collection('students').countDocuments({ lastActive: { $gte: new Date(Date.now() - 24*60*60*1000) } });
    // Placeholder values – replace with real data if you have courses collection
    const totalCourses = 64;
    const completionRate = 87;
    const assignmentsToday = 3405;
    const avgScore = 82.4;
    const pendingGrading = 840;

    res.render('admin-dashboard', {
      user: res.locals.user,
      userRole: req.session.userRole,
      activePage: 'dashboard',
      stats: { totalStudents, activeToday, totalCourses, completionRate, assignmentsToday, avgScore, pendingGrading }
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Dashboard error');
  }
};

// GET /admin/analytics
export const getAnalytics = async (req, res) => {
  try {
    const db = await connectToDatabase();
    const totalStudents = await db.collection('students').countDocuments();
    const totalInstructors = await db.collection('instructors').countDocuments();
    const totalUsers = totalStudents + totalInstructors;
    const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
    const activeStudents = await db.collection('students').countDocuments({ lastActive: { $gte: fiveMinsAgo } });
    const activeInstructors = await db.collection('instructors').countDocuments({ lastActive: { $gte: fiveMinsAgo } });
    const activeUsers = activeStudents + activeInstructors;

    const chartData = await getUserGrowthData(7); // default 7 days

    // Recent activities (you can extend with a real activities collection)
    const recentActivities = [
      { type: 'student', text: 'Devin Kumar joined LoomHub', time: '2 hours ago' },
      { type: 'instructor', text: 'Prof. Alan Turing uploaded new materials', time: '5 hours ago' }
    ];

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

// API: GET /api/admin/analytics/growth?period=7|30|90
export const getGrowthDataAPI = async (req, res) => {
  const days = parseInt(req.query.period) || 7;
  const data = await getUserGrowthData(days);
  res.json(data);
};

// GET /admin/users
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

// POST /admin/users/status
export const updateUserStatus = async (req, res) => {
  try {
    const { id, collection, status } = req.body;
    if (!['active', 'suspended', 'banned'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
    const db = await connectToDatabase();
    await db.collection(collection).updateOne({ _id: new ObjectId(id) }, { $set: { status } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /admin/users/delete
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

// POST /admin/users/reset-password
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

// POST /admin/users/force-reset
export const forceReset = async (req, res) => {
  try {
    const { id, collection } = req.body;
    const db = await connectToDatabase();
    await db.collection(collection).updateOne({ _id: new ObjectId(id) }, { $set: { forcePasswordReset: true } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /admin/users/logout-all
export const logoutAllDevices = async (req, res) => {
  try {
    const { userId } = req.body;
    const db = await connectToDatabase();
    // Assumes you are using a sessions collection (e.g., with express-mongo-session)
    await db.collection('sessions').deleteMany({ 'session.userId': userId });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /admin/users/send-warning
export const sendWarning = async (req, res) => {
  try {
    const { id, collection, message } = req.body;
    const db = await connectToDatabase();
    // Store warning in a separate collection
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

// POST /admin/users/restrict
export const restrictUser = async (req, res) => {
  try {
    const { id, collection, restrict } = req.body; // restrict = true/false
    const db = await connectToDatabase();
    await db.collection(collection).updateOne({ _id: new ObjectId(id) }, { $set: { isRestricted: restrict } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};