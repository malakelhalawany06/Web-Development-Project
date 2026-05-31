// models/Group.js
import { connectToDatabase } from '../config/db.js';
import { ObjectId } from 'mongodb';

const COLLECTION = 'study_groups';

export async function createGroup(groupData) {
    const db = await connectToDatabase();
    
    const newGroup = {
        name: groupData.name,
        course: groupData.course,
        category: groupData.category,
        description: groupData.description,
        createdBy: new ObjectId(groupData.createdBy),
        members: [new ObjectId(groupData.createdBy)],
        status: 'joined',
        memberCount: 1,
        resourceCount: 0,
        messageCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
    };
    
    const result = await db.collection(COLLECTION).insertOne(newGroup);
    return { _id: result.insertedId, ...newGroup };
}

export async function getUserGroups(userId) {
    const db = await connectToDatabase();
    
    const groups = await db.collection(COLLECTION).find({
        members: new ObjectId(userId)
    }).toArray();
    
    return groups;
}

export async function joinGroup(groupId, userId) {
    const db = await connectToDatabase();
    
    const result = await db.collection(COLLECTION).updateOne(
        { _id: new ObjectId(groupId) },
        { 
            $addToSet: { members: new ObjectId(userId) },
            $inc: { memberCount: 1 },
            $set: { status: 'joined' }
        }
    );
    
    return result;
}

export async function leaveGroup(groupId, userId) {
    const db = await connectToDatabase();
    
    const result = await db.collection(COLLECTION).updateOne(
        { _id: new ObjectId(groupId) },
        { 
            $pull: { members: new ObjectId(userId) },
            $inc: { memberCount: -1 },
            $set: { status: 'available' }
        }
    );
    
    return result;
}