// models/userModel.js
import { connectToDatabase } from '../config/db.js';  // ← changed path
import { ObjectId } from 'mongodb';

const COLLECTION = 'users';

export async function findByEmail(email) {
    const db = await connectToDatabase();
    return db.collection(COLLECTION).findOne({ email });
}

export async function findById(userId) {
    const db = await connectToDatabase();
    return db.collection(COLLECTION).findOne({ _id: new ObjectId(userId) });
}

export async function createUser(userData) {
    const db = await connectToDatabase();
    const result = await db.collection(COLLECTION).insertOne(userData);
    return { id: result.insertedId, ...userData };
}

export async function updateUser(userId, updates) {
    const db = await connectToDatabase();
    return db.collection(COLLECTION).updateOne(
        { _id: new ObjectId(userId) },
        { $set: { ...updates, updatedAt: new Date() } }
    );
}

export async function deleteUser(userId) {
    const db = await connectToDatabase();
    return db.collection(COLLECTION).deleteOne({ _id: new ObjectId(userId) });
}