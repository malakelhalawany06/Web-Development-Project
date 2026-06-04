// controllers/sharedController.js
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../config/db.js';
import { createMaterial, getUserSharedMaterials } from '../models/SharedMaterial.js';
import { addSharedFile } from '../models/File.js';

// Get user's own shared materials (history)
export const getUserSharedMaterialsController = async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    
    try {
        const materials = await getUserSharedMaterials(req.session.userId);
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
        const { title, description, fileName, fileSize, fileIcon, course, targetYear } = req.body;
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
        
        // Save to shared materials collection (history)
        const material = await createMaterial({
            title: title,
            description: description || '',
            fileName: fileName || '',
            fileSize: fileSize || '',
            fileIcon: fileIcon || '📄',
            uploadedBy: req.session.userId,
            uploadedByName: user.name,
            uploadedByMajor: userMajor,
            uploadedByYear: targetYearForFilter,
            course: course || 'General'
        });
        
        // Save to notes_files collection
        await addSharedFile({
            title: title,
            description: description || '',
            fileName: fileName || '',
            fileSize: fileSize || '',
            fileIcon: fileIcon || '📄',
            course: course || 'General',
            sharedBy: user.name,
            sharedById: req.session.userId,
            sharedByMajor: userMajor,
            sharedByYear: targetYearForFilter,
            isInstructor: userType === 'instructor'
        });
        
        res.status(201).json(material);
    } catch (error) {
        console.error('Error creating shared material:', error);
        res.status(500).json({ error: error.message });
    }
};