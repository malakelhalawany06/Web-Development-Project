// config/db.js
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.DB_URI;
const dbName = process.env.DB_NAME;

let client;
let db;

if (!uri) throw new Error('DB_URI missing');
if (!dbName) throw new Error('DB_NAME missing');

export async function connectToDatabase() {
    if (db) return db;
    try {
        client = client = new MongoClient(uri);
// no extra TLS options needed
        await client.connect();
        console.log('✅ Connected to MongoDB');
        db = client.db(dbName);
        return db;
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        throw error;
    }
}

export async function closeDatabaseConnection() {
    if (client) {
        await client.close();
        db = null;
        client = null;
    }
}