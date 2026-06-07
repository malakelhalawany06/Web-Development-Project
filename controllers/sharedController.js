// controllers/sharedController.js
import multer from 'multer';  
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../config/db.js';
import { createMaterial, getUserSharedMaterials } from '../models/SharedMaterial.js';
import { addSharedFile } from '../models/File.js';

const upload = multer({ storage: multer.memoryStorage() });
export const uploadMiddleware = upload.single('file');

// Get user's own shared materials (history)
export const getUserSharedMaterialsController = async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    
    try {
        const db = await connectToDatabase();
        const materials = await db.collection('shared_materials')
            .find({ uploadedBy: new ObjectId(req.session.userId) })
            .sort({ createdAt: -1 })
            .toArray();
        
        res.json(materials);
    } catch (error) {
        console.error('Error getting user shared materials:', error);
        res.status(500).json({ error: error.message });
    }
};

// Create a new shared material
export const createSharedMaterialController = async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    
    try {
        const { title, description, course, targetYear } = req.body;
        const uploadedFile = req.file;
        
        console.log('=== UPLOAD DEBUG ===');
        console.log('Title:', title);
        console.log('File received:', uploadedFile ? 'YES' : 'NO');
        
        if (!uploadedFile) {
            console.error('ERROR: No file uploaded!');
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        console.log('File name:', uploadedFile.originalname);
        console.log('File size:', uploadedFile.size);
        console.log('File type:', uploadedFile.mimetype);
        console.log('File buffer length:', uploadedFile.buffer?.length);
        
        const db = await connectToDatabase();
        
        // Check if user is instructor or student
        let user = await db.collection('instructors').findOne({ 
            _id: new ObjectId(req.session.userId) 
        });
        
        let userType = 'student';
        let academicYear = null;
        
        if (user) {
            userType = 'instructor';
        } else {
            user = await db.collection('students').findOne({ 
                _id: new ObjectId(req.session.userId) 
            });
            if (user) {
                userType = 'student';
                academicYear = user.academic_year;
            }
        }
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const userMajor = user.major || 'Computer Science';
        
        // For instructors, use targetYear; for students, use their own year
        const targetYearForFilter = userType === 'instructor' 
            ? (targetYear === 'all' ? null : parseInt(targetYear))
            : (academicYear || 0);
        
        function getFileIconFromName(fileName) {
            if (!fileName) return '📄';
            const ext = fileName.split('.').pop().toLowerCase();
            if (ext === 'pdf') return '📘';
            if (ext === 'zip') return '🗂️';
            if (ext === 'docx' || ext === 'doc') return '📄';
            return '📄';
        }
        
        // Get the file buffer correctly
        const fileBuffer = uploadedFile.buffer;
        
        // Save to notes_files collection with actual file data
        const fileData = {
            title: title,
            description: description || '',
            fileName: uploadedFile.originalname,
            fileSize: (uploadedFile.size / 1024 / 1024).toFixed(1) + ' MB',
            fileIcon: getFileIconFromName(uploadedFile.originalname),
            fileType: uploadedFile.mimetype,
            fileData: fileBuffer,  // Use the buffer variable
            course: course || 'General',
            sharedBy: user.name,
            sharedById: req.session.userId,
            sharedByMajor: userMajor,
            sharedByYear: targetYearForFilter,
            isShared: true,
            createdAt: new Date()
        };
        
        console.log('Saving file with data:', {
            fileName: fileData.fileName,
            fileSize: fileData.fileSize,
            fileType: fileData.fileType,
            fileDataLength: fileData.fileData?.length
        });
        
        const result = await db.collection('notes_files').insertOne(fileData);
        
        // Also save to shared_materials collection for history
        await db.collection('shared_materials').insertOne({
            title: title,
            description: description || '',
            fileName: uploadedFile.originalname,
            fileSize: (uploadedFile.size / 1024 / 1024).toFixed(1) + ' MB',
            fileIcon: getFileIconFromName(uploadedFile.originalname),
            uploadedBy: req.session.userId,
            uploadedByName: user.name,
            uploadedByMajor: userMajor,
            uploadedByYear: targetYearForFilter,
            course: course || 'General',
            createdAt: new Date()
        });
        
        console.log('File saved successfully with ID:', result.insertedId);
        res.status(201).json({ success: true, id: result.insertedId });
        
    } catch (error) {
        console.error('Error creating shared material:', error);
        res.status(500).json({ error: error.message });
    }
};