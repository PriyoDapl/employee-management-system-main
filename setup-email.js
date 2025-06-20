#!/usr/bin/env node

/**
 * Email Setup Assistant
 * 
 * This script helps you configure email settings for the Employee Management System.
 * It will guide you through setting up SMTP configuration and test the connection.
 * 
 * Usage: node setup-email.js
 */

import readline from 'readline';
import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function updateEnvFile(config) {
  const envPath = '.env.local';
  let envContent = '';
  
  // Read existing .env.local if it exists
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }
  
  // Remove existing email configuration
  const emailConfigPattern = /\n?# Email Configuration[\s\S]*?(?=\n\n|\n#|$)/;
  envContent = envContent.replace(emailConfigPattern, '');
  
  // Add new email configuration
  const emailConfig = `
# Email Configuration
SMTP_HOST=${config.host}
SMTP_PORT=${config.port}
SMTP_SECURE=${config.secure}
SMTP_USER=${config.user}
SMTP_PASS=${config.pass}
DEFAULT_FROM_EMAIL=${config.fromEmail}
DEFAULT_FROM_NAME=${config.fromName}`;
  
  envContent += emailConfig;
  
  // Write back to file
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Email configuration saved to .env.local');
}

async function testConnection(config) {
  try {
    console.log('\n🔄 Testing email connection...');
    
    const transporter = nodemailer.createTransporter({
      host: config.host,
      port: parseInt(config.port),
      secure: config.secure === 'true',
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });

    await transporter.verify();
    console.log('✅ Email connection successful!');
    return true;
  } catch (error) {
    console.error('❌ Email connection failed:', error.message);
    return false;
  }
}

async function sendTestEmail(config) {
  try {
    const testEmail = await question('Enter an email address to send a test email to: ');
    
    if (!testEmail || !testEmail.includes('@')) {
      console.log('⚠️ Skipping test email - invalid email address');
      return;
    }
    
    console.log('\n📧 Sending test email...');
    
    const transporter = nodemailer.createTransporter({
      host: config.host,
      port: parseInt(config.port),
      secure: config.secure === 'true',
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });

    const mailOptions = {
      from: `"${config.fromName}" <${config.fromEmail}>`,
      to: testEmail,
      subject: 'Test Email - Employee Management System',
      html: `
        <h2>Email Configuration Test</h2>
        <p>Congratulations! Your email configuration is working correctly.</p>
        <p><strong>Configuration Details:</strong></p>
        <ul>
          <li>SMTP Host: ${config.host}</li>
          <li>SMTP Port: ${config.port}</li>
          <li>From Email: ${config.fromEmail}</li>
          <li>From Name: ${config.fromName}</li>
        </ul>
        <p>You can now use the Employee Management System to send emails.</p>
      `,
      text: `Email Configuration Test\n\nCongratulations! Your email configuration is working correctly.\n\nConfiguration Details:\n- SMTP Host: ${config.host}\n- SMTP Port: ${config.port}\n- From Email: ${config.fromEmail}\n- From Name: ${config.fromName}\n\nYou can now use the Employee Management System to send emails.`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Test email sent successfully!');
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Sent to: ${testEmail}`);
  } catch (error) {
    console.error('❌ Failed to send test email:', error.message);
  }
}

async function setupProvider() {
  console.log('\n📧 Email Provider Setup');
  console.log('Choose your email provider:');
  console.log('1. Gmail');
  console.log('2. Outlook');
  console.log('3. Yahoo');
  console.log('4. Custom SMTP');
  
  const choice = await question('Enter your choice (1-4): ');
  
  switch (choice) {
    case '1':
      return {
        host: 'smtp.gmail.com',
        port: '587',
        secure: 'false',
        instructions: [
          '📝 Gmail Setup Instructions:',
          '1. Enable 2-Factor Authentication on your Google account',
          '2. Go to Google Account Settings → Security → 2-Step Verification → App passwords',
          '3. Select "Mail" and generate an app password',
          '4. Use the generated app password (not your regular password)'
        ]
      };
    
    case '2':
      return {
        host: 'smtp-mail.outlook.com',
        port: '587',
        secure: 'false',
        instructions: [
          '📝 Outlook Setup Instructions:',
          '1. Use your full Outlook email address',
          '2. Use your regular Outlook password',
          '3. Ensure SMTP is enabled in your account settings'
        ]
      };
    
    case '3':
      return {
        host: 'smtp.mail.yahoo.com',
        port: '587',
        secure: 'false',
        instructions: [
          '📝 Yahoo Setup Instructions:',
          '1. Enable "Less secure app access" in your Yahoo account',
          '2. Or use an app password if 2FA is enabled',
          '3. Use your full Yahoo email address'
        ]
      };
    
    case '4':
      const host = await question('Enter SMTP host: ');
      const port = await question('Enter SMTP port (usually 587 or 465): ');
      const secure = await question('Use secure connection? (true for port 465, false for others): ');
      
      return {
        host,
        port,
        secure,
        instructions: [
          '📝 Custom SMTP Setup:',
          '1. Ensure your SMTP server allows authentication',
          '2. Check with your provider for specific requirements',
          '3. Some providers may require app passwords or specific settings'
        ]
      };
    
    default:
      console.log('❌ Invalid choice');
      return await setupProvider();
  }
}

async function main() {
  console.log('🚀 Employee Management System - Email Setup Assistant\n');
  
  try {
    const provider = await setupProvider();
    
    // Show setup instructions
    console.log('\n' + provider.instructions.join('\n'));
    
    console.log('\n🔧 SMTP Configuration');
    
    const config = {
      host: provider.host,
      port: provider.port,
      secure: provider.secure
    };
    
    // Get user credentials
    config.user = await question('Enter your email address: ');
    config.pass = await question('Enter your email password (or app password): ');
    
    console.log('\n📮 Email Sender Configuration');
    config.fromEmail = await question('Enter the "From" email address (can be same as above): ') || config.user;
    config.fromName = await question('Enter the "From" name (e.g., "Company Name"): ') || 'Employee Management System';
    
    // Test connection
    const connectionOk = await testConnection(config);
    
    if (!connectionOk) {
      const retry = await question('\nWould you like to try different settings? (y/n): ');
      if (retry.toLowerCase() === 'y') {
        return await main();
      } else {
        console.log('❌ Setup cancelled');
        return;
      }
    }
    
    // Save configuration
    updateEnvFile(config);
    
    // Ask if user wants to send test email
    const sendTest = await question('\nWould you like to send a test email? (y/n): ');
    if (sendTest.toLowerCase() === 'y') {
      await sendTestEmail(config);
    }
    
    console.log('\n🎉 Email setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Restart your development server if it\'s running');
    console.log('2. Test the email functionality in your application');
    console.log('3. Configure position email mappings in the Settings if needed');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    rl.close();
  }
}

// Run setup if script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { main as setupEmail };
