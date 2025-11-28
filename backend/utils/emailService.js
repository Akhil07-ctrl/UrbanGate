import nodemailer from 'nodemailer';
import { fileURLToPath } from 'url';
import path from 'path';
import ejs from 'ejs';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a test account if in development
let transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || 'test@example.com',
    pass: process.env.SMTP_PASS || 'testpass',
  },
});

// Verify connection configuration
transporter.verify((error) => {
  if (error) {
    console.error('Error with email configuration:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Load email templates
const templates = {
  'new-complaint': {
    subject: 'New Complaint Submitted',
    template: 'new-complaint.ejs',
  },
  'complaint-status-update': {
    subject: 'Complaint Status Updated',
    template: 'status-update.ejs',
  },
  'complaint-assigned': {
    subject: 'New Complaint Assignment',
    template: 'complaint-assigned.ejs',
  },
  'new-comment': {
    subject: 'New Comment on Your Complaint',
    template: 'new-comment.ejs',
  },
  'staff-comment': {
    subject: 'Update on Your Complaint',
    template: 'staff-comment.ejs',
  },
};

/**
 * Send an email using the specified template
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.template - Template name
 * @param {Object} options.context - Template context variables
 * @param {string} [options.subject] - Email subject (overrides template default)
 * @param {string} [options.from] - Sender email address
 * @returns {Promise<Object>} - Result of the email sending operation
 */
const sendEmail = async ({
  to,
  template,
  context = {},
  subject,
  from = process.env.EMAIL_FROM || 'noreply@urbangate.com',
}) => {
  try {
    if (!templates[template]) {
      throw new Error(`Template '${template}' not found`);
    }

    const templateConfig = templates[template];
    const templatePath = path.join(
      __dirname,
      '..',
      'templates',
      'emails',
      templateConfig.template
    );

    // Check if template file exists
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template file not found: ${templatePath}`);
    }

    // Render email template
    const templateContent = fs.readFileSync(templatePath, 'utf-8');
    const html = ejs.render(templateContent, {
      ...context,
      currentYear: new Date().getFullYear(),
      appName: process.env.APP_NAME || 'UrbanGate',
      appUrl: process.env.APP_URL || 'http://localhost:3000',
    });

    // Send email
    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_SENDER_NAME || 'UrbanGate'}" <${from}>`,
      to,
      subject: subject || templateConfig.subject,
      html,
      text: html.replace(/<[^>]*>?/gm, ''), // Convert HTML to plain text
    });

    console.log(`Email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

// Create email templates directory if it doesn't exist
const templatesDir = path.join(process.cwd(), 'templates', 'emails');
if (!fs.existsSync(templatesDir)) {
  fs.mkdirSync(templatesDir, { recursive: true });
  
  // Create default email templates
  const defaultTemplates = {
    'new-complaint.ejs': `
      <!DOCTYPE html>
      <html>
      <head>
        <title>New Complaint Submitted</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4CAF50; color: white; padding: 10px 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #777; }
          .button { 
            display: inline-block; 
            padding: 10px 20px; 
            background-color: #4CAF50; 
            color: white; 
            text-decoration: none; 
            border-radius: 4px; 
            margin: 10px 0; 
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>New Complaint Submitted</h2>
          </div>
          <div class="content">
            <p>Hello <%= adminName %>,</p>
            <p>A new complaint has been submitted by <strong><%= residentName %></strong>:</p>
            <p><strong>Title:</strong> <%= title %></p>
            <p><strong>Category:</strong> <%= category %></p>
            <p><strong>Priority:</strong> <span style="color: <%= priority === 'high' ? '#f44336' : priority === 'medium' ? '#ff9800' : '#4CAF50' %>"><%= priority %></span></p>
            <p><strong>Description:</strong></p>
            <p><%= description %></p>
            <div style="text-align: center; margin: 25px 0;">
              <a href="<%= appUrl %>/complaints/<%= complaintId %>" class="button">View Complaint</a>
            </div>
          </div>
          <div class="footer">
            <p>&copy; <%= currentYear %> <%= appName %>. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    // Add other default templates here...
  };

  // Write default templates to files
  Object.entries(defaultTemplates).forEach(([filename, content]) => {
    fs.writeFileSync(path.join(templatesDir, filename), content.trim(), 'utf-8');
  });
}

export { sendEmail };
