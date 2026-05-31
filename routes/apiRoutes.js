import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../config/db.js';

const router = express.Router();

// Ensure image directory exists
const uploadDir = 'public/images';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/images/'),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `avatar-${req.session.userId}-${Date.now()}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) return cb(null, true);
    cb(new Error('Only image files are allowed!'));
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 1024 * 1024 * 3 } 
});

// POST Route: Handle Profile Picture Upload
router.post('/upload-avatar', upload.single('avatar'), async (req, res) => {
    if (!req.session.userId || !req.session.userRole) {
        return res.status(401).json({ success: false, error: 'Unauthorized active session window.' });
    }
    try {
        if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded.' });

        const savedWebPath = `/images/${req.file.filename}`;
        const db = await connectToDatabase(); 
       // 1. Update the database record securely
        await db.collection(req.session.userRole).updateOne(
            { _id: new ObjectId(req.session.userId) },
            { $set: { profile_picture: savedWebPath, updatedAt: new Date() } }
        );

        // 2. 🌟 THE CRUCIAL ADDITION: Force-update the session cache right now!
        if (req.session.userObject) {
            req.session.userObject.profile_picture = savedWebPath;
        }

        res.json({ success: true, url: savedWebPath });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Internal server upload failure.' });
    }
});

export default router;