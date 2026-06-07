// controllers/groupController.js
import { createGroup, getUserGroups, joinGroup, leaveGroup, getGroupById } from '../models/Group.js';
import { connectToDatabase } from '../config/db.js';
import { ObjectId } from 'mongodb';

// Get all groups for current user
export const getUserGroupsController = async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    
    try {
        const groups = await getUserGroups(req.session.userId);
        res.json(groups);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// controllers/groupController.js - Update createGroupController
export const createGroupController = async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    
    try {
        const { name, course, category, major, academic_year, description } = req.body;
        
        if (!name || !course || !description) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        const group = await createGroup({
            name,
            course,
            category: category || 'cs',
            major: major || 'Computer Science',
            academic_year: academic_year || null,  // ← ADD THIS
            description,
            createdBy: req.session.userId
        });
        
        res.status(201).json(group);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Join a group
export const joinGroupController = async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    
    try {
        await joinGroup(req.params.id, req.session.userId);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Leave a group
export const leaveGroupController = async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    
    try {
        await leaveGroup(req.params.id, req.session.userId);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get group details
export const getGroupDetailsController = async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    
    try {
        const group = await getGroupById(req.params.id);
        if (!group) return res.status(404).json({ error: 'Group not found' });
        
        const isMember = group.members.some(m => m.toString() === req.session.userId);
        if (!isMember) return res.status(403).json({ error: 'You are not a member of this group' });
        
        res.json(group);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// controllers/groupController.js - Update sendMessageController
export const sendMessageController = async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ error: 'Message text is required' });
        
        const db = await connectToDatabase();
        const user = await db.collection('students').findOne({ 
            _id: new ObjectId(req.session.userId) 
        });
        
        const group = await getGroupById(req.params.id);
        if (!group) return res.status(404).json({ error: 'Group not found' });
        
        const isMember = group.members.some(m => m.toString() === req.session.userId);
        if (!isMember) return res.status(403).json({ error: 'You are not a member of this group' });
        
        // Ensure messages array exists
        if (!group.messages) {
            await db.collection('study_groups').updateOne(
                { _id: new ObjectId(req.params.id) },
                { $set: { messages: [] } }
            );
        }
        
        const newMessage = {
            senderId: req.session.userId,
            senderName: user?.name || 'User',
            text: text,
            time: new Date()
        };
        
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
};

// controllers/groupController.js - ADD THESE FUNCTIONS

// Get group messages
export const getGroupMessagesController = async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    
    try {
        const group = await getGroupById(req.params.id);
        if (!group) return res.status(404).json({ error: 'Group not found' });
        
        const isMember = group.members.some(m => m.toString() === req.session.userId);
        if (!isMember) return res.status(403).json({ error: 'You are not a member of this group' });
        
        res.json(group.messages || []);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get group resources
export const getGroupResourcesController = async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    
    try {
        const group = await getGroupById(req.params.id);
        if (!group) return res.status(404).json({ error: 'Group not found' });
        
        const isMember = group.members.some(m => m.toString() === req.session.userId);
        if (!isMember) return res.status(403).json({ error: 'You are not a member of this group' });
        
        res.json(group.resources || []);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Add a resource
export const addResourceController = async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    
    try {
        const { name, url } = req.body;
        if (!name) return res.status(400).json({ error: 'Resource name is required' });
        
        const db = await connectToDatabase();
        const user = await db.collection('students').findOne({ 
            _id: new ObjectId(req.session.userId) 
        });
        
        const group = await getGroupById(req.params.id);
        if (!group) return res.status(404).json({ error: 'Group not found' });
        
        const isMember = group.members.some(m => m.toString() === req.session.userId);
        if (!isMember) return res.status(403).json({ error: 'You are not a member of this group' });
        
        // Ensure resources array exists
        if (!group.resources) {
            await db.collection('study_groups').updateOne(
                { _id: new ObjectId(req.params.id) },
                { $set: { resources: [] } }
            );
        }
        
        const newResource = {
            name: name,
            url: url || '',
            uploadedBy: req.session.userId,
            uploadedByName: user?.name || 'User',
            uploadedAt: new Date()
        };
        
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
};
// controllers/groupController.js - ADD THIS FUNCTION

// Get group members
export const getGroupMembersController = async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    
    try {
        const db = await connectToDatabase();
        const group = await getGroupById(req.params.id);
        
        if (!group) return res.status(404).json({ error: 'Group not found' });
        
        const isMember = group.members.some(m => m.toString() === req.session.userId);
        if (!isMember) return res.status(403).json({ error: 'You are not a member of this group' });
        
        // Get member details from students collection
        const memberIds = group.members;
        const members = await db.collection('students')
            .find({ _id: { $in: memberIds } })
            .toArray();
        
        // Format member names
        const formattedMembers = members.map(m => ({
            id: m._id,
            name: m.name || m.username || 'Unknown'
        }));
        
        res.json(formattedMembers);
    } catch (error) {
        console.error('Error getting group members:', error);
        res.status(500).json({ error: error.message });
    }
};