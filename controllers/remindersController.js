import Reminder from '../models/remindersModel.js';

// Helper function to safely extract user data matching your database schema requirements
function getActiveUser(req, res) {
  if (res.locals.user) {
    return {
      id: res.locals.user._id || "mock-id",
      firstName: res.locals.user.firstName || res.locals.user.name || "Logged-in",
      major: res.locals.user.major || "Computer Science",
      academicYear: String(res.locals.user.year || res.locals.user.academic_year || "3")
    };
  }
  
  // Fallback testing user when not logged in locally
  return {
    id: "mock-id-ahmed",
    firstName: "Ahmed",
    major: "Computer Science",
    academicYear: "3"
  };
}

async function getRemindersPage(req, res) {
  try {
    const currentUser = getActiveUser(req, res);

    // 1. Automatically generate default academic reminders based on their Major/Year if none exist
    const existingReminders = await Reminder.find({ major: currentUser.major, academicYear: currentUser.academicYear });

    if (existingReminders.length === 0) {
      await Reminder.create([
        {
          title: `${currentUser.major} Assignment 1`,
          dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3), // 3 days from now
          priority: 'High',
          status: 'Pending',
          major: currentUser.major,
          academicYear: currentUser.academicYear
        },
        {
          title: `Prepare for Year ${currentUser.academicYear} Midterms`,
          dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days from now
          priority: 'Medium',
          status: 'Pending',
          major: currentUser.major,
          academicYear: currentUser.academicYear
        }
      ]);
    }

    // 2. Fetch the reminders for this specific cohort
    const reminders = await Reminder.find({ major: currentUser.major, academicYear: currentUser.academicYear });

    // 3. Calculate metrics for the dashboard widgets
    const totalTasks = reminders.length;
    const completedTasks = reminders.filter(r => r.status === 'Completed').length;
    const pendingTasks = totalTasks - completedTasks;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    res.render('reminders', {
      reminders,
      currentUser,
      metrics: {
        totalTasks,
        completedTasks,
        pendingTasks,
        completionRate
      }
    });
  } catch (err) {
    console.error("❌ Error loading reminders dashboard:", err);
    res.status(500).send('Error loading Reminders dashboard data.');
  }
}

async function addReminder(req, res) {
  try {
    const { title, dueDate, priority } = req.body;
    const currentUser = getActiveUser(req, res);

    if (!title) {
      return res.status(400).send('Task title is required.');
    }

    await Reminder.create({
      title: title.trim(),
      dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 1000 * 60 * 60 * 24),
      priority: priority || 'Medium',
      status: 'Pending',
      major: currentUser.major,
      academicYear: currentUser.academicYear
    });

    res.redirect('/reminders');
  } catch (err) {
    console.error("❌ Mongoose Reminder Save Error:", err);
    res.status(400).send('Error adding new reminder.');
  }
}

async function toggleReminderStatus(req, res) {
  try {
    const reminder = await Reminder.findById(req.params.id);
    if (reminder) {
      reminder.status = reminder.status === 'Completed' ? 'Pending' : 'Completed';
      await reminder.save();
    }
    res.redirect('/reminders');
  } catch (err) {
    res.status(400).send('Error updating task status.');
  }
}

async function deleteReminder(req, res) {
  try {
    await Reminder.findByIdAndDelete(req.params.id);
    res.redirect('/reminders');
  } catch (err) {
    res.status(400).send('Error deleting task.');
  }
}

export default {
  getRemindersPage,
  addReminder,
  toggleReminderStatus,
  deleteReminder
};