// routes/subjectRoutes.js
import express from 'express';
import { getSubjectsByMajorAndYear, getAllSubjectsByMajor } from '../models/Subject.js';

const router = express.Router();

// Get subjects by major and academic year
router.get('/', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    
    try {
        const { major, year } = req.query;
        
        if (!major) {
            return res.status(400).json({ error: 'Major is required' });
        }
        
        console.log('Subjects API called with:', { major, year });
        
        let subjects;
        // Check if year exists and is not empty, undefined, or 'null'
        if (year && year !== 'undefined' && year !== 'null' && year !== '') {
            // Convert year to integer
            const yearNum = parseInt(year);
            subjects = await getSubjectsByMajorAndYear(major, yearNum);
        } else {
            // For instructors or when no year specified, get all subjects
            const allSubjects = await getAllSubjectsByMajor(major);
            subjects = allSubjects.flatMap(y => y.subjects);
            subjects = [...new Set(subjects)]; // Remove duplicates
        }
        
        console.log(`Returning ${subjects.length} subjects for ${major}${year ? ' year ' + year : ''}`);
        res.json(subjects);
    } catch (error) {
        console.error('Error getting subjects:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;