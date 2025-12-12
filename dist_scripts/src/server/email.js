"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendStatusUpdateEmail = sendStatusUpdateEmail;
exports.formatStatusForEmail = formatStatusForEmail;
exports.getStatusMessage = getStatusMessage;
const axios_1 = __importDefault(require("axios"));
/**
 * EmailJS Integration for Status Update Notifications
 *
 * Setup Instructions:
 * 1. Sign up at https://www.emailjs.com/
 * 2. Create a new email service (Gmail, Outlook, etc.)
 * 3. Create a new email template with the following variables:
 *    - user_name: Recipient's name
 *    - to_email: Recipient's email (use {{to_email}} in "To Email" field)
 *    - song_name: Name of the song/track
 *    - singer_name: Name of the artist/singer
 *    - song_status: Status of the submission (Approved/Rejected/Distributed)
 *    - date: Date of the status update
 * 4. Get your PRIVATE KEY from Account > API Keys > Private Key
 * 5. Add these to your .env file:
 *    - EMAILJS_SERVICE_ID
 *    - EMAILJS_TEMPLATE_ID
 *    - EMAILJS_PRIVATE_KEY (not public key for server-side calls)
 *
 * Template HTML provided by user includes fields:
 * - user_name, song_name, singer_name, song_status, date
 */
// EmailJS configuration
const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID || 'service_xxxxxxx';
const EMAILJS_TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID || 'template_xxxxxxx';
const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY || 'your_public_key';
const EMAILJS_PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY || 'your_private_key';
async function sendStatusUpdateEmail(params) {
    try {
        const emailData = {
            service_id: EMAILJS_SERVICE_ID,
            template_id: EMAILJS_TEMPLATE_ID,
            user_id: EMAILJS_PUBLIC_KEY,
            accessToken: EMAILJS_PRIVATE_KEY,
            template_params: {
                to_email: params.user_email,
                user_name: params.user_name,
                song_name: params.song_name,
                singer_name: params.singer_name,
                song_status: params.song_status,
                status_message: params.status_message || 'Your submission status has been updated.',
                date: params.date,
            },
        };
        console.log('Sending email to:', params.user_email);
        const response = await axios_1.default.post('https://api.emailjs.com/api/v1.0/email/send', emailData, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (response.status === 200) {
            console.log('Email sent successfully to:', params.user_email);
        }
        else {
            console.error('Failed to send email:', response.data);
        }
    }
    catch (error) {
        console.error('Error sending email:', error.response?.data || error.message);
        // Don't throw error - we don't want to break the approval/rejection flow
        // just because email failed
    }
}
function formatStatusForEmail(status) {
    switch (status) {
        case 'APPROVED':
            return 'Approved ✅';
        case 'REJECTED':
            return 'Rejected ❌';
        case 'DISTRIBUTED':
            return 'Distributed 🚀';
        case 'UNDER_REVIEW':
            return 'Under Review ⏳';
        default:
            return status;
    }
}
function getStatusMessage(status) {
    switch (status) {
        case 'APPROVED':
            return 'Audio will be live within 48 hours.';
        case 'REJECTED':
            return 'Please solve the issues with your audio and submit again.';
        case 'DISTRIBUTED':
            return 'Your audio is now live on all supported platforms.';
        case 'UNDER_REVIEW':
            return 'Your submission is currently under review. You will be notified once it is processed.';
        default:
            return 'Your submission status has been updated.';
    }
}
