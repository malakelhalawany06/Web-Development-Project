// routes/sharedRoutes.js
import express from 'express';
import { ObjectId } from 'mongodb';
import { 
    createMaterial, 
    getAllMaterials, 
    getMaterialsByMajor,
    getUserSharedMaterials,
    addComment 
} from '../models/SharedMaterial.js';
import { connectToDatabase } from '../config/db.js';
import { addSharedFile } from '../models/File.js';

const router = express.Router();

// Get all shared materials (or filter by major)
// routes/sharedRoutes.js - Fix the GET endpoint to return ONLY user's own shared materials
router.get('/', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    
    try {
        // Return ONLY the current user's shared materials (for their history)
        const materials = await getUserSharedMaterials(req.session.userId);
        
        res.json(materials);
    } catch (error) {
        console.error('Error getting user materials:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get user's own shared materials (for history)
router.get('/my-shared', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    
    try {
        const materials = await getUserSharedMaterials(req.session.userId);
        res.json(materials);
    } catch (error) {
        console.error('Error getting user shared materials:', error);
        res.status(500).json({ error: error.message });
    }
});

// Create a new shared material
router.post('/', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    
    try {
        const { title, description, fileName, fileSize, fileIcon, course } = req.body;
        
        const db = await connectToDatabase();
        
        const user = await db.collection('students').findOne({ 
            _id: new ObjectId(req.session.userId) 
        });
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }
        
        // Save to shared materials collection (history)
        const material = await createMaterial({
            title: title,
            description: description || '',
            fileName: fileName || '',
            fileSize: fileSize || '',
            fileIcon: fileIcon || '📄',
            uploadedBy: req.session.userId,
            uploadedByName: user.name,
            uploadedByMajor: user.major,
            uploadedByYear: user.academic_year,
            course: course || 'General'
        });
        
        // ALSO save to notes_files collection for other students to see
        await addSharedFile({
            title: title,
            description: description || '',
            fileName: fileName || '',
            fileSize: fileSize || '',
            fileIcon: fileIcon || '📄',
            course: course || 'General',
            sharedBy: user.name,
            sharedById: req.session.userId,
            sharedByMajor: user.major,
            sharedByYear: user.academic_year
        });
        
        res.status(201).json(material);
    } catch (error) {
        console.error('Error creating material:', error);
        res.status(500).json({ error: error.message });
    }
});

// Add a comment to a material
router.post('/:id/comments', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    
    try {
        const { text } = req.body;
        const db = await connectToDatabase();
        const user = await db.collection('students').findOne({ 
            _id: new ObjectId(req.session.userId) 
        });
        
        const comment = {
            author: user?.name || 'User',
            authorId: req.session.userId,
            authorAvatar: user?.name?.charAt(0) || 'U',
            text: text,
            time: new Date()
        };
        
        await addComment(req.params.id, comment);
        res.json({ success: true, comment });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;