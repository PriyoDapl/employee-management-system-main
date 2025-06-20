import nodemailer from 'nodemailer';

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Send email function
export const sendEmail = async ({ to, cc, from, subject, html, text }) => {
  try {
    const transporter = createTransporter();

    // Verify transporter configuration
    await transporter.verify();
    console.log('Email server is ready to take our messages');

    const mailOptions = {
      from: from || `"${process.env.DEFAULT_FROM_NAME}" <${process.env.DEFAULT_FROM_EMAIL}>`,
      to: Array.isArray(to) ? to.join(', ') : to,
      cc: cc && Array.isArray(cc) ? cc.join(', ') : cc,
      subject,
      html,
      text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

// Generate HTML email template
export const generateEmailTemplate = ({ 
  senderName, 
  senderEmail, 
  requestType, 
  subject, 
  message, 
  priority, 
  recipientType = 'TO' 
}) => {
  const priorityColor = {
    'Low': '#28a745',
    'Medium': '#ffc107', 
    'High': '#fd7e14',
    'Critical': '#dc3545'
  };

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        .email-container {
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8f9fa;
        }
        .email-header {
          background-color: #007bff;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 8px 8px 0 0;
        }
        .email-content {
          background-color: white;
          padding: 20px;
          border-radius: 0 0 8px 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .priority-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          color: white;
          font-size: 12px;
          font-weight: bold;
          background-color: ${priorityColor[priority] || '#6c757d'};
        }
        .recipient-type {
          background-color: ${recipientType === 'CC' ? '#6f42c1' : '#28a745'};
          color: white;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 10px;
          margin-left: 10px;
        }
        .message-content {
          background-color: #f8f9fa;
          padding: 15px;
          border-left: 4px solid #007bff;
          margin: 15px 0;
          white-space: pre-wrap;
        }
        .footer {
          margin-top: 20px;
          padding-top: 15px;
          border-top: 1px solid #e9ecef;
          font-size: 12px;
          color: #6c757d;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="email-header">
          <h2>Employee Management System</h2>
          <p>New ${requestType} Request</p>
        </div>
        <div class="email-content">
          <h3>${subject} <span class="recipient-type">${recipientType}</span></h3>
          
          <div style="margin: 15px 0;">
            <strong>Priority:</strong> <span class="priority-badge">${priority}</span>
          </div>
          
          <div style="margin: 15px 0;">
            <strong>Request Type:</strong> ${requestType}
          </div>
          
          <div style="margin: 15px 0;">
            <strong>From:</strong> ${senderName} (${senderEmail})
          </div>
          
          <div style="margin: 15px 0;">
            <strong>Message:</strong>
            <div class="message-content">${message}</div>
          </div>
          
          <div class="footer">
            <p>This email was sent from the Employee Management System. 
            ${recipientType === 'CC' ? 'You received this as a CC recipient.' : 'This request was sent to your position.'}</p>
            <p>Please respond to this request through the Employee Management System portal.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    Employee Management System - New ${requestType} Request
    
    Subject: ${subject}
    Priority: ${priority}
    From: ${senderName} (${senderEmail})
    Recipient Type: ${recipientType}
    
    Message:
    ${message}
    
    This email was sent from the Employee Management System.
    ${recipientType === 'CC' ? 'You received this as a CC recipient.' : 'This request was sent to your position.'}
    Please respond to this request through the Employee Management System portal.
  `;

  return { html, text };
};
