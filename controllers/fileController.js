// controllers/fileController.js - CLEANED VERSION
import { getFileById, getFileData, deleteFile, getFilesByMajorAndYear, getInstructorFiles } from '../models/File.js';
import { connectToDatabase } from '../config/db.js';
import { ObjectId } from 'mongodb';

export const getSharedFilesController = async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    
    try {
        const db = await connectToDatabase();
        const userId = req.session.userId;
        
        // Get user info
        let user = await db.collection('students').findOne({ 
            _id: new ObjectId(userId) 
        });
        
        if (!user) {
            user = await db.collection('instructors').findOne({ 
                _id: new ObjectId(userId) 
            });
        }
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Get files this user has hidden
        const hiddenFiles = await db.collection('hidden_files')
            .find({ userId: new ObjectId(userId) })
            .toArray();
        
        const hiddenFileIds = hiddenFiles.map(h => h.fileId.toString());
        
        // Get files filtered by major and year
        let files = await getFilesByMajorAndYear(user.major, user.academic_year);
        
        // Filter out hidden files
        files = files.filter(file => !hiddenFileIds.includes(file._id.toString()));
        
        // Add ownership info for frontend
        const filesWithOwnership = files.map(file => ({
            ...file,
            isOwner: file.sharedById?.toString() === userId
        }));
        
        res.json(filesWithOwnership);
        
    } catch (error) {
        console.error('Error getting shared files:', error);
        res.status(500).json({ error: error.message });
    }
};

export const getInstructorFilesController = async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    
    try {
        const db = await connectToDatabase();
        const instructor = await db.collection('instructors').findOne({ 
            _id: new ObjectId(req.session.userId) 
        });
        
        if (!instructor) {
            return res.status(404).json({ error: 'Instructor not found' });
        }
        
        const instructorMajor = instructor?.major || 'Computer Science';
        
        // Get files for instructor using model function
        const files = await getInstructorFiles(instructorMajor, req.session.userId);
        
        res.json(files);
    } catch (error) {
        console.error('Error getting instructor files:', error);
        res.status(500).json({ error: error.message });
    }
};

export const getFileByIdController = async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    
    try {
        const file = await getFileById(req.params.id);
        if (!file) return res.status(404).json({ error: 'File not found' });
        res.json(file);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const downloadFileController = async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    
    try {
        const file = await getFileData(req.params.id);
        
        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }
        
        // Check access based on shared materials
        const isShared = file.isShared === true;
        const isOwner = file.sharedById?.toString() === req.session.userId;
        
        if (!isShared && !isOwner) {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        // Get the file data - handle MongoDB Binary correctly
        let fileBuffer = file.fileData;
        
        // If it's a MongoDB Binary object, extract the buffer
        if (fileBuffer && typeof fileBuffer === 'object' && fileBuffer.buffer) {
            fileBuffer = fileBuffer.buffer;
        }
        
        // If it's a Buffer, use it directly
        if (!fileBuffer || fileBuffer.length === 0) {
            return res.status(404).json({ error: 'File content not found' });
        }
        
        // Convert to Buffer if needed
        const buffer = Buffer.isBuffer(fileBuffer) ? fileBuffer : Buffer.from(fileBuffer);
        const fileName = encodeURIComponent(file.fileName);
        
        res.setHeader('Content-Type', file.fileType || 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Length', buffer.length);
        
        return res.end(buffer);
        
    } catch (error) {
        console.error('Error downloading file:', error);
        res.status(500).json({ error: error.message });
    }
};

export const deleteFileController = async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    
    try {
        const db = await connectToDatabase();
        const fileId = req.params.id;
        const userId = req.session.userId;
        
        const file = await db.collection('notes_files').findOne({ 
            _id: new ObjectId(fileId) 
        });
        
        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }
        
        const isOwner = file.sharedById?.toString() === userId;
        
        if (isOwner) {
            // Owner: Permanently delete
            await db.collection('hidden_files').deleteMany({
                fileId: new ObjectId(fileId)
            });
            
            const result = await db.collection('notes_files').deleteOne({ 
                _id: new ObjectId(fileId) 
            });
            
            if (result.deletedCount === 0) {
                return res.status(404).json({ error: 'File not found' });
            }
            
            res.json({ 
                success: true, 
                deletedForEveryone: true
            });
            
        } else {
            // Non-owner: Hide
            const existing = await db.collection('hidden_files').findOne({
                fileId: new ObjectId(fileId),
                userId: new ObjectId(userId)
            });
            
            if (existing) {
                return res.status(400).json({ error: 'File already hidden' });
            }
            
            await db.collection('hidden_files').insertOne({
                fileId: new ObjectId(fileId),
                userId: new ObjectId(userId),
                hiddenAt: new Date()
            });
            
            res.json({ 
                success: true, 
                hiddenForUser: true
            });
        }
        
    } catch (error) {
        console.error('Error in delete/hide operation:', error);
        res.status(500).json({ error: error.message });
    }
};