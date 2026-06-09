// controllers/sharedController.js 
import multer from 'multer';  
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../config/db.js';
import { createMaterial, getUserSharedMaterials } from '../models/SharedMaterial.js';

const upload = multer({ storage: multer.memoryStorage() });
export const uploadMiddleware = upload.single('file');

// Get user's own shared materials (history) 
export const getUserSharedMaterialsController = async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    
    try {
        // ✅ Use the model function instead of direct query
        const materials = await getUserSharedMaterials(req.session.userId);
        
        console.log(`Found ${materials.length} shared materials`);
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
        
        if (!uploadedFile) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
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
        
        // 1. Save to notes_files (for file storage and display)
        const fileData = {
            title: title,
            description: description || '',
            fileName: uploadedFile.originalname,
            fileSize: (uploadedFile.size / 1024 / 1024).toFixed(1) + ' MB',
            fileIcon: getFileIconFromName(uploadedFile.originalname),
            fileType: uploadedFile.mimetype,
            fileData: uploadedFile.buffer,
            course: course || 'General',
            sharedBy: user.name,
            sharedById: req.session.userId,
            sharedByMajor: userMajor,
            sharedByYear: targetYearForFilter,
            isShared: true,
            createdAt: new Date()
        };
        
        const result = await db.collection('notes_files').insertOne(fileData);
        
        // 2. Save to shared_materials (for history)
        await createMaterial({
            title: title,
            description: description || '',
            fileName: uploadedFile.originalname,
            fileSize: (uploadedFile.size / 1024 / 1024).toFixed(1) + ' MB',
            fileIcon: getFileIconFromName(uploadedFile.originalname),
            uploadedBy: req.session.userId,
            uploadedByName: user.name,
            uploadedByMajor: userMajor,
            uploadedByYear: targetYearForFilter,
            course: course || 'General'
        });
        
        console.log('File saved successfully with ID:', result.insertedId);
        res.status(201).json({ success: true, id: result.insertedId });
        
    } catch (error) {
        console.error('Error creating shared material:', error);
        res.status(500).json({ error: error.message });
    }
};