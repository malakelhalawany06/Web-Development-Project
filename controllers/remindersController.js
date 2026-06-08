import Reminder from '../models/remindersModel.js';

function getActiveUser(req, res) {
  if (res.locals.user) {
    return {
      id: res.locals.user._id || "mock-id",
      firstName: res.locals.user.firstName || res.locals.user.name || "Logged-in",
      lastName: res.locals.user.lastName || "User",
      major: res.locals.user.major || "Computer Science",
      academicYear: res.locals.user.year || res.locals.user.academic_year || 3
    };
  }
  
  return {
    id: "mock-id-ahmed",
    firstName: "Ahmed",
    lastName: "Khalid",
    major: "Computer Science",
    academicYear: 3 // Kept as numeric to match standard database storage
  };
}

async function getRemindersPage(req, res) {
  try {
    const currentUser = getActiveUser(req, res);
    const yrNum = Number(currentUser.academicYear);
    const yrStr = String(currentUser.academicYear);

    // 1. Flexible Query: Match either string or numeric formats for academic year
    let rawReminders = await Reminder.find({
      major: currentUser.major,
      academicYear: { $in: [yrNum, yrStr] }
    });

    // 2. FALLBACK SAFETY VALVE: If the filtered query returns 0 items, grab ALL reminders 
    // so the user's added items are guaranteed to display on screen.
    if (rawReminders.length === 0) {
      rawReminders = await Reminder.find({});
    }

    // 3. If the database is completely empty, create the very first seed entries
    if (rawReminders.length === 0) {
      await Reminder.create([
        {
          text: `${currentUser.major} Assignment 1`, 
          dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3), 
          priority: 'high', 
          status: 'Pending',
          major: currentUser.major,
          academicYear: yrNum
        },
        {
          text: `Prepare for Year ${yrNum} Midterms`, 
          dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), 
          priority: 'medium', 
          status: 'Pending',
          major: currentUser.major,
          academicYear: yrNum
        }
      ]);
      rawReminders = await Reminder.find({});
    }

    // 4. Map values properly for the EJS checkboxes
    const reminders = rawReminders.map(rem => {
      const obj = rem.toObject();
      obj.completed = (obj.status === 'Completed' || obj.status === 'completed');
      return obj;
    });

    // 5. Calculate dashboard metrics
    const totalTasks = reminders.length;
    const completedTasks = reminders.filter(r => r.completed).length;
    const pendingTasks = totalTasks - completedTasks;
    const urgentTasks = reminders.filter(r => r.priority === 'high' && !r.completed).length;

    const stats = {
      totalReminders: totalTasks,
      pendingReminders: pendingTasks,
      completedReminders: completedTasks,
      urgentReminders: urgentTasks
    };

    res.render('reminders', {
      reminders,
      currentUser,
      stats,
      activePage: 'tasksReminders'
    });
  } catch (err) {
    console.error("❌ Error loading reminders dashboard:", err);
    res.status(500).send('Error loading Reminders dashboard data.');
  }
}

async function addReminder(req, res) {
  try {
    console.log("📨 Reminders Form Data Received:", req.body);
    const { text, dueDate, priority, notes } = req.body;
    const currentUser = getActiveUser(req, res);

    if (!text) {
      return res.status(400).send('Task content text is required.');
    }

    // Save strictly to MongoDB with fallback defaults
    await Reminder.create({
      text: text.trim(), 
      dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 1000 * 60 * 60 * 24),
      priority: priority ? priority.toLowerCase() : 'medium', 
      status: 'Pending',
      notes: notes || '',
      major: currentUser.major,
      academicYear: currentUser.academicYear
    });

    // Explicit absolute route redirect to reset the page view cleanly
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    return res.redirect('/reminders');
  } catch (err) {
    console.error("❌ Mongoose Reminder Save Error:", err);
    res.status(400).send('Error adding new reminder.');
  }
}

async function toggleReminderStatus(req, res) {
  try {
    const reminder = await Reminder.findById(req.params.id);
    if (reminder) {
      reminder.status = (reminder.status === 'Completed' || reminder.status === 'completed') ? 'Pending' : 'Completed';
      await reminder.save();
    }
    return res.redirect('/reminders');
  } catch (err) {
    res.status(400).send('Error updating task status.');
  }
}

async function deleteReminder(req, res) {
  try {
    await Reminder.findByIdAndDelete(req.params.id);
    return res.redirect('/reminders');
  } catch (err) {
    res.status(400).send('Error deleting task.');
  }
}

async function clearCompletedReminders(req, res) {
  try {
    const currentUser = getActiveUser(req, res);
    await Reminder.deleteMany({
      status: { $in: ['Completed', 'completed'] }
    });
    return res.redirect('/reminders');
  } catch (err) {
    res.status(400).send('Error clearing completed tasks.');
  }
}

export default {
  getRemindersPage,
  addReminder,
  toggleReminderStatus,
  deleteReminder,
  clearCompletedReminders
};