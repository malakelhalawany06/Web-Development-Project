// routes/fileRoutes.js
import express from 'express';
import { 
    createFile, 
    getUserFiles, 
    deleteFile,
    shareFile,
    getFileById,
    getFilesByMajorAndYear  // Add this new import
} from '../models/File.js';
import { connectToDatabase } from '../config/db.js';
import { ObjectId } from 'mongodb';

const router = express.Router();

// Get user's files
router.get('/', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    
    try {
        const files = await getUserFiles(req.session.userId);
        res.json(files);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Get files for instructors (filtered by their major)
router.get('/instructor', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    
    try {
        const db = await connectToDatabase();
        
        // Get instructor from instructors collection
        let instructor = await db.collection('instructors').findOne({ 
            _id: new ObjectId(req.session.userId) 
        });
        
        // If not found in instructors, check students (for debugging)
        if (!instructor) {
            instructor = await db.collection('students').findOne({ 
                _id: new ObjectId(req.session.userId) 
            });
        }
        
        console.log('Instructor found:', instructor?.name);
        console.log('Instructor major:', instructor?.major);
        console.log('Instructor subject:', instructor?.subject);
        
        // Try multiple ways to get the instructor's subject/major
        let instructorMajor = instructor?.major || instructor?.subject || instructor?.department;
        
        // If still no major, try to get from the courses they teach
        if (!instructorMajor && instructor?.subject) {
            instructorMajor = instructor.subject;
        }
        
        console.log('Using major for filtering:', instructorMajor);
        
        // If no major found, return empty array
        if (!instructorMajor) {
            console.log('⚠️ No major found for instructor, returning empty array');
            return res.json([]);
        }
        
        // Find files where sharedByMajor matches instructor's major
        // Also include files where course name matches the instructor's subject
        const files = await db.collection('notes_files')
            .find({
                $or: [
                    { sharedByMajor: instructorMajor },
                    { course: { $regex: instructorMajor, $options: 'i' } }
                ]
            })
            .sort({ createdAt: -1 })
            .toArray();
        
        console.log(`📤 Returning ${files.length} files for instructor ${instructor?.name}`);
        
        res.json(files);
    } catch (error) {
        console.error('Error getting instructor files:', error);
        res.status(500).json({ error: error.message });
    }
});
router.get('/shared', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    
    try {
        const db = await connectToDatabase();
        
        // Get current user from students collection
        const user = await db.collection('students').findOne({ 
            _id: new ObjectId(req.session.userId) 
        });
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        console.log('\n👤 User requesting shared files:');
        console.log(`   - Name: ${user.name}`);
        console.log(`   - Major: ${user.major}`);
        console.log(`   - Year: ${user.academic_year} (${typeof user.academic_year})`);
        
        // Get files shared by users with same major AND same academic year
        const files = await getFilesByMajorAndYear(user.major, user.academic_year);
        
        console.log(`📤 Returning ${files.length} files to ${user.name}\n`);
        
        res.json(files);
    } catch (error) {
        console.error('Error getting shared files:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get single file by ID
router.get('/:id', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    
    try {
        const file = await getFileById(req.params.id);
        if (!file) return res.status(404).json({ error: 'File not found' });
        res.json(file);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create a new file
router.post('/', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    
    try {
        const file = await createFile({
            ...req.body,
            uploadedBy: req.session.userId
        });
        res.status(201).json(file);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a file
router.delete('/:id', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    
    try {
        await deleteFile(req.params.id, req.session.userId);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Share a file with another user
router.post('/:id/share', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    
    try {
        const { email } = req.body;
        await shareFile(req.params.id, email);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;