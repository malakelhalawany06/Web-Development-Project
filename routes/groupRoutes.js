
import express from 'express';
import { 
    createGroup, 
    getUserGroups, 
    joinGroup, 
    leaveGroup 
} from '../models/Group.js';

const router = express.Router();

// Get user's groups
router.get('/', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    
    try {
        const groups = await getUserGroups(req.session.userId);
        res.json(groups);
    } catch (error) {
        console.error('Error fetching groups:', error);
        res.status(500).json({ error: error.message });
    }
});

// Create a new group
router.post('/', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    
    try {
        const { name, course, category, description } = req.body;
        
        if (!name || !course || !description) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        const group = await createGroup({
            name,
            course,
            category: category || 'cs',
            description,
            createdBy: req.session.userId
        });
        
        res.status(201).json(group);
    } catch (error) {
        console.error('Error creating group:', error);
        res.status(500).json({ error: error.message });
    }
});

// Join a group
router.post('/:id/join', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    
    try {
        await joinGroup(req.params.id, req.session.userId);
        res.json({ success: true });
    } catch (error) {
        console.error('Error joining group:', error);
        res.status(500).json({ error: error.message });
    }
});

// Leave a group
router.post('/:id/leave', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    
    try {
        await leaveGroup(req.params.id, req.session.userId);
        res.json({ success: true });
    } catch (error) {
        console.error('Error leaving group:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;