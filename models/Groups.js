// models/Group.js
import { connectToDatabase } from '../config/db.js';
import { ObjectId } from 'mongodb';

const COLLECTION = 'study_groups';

/**
 * Create a new study group
 */
export async function createGroup(groupData) {
    const db = await connectToDatabase();
    
    const newGroup = {
        name: groupData.name,
        course: groupData.course,
        category: groupData.category,
        description: groupData.description,
        createdBy: new ObjectId(groupData.createdBy),
        members: [new ObjectId(groupData.createdBy)],
        resources: [],
        messages: [],
        status: 'active',
        memberCount: 1,
        resourceCount: 0,
        messageCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
    };
    
    const result = await db.collection(COLLECTION).insertOne(newGroup);
    return { id: result.insertedId, ...newGroup };
}

/**
 * Get groups for a specific user (groups they are a member of)
 */
export async function getUserGroups(userId) {
    const db = await connectToDatabase();
    
    const groups = await db.collection(COLLECTION).find({
        members: new ObjectId(userId)
    }).toArray();
    
    return groups;
}

/**
 * Get all available groups (groups user is not a member of)
 */
export async function getAvailableGroups(userId) {
    const db = await connectToDatabase();
    
    const groups = await db.collection(COLLECTION).find({
        members: { $ne: new ObjectId(userId) }
    }).toArray();
    
    return groups;
}

/**
 * Get a single group by ID
 */
export async function getGroupById(groupId) {
    const db = await connectToDatabase();
    
    const group = await db.collection(COLLECTION).findOne({
        _id: new ObjectId(groupId)
    });
    
    return group;
}

/**
 * Join a group
 */
export async function joinGroup(groupId, userId) {
    const db = await connectToDatabase();
    
    const result = await db.collection(COLLECTION).updateOne(
        { _id: new ObjectId(groupId) },
        { 
            $addToSet: { members: new ObjectId(userId) },
            $inc: { memberCount: 1 }
        }
    );
    
    return result;
}

/**
 * Leave a group
 */
export async function leaveGroup(groupId, userId) {
    const db = await connectToDatabase();
    
    const result = await db.collection(COLLECTION).updateOne(
        { _id: new ObjectId(groupId) },
        { 
            $pull: { members: new ObjectId(userId) },
            $inc: { memberCount: -1 }
        }
    );
    
    return result;
}

/**
 * Add a resource to a group
 */
export async function addResource(groupId, resourceData, userId) {
    const db = await connectToDatabase();
    
    const newResource = {
        name: resourceData.name,
        url: resourceData.url || '',
        uploadedBy: new ObjectId(userId),
        uploadedAt: new Date()
    };
    
    const result = await db.collection(COLLECTION).updateOne(
        { _id: new ObjectId(groupId) },
        { 
            $push: { resources: newResource },
            $inc: { resourceCount: 1 }
        }
    );
    
    return result;
}

/**
 * Add a message to a group chat
 */
export async function addMessage(groupId, messageData, userId) {
    const db = await connectToDatabase();
    
    const newMessage = {
        text: messageData.text,
        sender: new ObjectId(userId),
        time: new Date()
    };
    
    const result = await db.collection(COLLECTION).updateOne(
        { _id: new ObjectId(groupId) },
        { 
            $push: { messages: newMessage },
            $inc: { messageCount: 1 }
        }
    );
    
    return result;
}