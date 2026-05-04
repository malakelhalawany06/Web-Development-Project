// db.js
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.DB_URI;
let client;
let db;

async function connectToDatabase() {
    if (db) return db;
    
    try {
        client = new MongoClient(uri);
        await client.connect();
        console.log('Successfully connected to MongoDB');
        
        // Use the database name you want, e.g., 'myDatabase'
        db = client.db('myDatabase');
        return db;
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error;
    }
}

export { connectToDatabase };