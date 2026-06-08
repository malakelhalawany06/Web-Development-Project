// models/Group.js
import { connectToDatabase } from '../config/db.js';
import { ObjectId } from 'mongodb';

const COLLECTION = 'study_groups';

export async function createGroup(groupData) {
    const db = await connectToDatabase();
    
    // Get the creator's details from students collection
    const creator = await db.collection('students').findOne({ 
        _id: new ObjectId(groupData.createdBy) 
    });
    
    const newGroup = {
        name: groupData.name,
        course: groupData.course,
        category: groupData.category,
        description: groupData.description,
        createdBy: new ObjectId(groupData.createdBy),
        createdByName: creator?.name || 'Unknown',
        major: creator?.major || 'Computer Science',
        academic_year: creator?.academic_year || null,  // ← ADD THIS FIELD
        members: [new ObjectId(groupData.createdBy)],
        memberNames: [creator?.name || 'Unknown'],
        status: 'active',
        memberCount: 1,
        resourceCount: 0,
        messageCount: 0,
        messages: [],
        resources: [],
        createdAt: new Date(),
        updatedAt: new Date()
    };
    
    const result = await db.collection('study_groups').insertOne(newGroup);
    return { _id: result.insertedId, ...newGroup };
}

export async function getUserGroups(userId) {
    const db = await connectToDatabase();
    
    // Get the user's details
    const user = await db.collection('students').findOne({ 
        _id: new ObjectId(userId) 
    });
    
    if (!user) return [];
    
    const userMajor = user.major || 'Computer Science';
    const userYear = user.academic_year;
    
    // Get groups the user is a member of (always show regardless of year)
    const myGroups = await db.collection('study_groups').find({
        members: new ObjectId(userId)
    }).toArray();
    
    // Get available groups: same major AND same academic_year, and not a member
    const availableGroups = await db.collection('study_groups').find({
        major: userMajor,
        academic_year: userYear,  // ← ADD YEAR FILTER
        members: { $ne: new ObjectId(userId) }
    }).toArray();
    
    // Combine both, marking status
    const allGroups = [
        ...myGroups.map(g => ({ ...g, status: 'joined' })),
        ...availableGroups.map(g => ({ ...g, status: 'available' }))
    ];
    
    return allGroups;
}

export async function joinGroup(groupId, userId) {
    const db = await connectToDatabase();
    
    // Get user's name
    const user = await db.collection('students').findOne({ 
        _id: new ObjectId(userId) 
    });
    
    // First, ensure messages and resources arrays exist
    await db.collection('study_groups').updateOne(
        { _id: new ObjectId(groupId) },
        { 
            $setOnInsert: { 
                messages: [], 
                resources: [] 
            }
        }
    );
    
    // Then add the member
    const result = await db.collection('study_groups').updateOne(
        { _id: new ObjectId(groupId) },
        { 
            $addToSet: { 
                members: new ObjectId(userId),
                memberNames: user?.name || 'Unknown'
            },
            $inc: { memberCount: 1 }
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

export async function getGroupById(groupId) {
    const db = await connectToDatabase();
    const group = await db.collection('study_groups').findOne({ 
        _id: new ObjectId(groupId) 
    });
    
    // Ensure messages and resources arrays exist
    if (!group.messages) group.messages = [];
    if (!group.resources) group.resources = [];
    
    return group;
}