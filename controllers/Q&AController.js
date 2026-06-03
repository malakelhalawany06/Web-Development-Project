const Question = require('../models/qaModel');

// Replaces your old loadData() & renderQuestions() filtering logic
exports.getQApage = async (req, res) => {
  try {
    const currentFilter = req.query.tag || 'all';
    let queryFilter = {};

    if (currentFilter !== 'all') {
      queryFilter.tag = currentFilter;
    }

    const questions = await Question.find(queryFilter).sort({ timestamp: -1 });
    const currentUser = req.session.user || { firstName: "Ahmed", lastName: "Khalid", major: "Computer Science", academicYear: "3" };

    res.render('qa', { questions, currentFilter, currentUser });
  } catch (err) {
    res.status(500).send('Error loading Q&A Forum data.');
  }
};

// Replaces your old client-side addQuestion() function
exports.addQuestion = async (req, res) => {
  try {
    const { title, body, tag } = req.body;
    const user = req.session.user || { firstName: "Ahmed", lastName: "Khalid" };

    await Question.create({
      title: title.trim(),
      body: body ? body.trim() : '',
      tag: tag,
      author: `${user.firstName} ${user.lastName}`
    });

    res.redirect('/qa');
  } catch (err) {
    res.status(400).send('Error saving your question');
  }
};

// Replaces your old client-side upvoteQuestion() function
exports.upvoteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    await Question.findByIdAndUpdate(id, { $inc: { upvotes: 1 } });
    res.redirect('/qa');
  } catch (err) {
    res.status(400).send('Error processing upvote');
  }
};

// Replaces your old client-side addAnswer() function
exports.addAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    const { answerText } = req.body;
    const user = req.session.user || { firstName: "Ahmed", lastName: "Khalid" };

    await Question.findByIdAndUpdate(id, {
      $push: { answers: { text: answerText.trim(), author: `${user.firstName} ${user.lastName}` } }
    });

    res.redirect('/qa');
  } catch (err) {
    res.status(400).send('Error saving your reply');
  }
};

// Replaces your old client-side deleteQuestion() function
exports.deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    await Question.findByIdAndDelete(id);
    res.redirect('/qa');
  } catch (err) {
    res.status(400).send('Error deleting question');
  }
};