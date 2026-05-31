// models/File.js
import { connectToDatabase } from '../config/db.js';
import { ObjectId } from 'mongodb';

const COLLECTION = 'notes_files';

/**
 * Create a new file/note
 */
export async function createFile(fileData) {
    const db = await connectToDatabase();
    
    const newFile = {
        title: fileData.title,
        description: fileData.description || '',
        fileName: fileData.fileName,
        fileSize: fileData.fileSize,
        fileIcon: fileData.fileIcon || '📄',
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
    
    const result = await db.collection(COLLECTION).deleteOne({
        _id: new ObjectId(fileId),
        uploadedBy: new ObjectId(userId) // Only owner can delete
    });
    
    return result;
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