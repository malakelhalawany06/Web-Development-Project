// routes/fileRoutes.js
import express from 'express';
import { 
    createFile, 
    getUserFiles, 
    deleteFile,
    shareFile,
    getFileById
} from '../models/File.js';

const router = express.Router();

// Get user's files
router.get('/', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    
    try {
        const files = await getUserFiles(req.session.userId);
        res.json(files);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single file by ID
router.get('/:id', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    
    try {
        const file = await getFileById(req.params.id);
        if (!file) return res.status(404).json({ error: 'File not found' });
        res.json(file);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create a new file
router.post('/', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    
    try {
        const file = await createFile({
            ...req.body,
            uploadedBy: req.session.userId
        });
        res.status(201).json(file);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a file
router.delete('/:id', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    
    try {
        await deleteFile(req.params.id, req.session.userId);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Share a file with another user
router.post('/:id/share', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    
    try {
        const { email } = req.body;
        // Note: You'll need to implement getUserByEmail or handle this differently
        await shareFile(req.params.id, email);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;