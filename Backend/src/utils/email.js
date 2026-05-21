import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS, 
    },
});

export const sendNewPasswordEmail = async (toEmail, newPassword) => {
    const mailOptions = {
        from: `"WMS Support" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: 'Your Password Has Been Reset',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #2e7d32;">Password Reset Successful</h2>
                <p>Hello,</p>
                <p>We have processed your request to reset your password. Below is your new randomly generated password to sign in:</p>
                <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; font-weight: bold; font-size: 1.2em; text-align: center; margin: 20px 0;">
                    ${newPassword}
                </div>
                <p><strong>Please change this password immediately after signing in for security reasons.</strong></p>
                <p>If you did not request this, please contact your administrator immediately.</p>
                <br>
                <p>Best regards,<br>WMS Team</p>
            </div>
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: %s', info.messageId);
        return true;
    } catch (error) {
        console.error('Email sending failed:', error);
        throw error;
    }
};
