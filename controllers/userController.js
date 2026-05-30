import { findByUsername } from './models/userModel.js';
import bcrypt from 'bcrypt';

export async function loginUser(req, res) {
    try {
        const { username, password } = req.body;

        // Step 1: Check if the user exists in the database
        const user = await findByUsername(username);
        
        if (!user) {
            // Security Tip: Keep error messages generic so hackers don't know if the username exists
            return res.status(401).json({ message: "Invalid username or password" });
        }

        // Step 2: Check if the password matches
        // (bcrypt automatically extracts the salt from user.hashed_password to test your plain text password)
        const isPasswordMatch = await bcrypt.compare(password, user.hashed_password);

        if (!isPasswordMatch) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        // Success! The user exists and the password matches.
        return res.status(200).json({ 
            message: "Login successful!", 
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                email: user.mail
            }
        });

    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "An internal server error occurred" });
    }
}