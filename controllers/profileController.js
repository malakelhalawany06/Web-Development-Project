import bcrypt from 'bcrypt';
import { findById, updateUser } from '../models/userModel.js';

// --- Load/Render Profile Page ---
export const getProfile = async (req, res) => {
    try {
        const user = await findById(req.session.userId);
        if (!user) {
            return res.redirect('/login');
        }

        // Securely pass role indicators down to EJS layout templates
        user.role = req.session.userRole || user.role;
        user.year = user.academic_year || user.year || '';
        user.email = user.email || user.mail || '';

        if (!user.profile_picture || user.profile_picture.trim() === "") {
            user.profile_picture = '/images/default-avatar.png';
        }

        // Split database 'name' string back into localized first/last inputs
        let fname = "";
        let lname = "";
        if (user.name) {
            const nameParts = user.name.trim().split(/\s+/);
            fname = nameParts[0] || "";
            lname = nameParts.slice(1).join(" ") || "";
        }

        user.fname = fname;
        user.lname = lname;

        res.render('personal-info', { 
            user: user,
            activePage: 'profile',
            messages: {}
        });
    } catch (err) {
        console.error("Error loading profile view layout:", err);
        res.status(500).send('Server Error loading profile page');
    }
};

// --- Update Profile General Info (FIXED DATABASE SAVING) ---
export const updateProfile = async (req, res) => {
    try {
        const { fname, lname, username, email, major, year, uni } = req.body;
        const userId = req.session.userId;
        const userRole = req.session.userRole; // Target collection ('students' or 'instructors')

        if (!userId || !userRole) {
            return res.status(401).json({ error: 'Unauthorized transaction session state.' });
        }

        const fullNewName = `${fname.trim()} ${lname.trim()}`;

        // Build generic updates object
        const updates = {
            name: fullNewName,
            username: username.trim(),
            major: major,
            university: uni
        };

        // Conditional checks depending on collection target
        if (userRole === 'instructors') {
            updates.mail = email.trim();
        } else {
            updates.email = email.trim();
            updates.academic_year = parseInt(year) || null;
        }

        // EXECUTE THE DATABASE UPDATE CALL IN MONGODB
        await updateUser(userRole, userId, updates);
        
        console.log(`✅ Profile updated in DB collection [${userRole}] for ID: ${userId}`);
        res.json({ success: true, message: 'Profile updated successfully!' });
    } catch (err) {
        console.error("Database update execution error:", err);
        res.status(500).json({ error: 'Failed to save updated information to the database.' });
    }
};

// --- Secure Password Update Processing (FIXED BCRYPT ROUTINE) ---
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.session.userId;
        const userRole = req.session.userRole;

        const user = await findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User record not found.' });
        }

        // Read dynamic variable structures depending on historic generation schema mappings
        const databaseHash = user.password_hash || user.hashed_password;
        if (!databaseHash) {
            return res.status(400).json({ error: 'Authentication profile lacks initial password verification target.' });
        }

        // Run validation check against current typed password string
        const isMatch = await bcrypt.compare(currentPassword, databaseHash);
        if (!isMatch) {
            return res.status(400).json({ error: 'Current password input text is incorrect.' });
        }

        // Hash our new password string securely
        const secureSalt = await bcrypt.genSalt(10);
        const newHashedPassword = await bcrypt.hash(newPassword, secureSalt);

        // Update record field parameters inside collection target matching active layout
        const passwordUpdateField = user.password_hash ? { password_hash: newHashedPassword } : { hashed_password: newHashedPassword };
        await updateUser(userRole, userId, passwordUpdateField);

        console.log(`✅ Password securely updated for user ID: ${userId}`);
        res.json({ success: true, message: 'Password updated successfully!' });
    } catch (err) {
        console.error("Password update application processing error:", err);
        res.status(500).json({ error: 'Server error processing password update.' });
    }
};
