import transporter from '../../middlewares/nodemailer';
import {
    generateRidePickedTemplate,
    generateRidePickedTextTemplate,
    RidePickedEmailData,
} from './emailTemplates';

interface SendEmailOptions {
    to: string;
    subject: string;
    html: string;
    text: string;
}

const sendEmail = async (options: SendEmailOptions): Promise<boolean> => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER || 'no-reply@ridesharex.com',
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html,
        };

        const info = await transporter.sendMail(mailOptions);
        // eslint-disable-next-line no-console
        console.log('✅ Email sent successfully:', info.messageId);
        return true;
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('❌ Error sending email:', error);
        return false;
    }
};

/**
 * Send ride pickup notification email to user
 */
export const sendRidePickedEmail = async (
    data: RidePickedEmailData
): Promise<boolean> => {
    const htmlTemplate = generateRidePickedTemplate(data);
    const textTemplate = generateRidePickedTextTemplate(data);

    const options: SendEmailOptions = {
        to: data.userEmail,
        subject: `🎉 Your Ride with ${data.driverName} has been Accepted!`,
        html: htmlTemplate,
        text: textTemplate,
    };

    return sendEmail(options);
};

// Export generic sendEmail function for other use cases
export { sendEmail };
