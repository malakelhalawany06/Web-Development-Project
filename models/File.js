// models/File.js
import { connectToDatabase } from '../config/db.js';
import { ObjectId } from 'mongodb';

const COLLECTION = 'notes_files';

/**
 * Create a new file/note
 */
// models/File.js - UPDATE the createFile function
export async function createFile(fileData) {
    const db = await connectToDatabase();
    
    const newFile = {
        title: fileData.title,
        description: fileData.description || '',
        fileName: fileData.fileName,
        fileSize: fileData.fileSize,
        fileIcon: fileData.fileIcon || '📄',
        fileType: fileData.fileType || '',        // ADD THIS
        fileData: fileData.fileData || null,      // ADD THIS - CRITICAL!
        course: fileData.course,
        uploadedBy: new ObjectId(fileData.uploadedBy),
        sharedWith: [],
        createdAt: new Date(),
        updatedAt: new Date()
    };
    
    const result = await db.collection(COLLECTION).insertOne(newFile);
    return { id: result.insertedId, ...newFile };
}

/**
 * Get files for a specific user (files they uploaded)
 */
export async function getUserFiles(userId) {
    const db = await connectToDatabase();
    
    const files = await db.collection(COLLECTION).find({
        uploadedBy: new ObjectId(userId)
    }).sort({ createdAt: -1 }).toArray();
    
    return files;
}

/**
 * Get all files (for shared materials page)
 */
export async function getAllFiles() {
    const db = await connectToDatabase();
    
    const files = await db.collection(COLLECTION).find({})
        .sort({ createdAt: -1 })
        .toArray();
    
    return files;
}

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
 * Delete a file
 */
export async function deleteFile(fileId, userId) {
    const db = await connectToDatabase();
    const oid = new ObjectId(userId);
    const uid = userId.toString();

    return db.collection('notes_files').deleteOne({
        _id: new ObjectId(fileId),
        $or: [
            { uploadedBy: oid },
            { uploadedBy: uid },
            { sharedById: oid },
            { sharedById: uid }
        ]
    });
}

/**
 * Share a file with another user
 */
export async function shareFile(fileId, targetUserId) {
    const db = await connectToDatabase();
    
    const result = await db.collection(COLLECTION).updateOne(
        { _id: new ObjectId(fileId) },
        { $addToSet: { sharedWith: new ObjectId(targetUserId) } }
    );
    
    return result;
}

/**
 * Get files shared with a user
 */
export async function getSharedFiles(userId) {
    const db = await connectToDatabase();
    
    const files = await db.collection(COLLECTION).find({
        sharedWith: new ObjectId(userId)
    }).sort({ createdAt: -1 }).toArray();
    
    return files;
}

/**
 * Add a shared file (from Shared Materials page)
 */
// models/File.js - Make sure addSharedFile saves year as number
// models/File.js - Update addSharedFile
export async function addSharedFile(fileData) {
    const db = await connectToDatabase();
    
    const yearNum = fileData.sharedByYear ? parseInt(fileData.sharedByYear) : null;
    
    const newFile = {
        title: fileData.title,
        description: fileData.description || '',
        fileName: fileData.fileName,
        fileSize: fileData.fileSize,
        fileIcon: fileData.fileIcon || '📄',
         fileType: fileData.fileType || '',        // ADD THIS
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
    
    const result = await db.collection('notes_files').insertOne(newFile);
    return { id: result.insertedId, ...newFile };
}
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
export async function getUserUploadedFiles(userId) {
    const db = await connectToDatabase();
    
    const files = await db.collection(COLLECTION).find({
        uploadedBy: new ObjectId(userId)
    }).sort({ createdAt: -1 }).toArray();
    
    return files;
}

export async function getFileData(fileId) {
    const db = await connectToDatabase();
    
    const file = await db.collection('notes_files').findOne({
        _id: new ObjectId(fileId)
    });
    
    return file;
}