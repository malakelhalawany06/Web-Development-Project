// models/Subject.js
import { connectToDatabase } from '../config/db.js';

export async function getSubjectsByMajorAndYear(major, academic_year) {
    const db = await connectToDatabase();
    
    console.log('Querying subjects for:', { major, academic_year });
    
    // Make sure academic_year is a number
    const yearNum = parseInt(academic_year, 10);
    
    const result = await db.collection('subjects').findOne({
        major: major,
        academic_year: yearNum
    });
    
    console.log('Query result:', result ? `Found ${result.subjects?.length} subjects` : 'No result');
    
    return result ? result.subjects : [];
}

export async function getAllSubjectsByMajor(major) {
    const db = await connectToDatabase();
    
    const results = await db.collection('subjects')
        .find({ major: major })
        .sort({ academic_year: 1 })
        .toArray();
    
    return results;
}