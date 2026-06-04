import Question from '../models/Q&AModel.js';

async function getQApage(req, res) {
  try {
    const currentFilter = req.query.tag || 'all';
    let queryFilter = {};

    if (currentFilter !== 'all') {
      queryFilter.tag = currentFilter;
    }

    const questions = await Question.find(queryFilter).sort({ timestamp: -1 });
    const currentUser = req.session.user || { firstName: "Ahmed", lastName: "Khalid", major: "Computer Science", academicYear: "3" };

    res.render('Q&A', { 
      questions, 
      currentFilter, 
      currentUser 
    });
  } catch (err) {
    res.status(500).send('Error loading Q&A Forum data.');
  }
}

async function addQuestion(req, res) {
  try {
    const { title, description, tag } = req.body;
    const currentUser = req.session.user || { firstName: "Ahmed", lastName: "Khalid", major: "Computer Science", academicYear: "3" };

    await Question.create({
      title,
      description,
      tag,
      author: currentUser
    });
    res.redirect('/qa');
  } catch (err) {
    res.status(400).send('Error posting question.');
  }
}

async function upvoteQuestion(req, res) {
  try {
    const question = await Question.findById(req.params.id);
    if (question) {
      question.upvotes += 1;
      await question.save();
    }
    res.redirect('/qa');
  } catch (err) {
    res.status(400).send('Error processing upvote.');
  }
}

async function addAnswer(req, res) {
  try {
    const { text } = req.body;
    const currentUser = req.session.user || { firstName: "Ahmed", lastName: "Khalid", major: "Computer Science", academicYear: "3" };
    const authorName = `${currentUser.firstName} ${currentUser.lastName}`;

    const question = await Question.findById(req.params.id);
    if (question) {
      question.answers.push({ text, author: authorName });
      await question.save();
    }
    res.redirect('/qa');
  } catch (err) {
    res.status(400).send('Error submitting answer.');
  }
}

async function deleteQuestion(req, res) {
  try {
    await Question.findByIdAndDelete(req.params.id);
    res.redirect('/qa');
  } catch (err) {
    res.status(400).send('Error deleting question.');
  }
}

// Modern ES Module group export
export default {
  getQApage,
  addQuestion,
  upvoteQuestion,
  addAnswer,
  deleteQuestion
};