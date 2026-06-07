// controllers/fileController.js
import { getUserFiles, getFilesByMajorAndYear, getFileById, deleteFile, shareFile, createFile, getFileData } from '../models/File.js';
import { connectToDatabase } from '../config/db.js';
import { ObjectId } from 'mongodb';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

// Get user's own files
export const getUserFilesController = async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    
    try {
        const files = await getUserFiles(req.session.userId);
        res.json(files);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get shared files (filtered by major and academic year)
export const getSharedFilesController = async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    
    try {
        const db = await connectToDatabase();
        const user = await db.collection('students').findOne({ 
            _id: new ObjectId(req.session.userId) 
        });
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const files = await getFilesByMajorAndYear(user.major, user.academic_year);
        res.json(files);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get instructor files (all files for instructor's major)
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
        
        const instructorMajor = instructor?.major || instructor?.department || 'Computer Science';
        
        const files = await db.collection('notes_files')
            .find({ sharedByMajor: instructorMajor })
            .sort({ createdAt: -1 })
            .toArray();
        
        res.json(files);
    } catch (error) {
        console.error('Error getting instructor files:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get file by ID
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

// controllers/fileController.js - FIXED downloadFileController
export const downloadFileController = async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    
    try {
        const file = await getFileData(req.params.id);
        
        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }
        
        // Check access
        const isOwner = file.uploadedBy?.toString() === req.session.userId;
        const isSharedWith = file.sharedWith?.some(id => id.toString() === req.session.userId);
        const isShared = file.isShared === true;
        
        if (!isOwner && !isSharedWith && !isShared) {
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
// Create a new file
export const createFileController = async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    
    try {
        const { title, description, course } = req.body;
        const uploadedFile = req.file;
        
        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }
        
        function getFileIconFromName(fileName) {
            if (!fileName) return '📄';
            const ext = fileName.split('.').pop().toLowerCase();
            if (ext === 'pdf') return '📘';
            if (ext === 'zip') return '🗂️';
            if (ext === 'docx' || ext === 'doc') return '📄';
            if (ext === 'jpg' || ext === 'png' || ext === 'jpeg') return '🖼️';
            return '📄';
        }
        
        const fileData = {
            title: title,
            description: description || '',
            fileName: uploadedFile ? uploadedFile.originalname : '',
            fileSize: uploadedFile ? (uploadedFile.size / 1024 / 1024).toFixed(1) + ' MB' : '',
            fileIcon: uploadedFile ? getFileIconFromName(uploadedFile.originalname) : '📄',
            fileType: uploadedFile ? uploadedFile.mimetype : '',
            fileData: uploadedFile ? uploadedFile.buffer : null,
            course: course || 'General',
            uploadedBy: req.session.userId
        };
        
        const file = await createFile(fileData);
        res.status(201).json(file);
    } catch (error) {
        console.error('Error creating file:', error);
        res.status(500).json({ error: error.message });
    }
};

// Delete a file
export const deleteFileController = async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    
    try {
        await deleteFile(req.params.id, req.session.userId);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Share a file with another user
export const shareFileController = async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Email is required' });
        
        const db = await connectToDatabase();
        const targetUser = await db.collection('students').findOne({ email: email });
        
        if (!targetUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        await shareFile(req.params.id, targetUser._id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};