import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { connectToDatabase } from './config/db.js';
import { findById } from './models/userModel.js';
import mongoose from 'mongoose'; // ✅ Global Mongoose import

// Route Imports
import authRoutes from './routes/authRoutes.js';
import pageRoutes from './routes/pageRoutes.js';
import apiRoutes from './routes/apiRoutes.js';
import groupRoutes from './routes/groupRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import sharedRoutes from './routes/sharedRoutes.js';
import profileRoutes from './routes/profileRoutes.js'; 
import subjectRoutes from './routes/subjectRoutes.js';
import qaRoutes from './routes/Q&ARoutes.js';
import remindersRoutes from './routes/remindersRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// New Modular Route Files 
import gpaRoutes from './routes/gpaRoutes.js';
import projectManagerRoutes from './routes/projectManagerRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express(); 
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static assets first so they don't break session configurations
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, secure: false, maxAge: 1000 * 60 * 60 * 24 }
}));

// Global user session state initialization middleware 
app.use(async (req, res, next) => {
    try {
        if (req.session.userId) {
            const user = await findById(req.session.userId);
            if (user) {
                user.role = req.session.userRole; 
                user.email = user.email || user.mail;
                
                // Unify academic year tracking properties 
                user.year = user.year || user.academic_year; 

                // FORCE DEFAULT AVATAR IF FIELD IS EMPTY, NULL, OR MISSING
                if (!user.profile_picture || user.profile_picture.trim() === "") {
                    user.profile_picture = '/images/default-avatar.png';
                }
                
                res.locals.user = user;
            } else {
                res.locals.user = null;
            }
        } else {
            res.locals.user = null;
        }
    } catch (error) {
        res.locals.user = null;
    }
    next();
});

// ------------------------------------------------------------------
// MOUNTING ROUTERS (Keeps things organized!)
// ------------------------------------------------------------------
app.use('/', authRoutes);           // Authenticate requests before page routing triggers
app.use('/', pageRoutes);           // Mounts front page layout views
app.use('/personal-info', profileRoutes); // Base URL path is now /profile

// 🎓 MOUNTED: GPA & Project Manager Controllers (View pages + Engine APIs)
app.use('/', gpaRoutes);
app.use('/', projectManagerRoutes);

// APPLIES ROUTING PATH FOR BUTTON ACTIONS TO TALK TO MONGO INTERFACES
app.use('/api', apiRoutes); 
app.use('/api/groups', groupRoutes);
app.use('/admin', adminRoutes);
app.use('/notes-files', fileRoutes);
app.use('/notes&files', fileRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/shared', sharedRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/Q&A', qaRoutes);
app.use('/reminders', remindersRoutes);

// ------------------------------------------------------------------
// DATABASE CONNECTION INITIALIZATION BLOCK (Safely adapted)
// ------------------------------------------------------------------
connectToDatabase().then(async () => {
    // Sync global mongoose connection string using existing environment keys
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.DB_URI, {
            dbName: process.env.DB_NAME
        });
        console.log('✅ Mongoose Sync Complete');
    }

    app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
}).catch(err => {
    console.error('Failed to connect to database:', err);
    process.exit(1);
});