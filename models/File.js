// models/File.js - CLEANED VERSION
import { connectToDatabase } from '../config/db.js';
import { ObjectId } from 'mongodb';

const COLLECTION = 'notes_files';

/**
 * Get a single file by ID
 */
export async function getFileById(fileId) {
    const db = await connectToDatabase();
    
    const file = await db.collection(COLLECTION).findOne({
        _id: new ObjectId(fileId)
    });
    
    return file;
}

/**
 * Get file data for download
 */
export async function getFileData(fileId) {
    const db = await connectToDatabase();
    
    const file = await db.collection(COLLECTION).findOne({
        _id: new ObjectId(fileId)
    });
    
    return file;
}

/**
 * Delete or hide a file based on ownership
 */
export async function deleteFile(fileId, userId) {
    const db = await connectToDatabase();
    
    // Get the file
    const file = await db.collection('notes_files').findOne({ 
        _id: new ObjectId(fileId) 
    });
    
    if (!file) {
        throw new Error('File not found');
    }
    
    // Check if user is the owner
    const isOwner = file.sharedById?.toString() === userId;
    
    if (isOwner) {
        // OWNER: Permanently delete from database
        
        // 1. Clean up any hide records for this file
        await db.collection('hidden_files').deleteMany({
            fileId: new ObjectId(fileId)
        });
        
        // 2. Delete the actual file from notes_files
        const result = await db.collection('notes_files').deleteOne({ 
            _id: new ObjectId(fileId) 
        });
        
        return result;
        
    } else {
        // NON-OWNER: Just hide from their view
        
        // Check if already hidden
        const existing = await db.collection('hidden_files').findOne({
            fileId: new ObjectId(fileId),
            userId: new ObjectId(userId)
        });
        
        if (existing) {
            throw new Error('File already hidden');
        }
        
        // Add to hidden_files collection
        const result = await db.collection('hidden_files').insertOne({
            fileId: new ObjectId(fileId),
            userId: new ObjectId(userId),
            hiddenAt: new Date()
        });
        
        return result;
    }
}

/**
 * Add a shared file (from Shared Materials page)
 */
export async function addSharedFile(fileData) {
    const db = await connectToDatabase();
    
    const yearNum = fileData.sharedByYear ? parseInt(fileData.sharedByYear) : null;
    
    const newFile = {
        title: fileData.title,
        description: fileData.description || '',
        fileName: fileData.fileName,
        fileSize: fileData.fileSize,
        fileIcon: fileData.fileIcon || '📄',
        fileType: fileData.fileType || '',        
        fileData: fileData.fileData || null,   
        course: fileData.course,
        sharedBy: fileData.sharedBy,
        sharedById: new ObjectId(fileData.sharedById),
        sharedByMajor: fileData.sharedByMajor,
        sharedByYear: yearNum,
        isInstructor: fileData.isInstructor || false,
        isShared: true,
        createdAt: new Date(),
        updatedAt: new Date()
    };
    
    const result = await db.collection(COLLECTION).insertOne(newFile);
    return { id: result.insertedId, ...newFile };
}

/**
 * Get files filtered by major and academic year
 * (Used for shared materials page)
 */
export async function getFilesByMajorAndYear(major, academicYear) {
    const db = await connectToDatabase();
    
    const targetYear = parseInt(academicYear);
    const files = await db.collection('notes_files')
        .find({ 
            sharedByMajor: major,
            $or: [
                // Student files: exact year match
                { sharedByYear: targetYear, isInstructor: { $ne: true } },
                // Instructor files targeting this specific year
                { sharedByYear: targetYear, isInstructor: true },
                // Instructor files targeting all years
                { sharedByYear: null, isInstructor: true }
            ]
        })
        .sort({ createdAt: -1 })
        .toArray();
    
    return files;
}

/**
 * Get files for instructor (by major, no year filter)
 */
export async function getInstructorFiles(major, userId) {
    const db = await connectToDatabase();
    
    // Get hidden files for this instructor
    const hiddenFiles = await db.collection('hidden_files')
        .find({ userId: new ObjectId(userId) })
        .toArray();
    
    const hiddenFileIds = hiddenFiles.map(h => h.fileId);
    
    const files = await db.collection('notes_files')
        .find({ 
            sharedByMajor: major,
            _id: { $nin: hiddenFileIds }
        })
        .sort({ createdAt: -1 })
        .toArray();
    
    return files;
}