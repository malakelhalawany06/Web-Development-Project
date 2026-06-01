// models/SharedMaterial.js
import { connectToDatabase } from '../config/db.js';
import { ObjectId } from 'mongodb';

const COLLECTION = 'shared_materials';

export async function createMaterial(materialData) {
    const db = await connectToDatabase();
    
    const newMaterial = {
        title: materialData.title,
        description: materialData.description,
        fileName: materialData.fileName || '',
        fileSize: materialData.fileSize || '',
        fileIcon: materialData.fileIcon || '📄',
        uploadedBy: new ObjectId(materialData.uploadedBy),
        uploadedByName: materialData.uploadedByName,
        uploadedByMajor: materialData.uploadedByMajor,
        uploadedByYear: materialData.uploadedByYear,
        course: materialData.course,
        createdAt: new Date(),
        updatedAt: new Date()
    };
    
    const result = await db.collection(COLLECTION).insertOne(newMaterial);
    return { _id: result.insertedId, ...newMaterial };
}

export async function getUserSharedMaterials(userId) {
    const db = await connectToDatabase();
    
    const materials = await db.collection(COLLECTION)
        .find({ uploadedBy: new ObjectId(userId) })
        .sort({ createdAt: -1 })
        .toArray();
    
    return materials;
}

export async function getAllMaterials() {
    const db = await connectToDatabase();
    
    const materials = await db.collection(COLLECTION)
        .find({})
        .sort({ createdAt: -1 })
        .toArray();
    
    return materials;
}

export async function getMaterialsByMajor(major) {
    const db = await connectToDatabase();
    
    const materials = await db.collection(COLLECTION)
        .find({ uploadedByMajor: major })
        .sort({ createdAt: -1 })
        .toArray();
    
    return materials;
}

export async function getMaterialsByMajorAndYear(major, academicYear) {
    const db = await connectToDatabase();
    
    const materials = await db.collection(COLLECTION)
        .find({ 
            uploadedByMajor: major,
            uploadedByYear: parseInt(academicYear)
        })
        .sort({ createdAt: -1 })
        .toArray();
    
    return materials;
}

export async function addComment(materialId, commentData) {
    const db = await connectToDatabase();
    
    const newComment = {
        _id: new ObjectId(),
        author: commentData.author,
        authorId: new ObjectId(commentData.authorId),
        authorAvatar: commentData.authorAvatar,
        text: commentData.text,
        time: new Date()
    };
    
    const result = await db.collection(COLLECTION).updateOne(
        { _id: new ObjectId(materialId) },
        { $push: { comments: newComment } }
    );
    
    return result;
}

export default { createMaterial, getUserSharedMaterials, getAllMaterials, getMaterialsByMajor, getMaterialsByMajorAndYear, addComment };