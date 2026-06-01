import express from 'express';
import { ObjectId } from 'mongodb';
import { 
    createGroup, 
    getUserGroups, 
    joinGroup, 
    leaveGroup,
    getGroupById 
} from '../models/Group.js';
import { connectToDatabase } from '../config/db.js';

const router = express.Router();


async function getUserName(userId) {
    const db = await connectToDatabase();
    const collections = ['students', 'instructors', 'admins'];
    
    for (const colName of collections) {
        const user = await db.collection(colName).findOne({ _id: new ObjectId(userId) });
        if (user) {
            return user.name || user.username || 'User';
        }
    }
    return 'User';
}

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

// Get group by ID (check membership)
router.get('/:id', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    
    try {
        const group = await getGroupById(req.params.id);
        if (!group) return res.status(404).json({ error: 'Group not found' });
        
        // Check if user is a member
        const isMember = group.members.some(m => m.toString() === req.session.userId);
        if (!isMember) return res.status(403).json({ error: 'You are not a member of this group' });
        
        res.json(group);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get group members (only for members)
router.get('/:id/members', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    
    try {
        const group = await getGroupById(req.params.id);
        if (!group) return res.status(404).json({ error: 'Group not found' });
        
        // Check if user is a member
        const isMember = group.members.some(m => m.toString() === req.session.userId);
        if (!isMember) return res.status(403).json({ error: 'You are not a member of this group' });
        
        // Get member details from all collections
        const db = await connectToDatabase();
        const collections = ['students', 'instructors', 'admins'];
        let members = [];
        
        for (const colName of collections) {
            const found = await db.collection(colName).find({
                _id: { $in: group.members }
            }).toArray();
            members = members.concat(found);
        }
        
        // Format member names
        const formattedMembers = members.map(m => ({
            id: m._id,
            name: m.fullName || m.name || m.username || 'User'
        }));
        
        res.json(formattedMembers);
    } catch (error) {
        console.error('Error getting members:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get group messages
router.get('/:id/messages', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    
    try {
        const group = await getGroupById(req.params.id);
        if (!group) return res.status(404).json({ error: 'Group not found' });
        
        const isMember = group.members.some(m => m.toString() === req.session.userId);
        if (!isMember) return res.status(403).json({ error: 'You are not a member of this group' });
        
        // Add sender names to messages
        const messages = await Promise.all((group.messages || []).map(async (msg) => {
            let senderName = msg.senderName;
            if (!senderName && msg.senderId) {
                const db = await connectToDatabase();
                const collections = ['students', 'instructors', 'admins'];
                for (const colName of collections) {
                    const user = await db.collection(colName).findOne({ _id: new ObjectId(msg.senderId) });
                    if (user) {
                        senderName = user.fullName || user.name || user.username;
                        break;
                    }
                }
            }
            return { ...msg, senderName: senderName || 'User' };
        }));
        
        res.json(messages);
    } catch (error) {
        console.error('Error getting messages:', error);
        res.status(500).json({ error: error.message });
    }
});

// Send a message
router.post('/:id/messages', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ error: 'Message text is required' });
        
        const group = await getGroupById(req.params.id);
        if (!group) return res.status(404).json({ error: 'Group not found' });
        
        const isMember = group.members.some(m => m.toString() === req.session.userId);
        if (!isMember) return res.status(403).json({ error: 'You are not a member of this group' });
        
        const senderName = await getUserName(req.session.userId);
        
        const newMessage = {
            senderId: req.session.userId,
            senderName: senderName,
            text: text,
            time: new Date()
        };
        
        const db = await connectToDatabase();
        await db.collection('study_groups').updateOne(
            { _id: new ObjectId(req.params.id) },
            { 
                $push: { messages: newMessage },
                $inc: { messageCount: 1 }
            }
        );
        
        res.json({ success: true, message: newMessage });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get group resources
router.get('/:id/resources', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    
    try {
        const group = await getGroupById(req.params.id);
        if (!group) return res.status(404).json({ error: 'Group not found' });
        
        const isMember = group.members.some(m => m.toString() === req.session.userId);
        if (!isMember) return res.status(403).json({ error: 'You are not a member of this group' });
        
        res.json(group.resources || []);
    } catch (error) {
        console.error('Error getting resources:', error);
        res.status(500).json({ error: error.message });
    }
});

// Add a resource
router.post('/:id/resources', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    
    try {
        const { name, url } = req.body;
        if (!name) return res.status(400).json({ error: 'Resource name is required' });
        
        const group = await getGroupById(req.params.id);
        if (!group) return res.status(404).json({ error: 'Group not found' });
        
        const isMember = group.members.some(m => m.toString() === req.session.userId);
        if (!isMember) return res.status(403).json({ error: 'You are not a member of this group' });
        
        const uploadedByName = await getUserName(req.session.userId);
        
        const newResource = {
            name: name,
            url: url || '',
            uploadedBy: req.session.userId,
            uploadedByName: uploadedByName,
            uploadedAt: new Date()
        };
        
        const db = await connectToDatabase();
        await db.collection('study_groups').updateOne(
            { _id: new ObjectId(req.params.id) },
            { 
                $push: { resources: newResource },
                $inc: { resourceCount: 1 }
            }
        );
        
        res.json({ success: true, resource: newResource });
    } catch (error) {
        console.error('Error adding resource:', error);
        res.status(500).json({ error: error.message });
    }
});
// Get available groups filtered by course
router.get('/available', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    
    try {
        const db = await connectToDatabase();
        
        // Get user's major
        const user = await db.collection('students').findOne({ 
            _id: new ObjectId(req.session.userId) 
        });
        
        const userMajor = user?.major || 'Computer Science';
        const courseFilter = req.query.course; // Optional course filter
        
        let query = {
            major: userMajor,
            members: { $ne: new ObjectId(req.session.userId) }
        };
        
        if (courseFilter && courseFilter !== 'all') {
            query.course = { $regex: courseFilter, $options: 'i' };
        }
        
        const groups = await db.collection('study_groups').find(query).toArray();
        res.json(groups);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
export default router;