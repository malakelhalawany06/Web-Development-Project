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
        uploadedBy: new ObjectId(userId)
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

/**
 * Add a shared file (from Shared Materials page)
 */
// models/File.js - Make sure addSharedFile saves year as number
export async function addSharedFile(fileData) {
    const db = await connectToDatabase();
    
    // Ensure year is a number
    const yearNum = parseInt(fileData.sharedByYear);
    
    console.log(`💾 Saving shared file:`);
    console.log(`   - Title: ${fileData.title}`);
    console.log(`   - SharedBy: ${fileData.sharedBy}`);
    console.log(`   - Major: ${fileData.sharedByMajor}`);
    console.log(`   - Year: ${yearNum} (${typeof yearNum})`);
    
    const newFile = {
        title: fileData.title,
        description: fileData.description || '',
        fileName: fileData.fileName,
        fileSize: fileData.fileSize,
        fileIcon: fileData.fileIcon || '📄',
        course: fileData.course,
        sharedBy: fileData.sharedBy,
        sharedById: new ObjectId(fileData.sharedById),
        sharedByMajor: fileData.sharedByMajor,
        sharedByYear: yearNum,  // Save as number, not string
        isShared: true,
        createdAt: new Date(),
        updatedAt: new Date()
    };
    
    const result = await db.collection(COLLECTION).insertOne(newFile);
    console.log(`✅ File saved with ID: ${result.insertedId}`);
    
    return { id: result.insertedId, ...newFile };
}
/**
 * Get files filtered by major AND academic year (for Notes & Files page)
 */
// models/File.js - Make sure this function is correct
export async function getFilesByMajorAndYear(major, academicYear) {
    const db = await connectToDatabase();
    
    // Convert to number and handle both string and number inputs
    const targetYear = parseInt(academicYear);
    
    console.log(`🔍 Looking for files with:`);
    console.log(`   - sharedByMajor: "${major}"`);
    console.log(`   - sharedByYear: ${targetYear} (${typeof targetYear})`);
    
    // Query with exact match
    const files = await db.collection(COLLECTION)
        .find({ 
            sharedByMajor: major,
            sharedByYear: targetYear
        })
        .sort({ createdAt: -1 })
        .toArray();
    
    console.log(`📁 Found ${files.length} files for ${major} year ${targetYear}`);
    
    // Also log all files in collection for debugging
    const allFiles = await db.collection(COLLECTION).find({}).toArray();
    console.log(`📊 Total files in notes_files: ${allFiles.length}`);
    
    if (allFiles.length > 0) {
        console.log('📄 Sample file:', JSON.stringify({
            title: allFiles[0].title,
            sharedByMajor: allFiles[0].sharedByMajor,
            sharedByYear: allFiles[0].sharedByYear,
            yearType: typeof allFiles[0].sharedByYear
        }, null, 2));
    }
    
    return files;
}

/**
 * Get user's own uploaded files (for Shared Materials history)
 */
export async function getUserUploadedFiles(userId) {
    const db = await connectToDatabase();
    
    const files = await db.collection(COLLECTION).find({
        uploadedBy: new ObjectId(userId)
    }).sort({ createdAt: -1 }).toArray();
    
    return files;
}