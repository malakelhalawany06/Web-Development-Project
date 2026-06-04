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

// Create a new group
export const createGroupController = async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    
    try {
        const { name, course, category, major, description } = req.body;
        
        if (!name || !course || !description) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        const group = await createGroup({
            name,
            course,
            category: category || 'cs',
            major: major || 'Computer Science',
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