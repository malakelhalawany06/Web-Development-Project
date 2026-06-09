import nodemailer from 'nodemailer';

// Create a reusable transporter using the system's SMTP configuration
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', // Explicitly use Gmail's direct SMTP host
    port: 465,              // Force the secure SSL port (Render leaves this open!)
    secure: true,           // Must be true for port 465
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS  
    },
    // Optional: Tells Node to ignore strict local network certificate limits if they trip up
    tls: {
        rejectUnauthorized: false
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
                    <a href="https://loomhub-ncvr.onrender.com/" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Go to Your Dashboard</a>
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
/**
 * Dispatches an administrative warning notice to a specific user
 * @param {string} toEmail - The recipient's destination mailbox address
 * @param {string} userName - The recipient's personal identity moniker
 * @param {string} warningMessage - The custom administrative message text from the modal
 */
export async function sendWarningEmail(toEmail, userName, warningMessage) {
    const mailOptions = {
        from: `"LoomHub Admin" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: `⚠️ Important Account Notice - LoomHub`,
        // Text fallback version
        text: `Hello ${userName},\n\nThis is an official administrative notice regarding your LoomHub account.\n\nMessage from Administration:\n${warningMessage}\n\nPlease ensure you follow our community guidelines. If you have any questions, contact support.`,
        // Rich HTML email content matching LoomHub's look
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #fee2e2; border-radius: 8px; background-color: #ffff;">
                <h2 style="color: #dc2626; margin-bottom: 20px; display: flex; align-items: center;">
                    ⚠️ Account Warning Notice
                </h2>
                <p style="font-size: 16px; line-height: 1.6; color: #334155;">
                    Hello <strong>${userName}</strong>,
                </p>
                <p style="font-size: 16px; line-height: 1.6; color: #334155;">
                    An administrator has issued an official notice regarding your activity or status on <strong>LoomHub</strong>. Please review the statement from the administration team detailed below:
                </p>
                
                <div style="margin: 25px 0; padding: 18px; background-color: #fef2f2; border-left: 4px solid #dc2626; border-radius: 4px;">
                    <p style="font-size: 15px; line-height: 1.6; color: #991b1b; margin: 0; font-style: italic;">
                        "${warningMessage.replace(/\n/g, '<br>')}"
                    </p>
                </div>
                
                <p style="font-size: 15px; line-height: 1.6; color: #475569;">
                    Please make sure your account activity aligns with LoomHub's academic integrity and community terms of service to prevent further actions, such as temporary suspension or account closure.
                </p>
                <div style="margin: 30px 0; text-align: center;">
                    <a href="https://loomhub-ncvr.onrender.com/" style="background-color: #475569; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Log In to Account</a>
                </div>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin-top: 30px;">
                <p style="font-size: 12px; color: #94a3b8; text-align: center;">This is an automated administrative notification. Please do not reply directly to this email.</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`[EMAIL SYSTEM]: Warning notification successfully delivered to ${toEmail}`);
        return { success: true };
    } catch (error) {
        console.error('[EMAIL SYSTEM ERROR]: Failed to deliver warning notification:', error);
        return { success: false, error: error.message };
    }
}