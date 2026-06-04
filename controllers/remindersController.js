import Reminder from '../models/remindersModel.js';

function getSubjectsForUser(user) {
  const { university, major, academicYear, role } = user;
  if (role === 'instructor' || !academicYear) return [];
  const yearNum = parseInt(academicYear);

  const subjectMap = {
    'MIU': { 'Computer Science': { 1: ['Digital Logic Design', 'Mathematics', 'Data Structures'], 2: ['Database Systems', 'Web Development', 'Networks'], 3: ['Advanced Algorithms', 'Software Engineering', 'Operating Systems'] } },
    'AUC': { 'Business Informatics': { 1: ['Applied Economics', 'English for Business'], 2: ['Innovation Management', 'Database Systems'] } },
    'BUE': { 'Applied Arts': { 1: ['Environmental & Passive Technology', 'Architecture Drawing', 'Typography'], 2: ['Interior Design', 'Remodeling', 'Materials & Finishing'] } },
    'MSA': { 'Dentistry': { 1: ['Oral Pathology', 'General Physiology'], 2: ['Operative Dentistry', 'Computer Applications', 'Microbiology'] } },
    'GVC': { 'Law': { 1: ['Commercial Laws & Regulations', 'International Law'], 2: ['Law of Commercial Procedures', 'Administration Law', 'Technological Design'] } },
    'AASST': { 'Applied Arts': { 1: ['Environmental & Passive Technology', 'Architecture Drawing', 'Typography'], 2: ['Interior Design', 'Remodeling', 'Materials & Finishing'] } }
  };

  const uni = subjectMap[university];
  if (!uni) return ['General Study', 'Assignment'];
  const majorSubjects = uni[major];
  if (!majorSubjects) return ['General Study', 'Assignment'];
  return majorSubjects[yearNum] || ['General Study', 'Assignment'];
}

async function generateDefaultReminders(userId, user) {
  const subjects = getSubjectsForUser(user);
  if (subjects.length === 0) return;
  const now = new Date();
  const templates = [];

  subjects.forEach((subject, idx) => {
    const quizDue = new Date(now);
    quizDue.setDate(now.getDate() + (idx + 1) * 2);
    templates.push({
      userId,
      text: `${subject} – Quiz preparation`,
      completed: false,
      priority: 'high',
      dueDate: quizDue.toISOString().slice(0, 16),
      notes: `Review ${subject}`
    });

    const projDue = new Date(now);
    projDue.setDate(now.getDate() + (idx + 3) * 2);
    templates.push({
      userId,
      text: `${subject} – Group project`,
      completed: false,
      priority: 'medium',
      dueDate: projDue.toISOString().slice(0, 16),
      notes: `Team work for ${subject}`
    });
  });

  await Reminder.insertMany(templates);
}

async function getRemindersPage(req, res) {
  try {
    const currentUser = req.session.user || { 
      _id: "6a208401e30bc831fb7d9635", 
      firstName: "Ahmed", 
      lastName: "Khalid", 
      major: "Computer Science", 
      academicYear: "3", 
      university: "MIU" 
    };

    let userReminders = await Reminder.find({ userId: currentUser._id }).sort({ createdAt: -1 });

    if (userReminders.length === 0) {
      await generateDefaultReminders(currentUser._id, currentUser);
      userReminders = await Reminder.find({ userId: currentUser._id }).sort({ createdAt: -1 });
    }

    const totalReminders = userReminders.length;
    const completedReminders = userReminders.filter(r => r.completed).length;
    const pendingReminders = totalReminders - completedReminders;
    const urgentReminders = userReminders.filter(r => !r.completed && r.priority === 'high').length;

    res.render('reminders', {
      reminders: userReminders,
      stats: { totalReminders, completedReminders, pendingReminders, urgentReminders },
      currentUser
    });
  } catch (err) {
    res.status(500).send('Error loading tasks dashboard.');
  }
}

async function addReminder(req, res) {
  try {
    const { text, priority, dueDate, notes } = req.body;
    const userId = req.session.user?._id || "6a208401e30bc831fb7d9635";

    if (!text || !text.trim()) return res.status(400).send("Task details cannot be empty");

    await Reminder.create({
      userId,
      text: text.trim(),
      priority,
      dueDate,
      notes: notes ? notes.trim() : ""
    });

    res.redirect('/reminders');
  } catch (err) {
    res.status(400).send('Error adding reminder task.');
  }
}

async function toggleReminder(req, res) {
  try {
    const { id } = req.params;
    const reminder = await Reminder.findById(id);
    if (reminder) {
      reminder.completed = !reminder.completed;
      await reminder.save();
    }
    res.redirect('/reminders');
  } catch (err) {
    res.status(400).send('Error processing completion check.');
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

async function clearCompletedReminders(req, res) {
  try {
    const userId = req.session.user?._id || "6a208401e30bc831fb7d9635";
    await Reminder.deleteMany({ userId, completed: true });
    res.redirect('/reminders');
  } catch (err) {
    res.status(400).send('Error purging completed items.');
  }
}

// Modern ES Module group export
export default {
  getRemindersPage,
  addReminder,
  toggleReminder,
  deleteReminder,
  clearCompletedReminders
};