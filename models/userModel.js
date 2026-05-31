// models/userModel.js
import { connectToDatabase } from '../config/db.js';
import { ObjectId } from 'mongodb';

// The list of valid collections we search through or validate against
const COLLECTIONS = ['students', 'instructors', 'admins'];

/**
 * READ (Find by Email)
 * Loops through the collection array to look for the user. 
 * Automatically attaches the 'role' based on where they were found.
 */
export async function findByEmail(email) {
    const db = await connectToDatabase();
    
    for (const colName of COLLECTIONS) {
        const user = await db.collection(colName).findOne({
            $or: [
                { email: email },
                { mail: email }
            ]
        });
        
        if (user) {
            // CRITICAL: We pass back the collection name as their role 
            // so app.js knows exactly who logged in!
            return { ...user, role: colName };
        }
    }
    return null; // Return null if found nowhere
}

/**
 * READ (Find by ID)
 * Since IDs are unique across your cluster, we scan the collections until we hit a match.
 */
/*export async function findById(userId) {
    const db = await connectToDatabase();
    
    for (const colName of COLLECTIONS) {
        const user = await db.collection(colName).findOne({ _id: new ObjectId(userId) });
        if (user) {
            return { ...user, role: colName };
        }
    }
    return null;
}*/
// Ensure this is your findById structure in models/userModel.js
export async function findById(id) {
    if (!id) return null;
    const db = await connectToDatabase();
    
    // Check all collections cleanly to verify who this unique ID belongs to
    let user = await db.collection('students').findOne({ _id: new ObjectId(id) });
    if (!user) user = await db.collection('instructors').findOne({ _id: new ObjectId(id) });
    if (!user) user = await db.collection('admins').findOne({ _id: new ObjectId(id) });
    
    return user;
}
/**
 * CREATE
 * Requires an explicit collection target (e.g., 'students', 'instructors', 'admins')
 * Usage example: createUser('students', { name: "John", email: "..." })
 */
export async function createUser(collectionName, userData) {
    if (!COLLECTIONS.includes(collectionName)) {
        throw new Error(`Invalid collection specified: ${collectionName}`);
    }
    
    const db = await connectToDatabase();
    const result = await db.collection(collectionName).insertOne({
        ...userData,
        createdAt: new Date()
    });
    return { id: result.insertedId, ...userData, role: collectionName };
}

/**
 * UPDATE
 * Requires both the collection target and the user ID to pinpoint the precise record.
 */
export async function updateUser(collectionName, userId, updates) {
    if (!COLLECTIONS.includes(collectionName)) {
        throw new Error(`Invalid collection specified: ${collectionName}`);
    }

    const db = await connectToDatabase();
    return db.collection(collectionName).updateOne(
        { _id: new ObjectId(userId) },
        { $set: { ...updates, updatedAt: new Date() } }
    );
}

/**
 * DELETE
 * Requires both the collection target and the user ID.
 */
export async function deleteUser(collectionName, userId) {
    if (!COLLECTIONS.includes(collectionName)) {
        throw new Error(`Invalid collection specified: ${collectionName}`);
    }

    const db = await connectToDatabase();
    return db.collection(collectionName).deleteOne({ _id: new ObjectId(userId) });
}
// Add this helper function inside models/userModel.js
export async function findByUsername(username) {
    const db = await connectToDatabase();
    const collections = ['students', 'instructors', 'admins'];
    
    for (const colName of collections) {
        const user = await db.collection(colName).findOne({ username: username.trim() });
        if (user) {
            return { ...user, role: colName };
        }
    }
    return null;
}