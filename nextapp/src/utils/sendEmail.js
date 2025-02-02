import nodemailer from 'nodemailer';

/**
 * Sends an email using Nodemailer.
 * @param {Object} options - The email options.
 * @param {string} options.to - Recipient's email address.
 * @param {string} options.subject - Subject of the email.
 * @param {string} [options.text] - Plain text content of the email (optional).
 * @param {string} [options.html] - HTML content of the email (optional).
 * @param {string} [options.template] - Pre-defined email template (optional).
 * @returns {Promise<Object>} - Resolves with the email sending info if successful.
 */
export const sendEmail = async ({ to, subject, text = '', html = '', template = '' }) => {
  try {
    // Ensure required fields are provided
    if (!to || !subject) {
      throw new Error('Recipient email and subject are required.');
    }

    // Configure the email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Update if using a different email service
      auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS, // Your email password or app password
      },
    });

    // Email options
    const mailOptions = {
      from: `"Team Sathi" <${process.env.EMAIL_USER}>`, // Sender's name and email
      to, // Recipient's email
      subject, // Subject line
      text, // Plain text body
      html: template || html, // Use provided template or HTML content
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);

    console.log(`Email sent successfully: ${info.messageId}`);
    return info; // Return detailed info about the sent email
  } catch (error) {
    console.error('Error sending email:', error.message);
    throw new Error('Failed to send email. Please check the configuration.');
  }
};
