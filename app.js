import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { connectToDatabase } from './config/db.js';
<<<<<<< HEAD
import { findById } from './models/userModel.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import pageRoutes from './routes/pageRoutes.js';
import apiRoutes from './routes/apiRoutes.js';

=======
import { findByEmail, createUser, findById, findByUsername } from './models/userModel.js';
import { createGroup, getUserGroups, getAvailableGroups,joinGroup, leaveGroup,addResource,addMessage } from './models/Group.js';
import { createFile, getUserFiles, deleteFile,shareFile,getSharedFiles } from './models/File.js';
// Initialize dotenv
>>>>>>> e4200d41418023f5b166cbb7f6cc40fda930791f
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express(); 
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

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
                // Unify normalization profiles down for EJS rendering engines
                user.year = user.year || user.academic_year; 
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
app.use('/', pageRoutes);       // Mounts front page layout views
app.use('/', authRoutes);       // Mounts login / signup form posts
app.use('/api/user', apiRoutes); // Mounts asset image post routines

connectToDatabase().then(() => {
    app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
}).catch(err => {
    console.error('Failed to connect to database:', err);
    process.exit(1);
});

// Get user's groups
app.get('/api/groups', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    
    try {
        const groups = await getUserGroups(req.session.userId);
        res.json(groups);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get available groups
app.get('/api/groups/available', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    
    try {
        const groups = await getAvailableGroups(req.session.userId);
        res.json(groups);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create a new group
app.post('/api/groups', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    
    try {
        const group = await createGroup({
            ...req.body,
            createdBy: req.session.userId
        });
        res.json(group);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Join a group
app.post('/api/groups/:id/join', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    
    try {
        await joinGroup(req.params.id, req.session.userId);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Leave a group
app.post('/api/groups/:id/leave', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    
    try {
        await leaveGroup(req.params.id, req.session.userId);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/files', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    
    try {
        const files = await getUserFiles(req.session.userId);
        res.json(files);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create a new file
app.post('/api/files', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    
    try {
        const file = await createFile({
            ...req.body,
            uploadedBy: req.session.userId
        });
        res.json(file);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a file
app.delete('/api/files/:id', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    
    try {
        await deleteFile(req.params.id, req.session.userId);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});