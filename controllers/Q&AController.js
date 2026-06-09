import Question from '../models/Q&AModel.js';

function getActiveUser(req, res) {
  if (res.locals.user) {
    return {
      firstName: res.locals.user.firstName || res.locals.user.name || "Logged-in",
      lastName: res.locals.user.lastName || "User",
      major: res.locals.user.major || "General Studies",
      academicYear: String(res.locals.user.year || res.locals.user.academic_year || "1")
    };
  }
  
  return {
    firstName: "Ahmed",
    lastName: "Khalid",
    major: "Computer Science",
    academicYear: "3"
  };
}

async function getQApage(req, res) {
  try {
    const currentFilter = req.query.tag || 'all';
    
    const currentUser = getActiveUser(req, res);

    let queryFilter = {
      'author.major': currentUser.major,
      'author.academicYear': currentUser.academicYear
    };

    if (currentFilter !== 'all') {
      queryFilter.tag = currentFilter;
    }

    const questions = await Question.find(queryFilter).sort({ timestamp: -1 });

    res.render('Q&A', { 
      questions, 
      currentFilter, 
      currentUser,
      activePage: 'Q&A'
    });
  } catch (err) {
    console.error("❌ Error fetching filtered Q&A data:", err);
    res.status(500).send('Error loading Q&A Forum data.');
  }
}

async function addQuestion(req, res) {
  try {
    console.log("📨 Form Data Received by Backend:", req.body);

    const title = req.body.title || req.body.questionTitle;
    const description = req.body.body || req.body.description || req.body.content; 
    const tag = req.body.tag || 'all';

    const currentUser = getActiveUser(req, res);

    if (!title || !description) {
      return res.status(400).send('Title and description are required.');
    }

    await Question.create({
      title: title.trim(),
      description: description.trim(),
      tag: tag || 'all',
      author: currentUser
    });
    
    res.redirect('/qa');
  } catch (err) {
    console.error("❌ Mongoose Save Error Details:", err);
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
    const currentUser = getActiveUser(req, res);
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

export default {
  getQApage,
  addQuestion,
  upvoteQuestion,
  addAnswer,
  deleteQuestion
};