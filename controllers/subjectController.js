// controllers/subjectController.js
import { getSubjectsByMajorAndYear, getAllSubjectsByMajor } from '../models/Subject.js';

// Get subjects (filtered by major and optional year)
export const getSubjectsController = async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    
    try {
        const { major, year } = req.query;
        
        if (!major) {
            return res.status(400).json({ error: 'Major is required' });
        }
        
        let subjects;
        if (year && year !== 'undefined' && year !== 'null' && year !== '') {
            const yearNum = parseInt(year, 10);
            subjects = await getSubjectsByMajorAndYear(major, yearNum);
        } else {
            const allSubjects = await getAllSubjectsByMajor(major);
            subjects = allSubjects.flatMap(y => y.subjects);
            subjects = [...new Set(subjects)];
        }
        
        res.json(subjects);
    } catch (error) {
        console.error('Error getting subjects:', error);
        res.status(500).json({ error: error.message });
    }
};