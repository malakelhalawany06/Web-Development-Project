import express from 'express';
import * as profileController from '../controllers/profileController.js';

const router = express.Router();

const ensureAuthenticated = (req, res, next) => {
    if (req.session.userId) return next();
    res.redirect('/login'); 
};

// Handles: GET /personal-info/edit
router.get('/edit', ensureAuthenticated, profileController.getProfile);

// Backup handling route link directly matching base route paths
router.get('/', ensureAuthenticated, profileController.getProfile);
// Check your app.js or routes file!
app.post('/api/user/upload-avatar', upload.single('avatar'), (req, res) => {
    // Your upload handling logic here
    res.json({ success: true, url: `/uploads/avatars/${req.file.filename}` });
});
// Form submission pipeline endpoints
router.post('/update', ensureAuthenticated, profileController.updateProfile);
router.post('/change-password', ensureAuthenticated, profileController.changePassword);

export default router;