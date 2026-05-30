import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);

async function addUser() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        
        const db = client.db('loomhub');
        const users = db.collection('users');
        
        // Generate a real bcrypt hash for password "123456"
        const password = '123456';
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);
        
        console.log('Generated hash for password "123456":', password_hash);
        
        // Check if user already exists
        const existing = await users.findOne({ email: 'ahmed@test.com' });
        if (existing) {
            console.log('User already exists, deleting old one...');
            await users.deleteOne({ email: 'ahmed@test.com' });
        }
        
        const newUser = {
            fullName: "Ahmed Khalid",
            email: "ahmed@test.com",
            password_hash: password_hash,
            major: "Computer Science",
            academicYear: "3",
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        const result = await users.insertOne(newUser);
        
        console.log('✅ User added successfully!');
        console.log('   Email: ahmed@test.com');
        console.log('   Password: 123456');
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await client.close();
    }
}

addUser();