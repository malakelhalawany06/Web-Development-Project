import nodemailer from 'nodemailer';

// Create a reusable transporter using the system's SMTP configuration
const transporter = nodemailer.createTransport({
    service: 'gmail', // You can swap this out for Outlook, SendGrid, etc.
    auth: {
        user: process.env.EMAIL_USER, // Your system email address
        pass: process.env.EMAIL_PASS  // Your system app password
    }
});

/**
 * Dispatches a formal greeting notification to a newly registered account
 * @param {string} toEmail - The recipient's destination mailbox address
 * @param {string} userName - The recipient's personal identity moniker
 */
export async function sendWelcomeEmail(toEmail, userName) {
    const mailOptions = {
        from: `"LoomHub Team" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: `Welcome to LoomHub, ${userName}! 🚀`,
        // Text fallback version
        text: `Hey ${userName}, welcome to LoomHub! We're absolutely thrilled to have you join our community. Log in to check out your new dashboard!`,
        // Rich HTML email content design layout
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h2 style="color: #3b82f6; margin-bottom: 20px;">Welcome to LoomHub, ${userName}! 🚀</h2>
                <p style="font-size: 16px; line-height: 1.6; color: #334155;">
                    We're absolutely thrilled to have you join our community. Whether you're here to manage your daily course load, keep track of upcoming assignments, or collaborate seamlessly with your instructors, LoomHub is built to streamline your academic journey and keep everything you need organized in one clean dashboard.
                </p>
                <p style="font-size: 16px; line-height: 1.6; color: #334155;">
                    Take a second to explore your profile, upload your custom profile picture, and dive right into your courses!
                </p>
                <div style="margin: 30px 0; text-align: center;">
                    <a href="http://localhost:3000/login" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Go to Your Dashboard</a>
                </div>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin-top: 30px;">
                <p style="font-size: 12px; color: #94a3b8; text-align: center;">This is an automated message from LoomHub. Please do not reply directly to this email.</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`[EMAIL SYSTEM]: Welcome notification successfully delivered to ${toEmail}`);
    } catch (error) {
        console.error('[EMAIL SYSTEM ERROR]: Failed to deliver onboarding notification:', error);
    }
}