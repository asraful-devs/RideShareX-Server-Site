import nodemailer from 'nodemailer';
import { envVars } from '../config/env';

// Create reusable transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: envVars.EMAIL_USER,
        pass: envVars.EMAIL_PASS,
    },
});

// Verify transporter connection
transporter.verify((error) => {
    if (error) {
        // eslint-disable-next-line no-console
        console.error('❌ Nodemailer transporter error:', error);
    } else {
        // eslint-disable-next-line no-console
        console.log('✅ Nodemailer is ready to send emails');
    }
});

export default transporter;
