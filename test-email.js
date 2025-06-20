#!/usr/bin/env node

/**
 * Email Integration Test Script
 * 
 * This script tests the email functionality by making API calls
 * to the mail endpoint with different scenarios.
 * 
 * Usage: node test-email.js
 */

import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const BASE_URL = 'http://localhost:3000';
const API_BASE = `${BASE_URL}/api`;

// Test credentials - Your actual login credentials for the employee system
const TEST_USER = {
  email: 'priyadarsih@gmail.com',
  password: 'DaplPriyo@2002'  // Your system login password
};

let authToken = null;

async function login() {
  try {
    console.log('🔐 Logging in...');
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(TEST_USER),
    });

    const data = await response.json();
    
    if (response.ok) {
      authToken = data.token;
      console.log('✅ Login successful');
      return true;
    } else {
      console.error('❌ Login failed:', data.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Login error:', error.message);
    return false;
  }
}

async function testEmailConfiguration() {
  console.log('\n📧 Testing Email Configuration...');
  
  const requiredVars = [
    'SMTP_HOST',
    'SMTP_PORT', 
    'SMTP_USER',
    'SMTP_PASS',
    'DEFAULT_FROM_EMAIL'
  ];
  
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('❌ Missing environment variables:', missing.join(', '));
    console.log('Please check your .env.local file');
    return false;
  }
  
  console.log('✅ All email environment variables are set');
  return true;
}

async function getPositions() {
  try {
    console.log('\n📋 Fetching available positions...');
    const response = await fetch(`${API_BASE}/mail?action=get-positions`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Available positions:', data.positions.map(p => p.position).join(', '));
      return data.positions;
    } else {
      console.error('❌ Failed to fetch positions:', data.error);
      return [];
    }
  } catch (error) {
    console.error('❌ Error fetching positions:', error.message);
    return [];
  }
}

async function testSendEmail(positions) {
  if (positions.length === 0) {
    console.log('⚠️ No positions available for testing');
    return;
  }

  const testMail = {
    requestType: "General Request",
    subject: "Email Integration Test",
    message: "This is a test message to verify the email integration is working correctly. Please ignore this message.",
    selectedPositions: [positions[0].position], // Send to first available position
    priority: "Low"
  };

  try {
    console.log('\n📤 Sending test email...');
    console.log(`   To Position: ${testMail.selectedPositions[0]}`);
    console.log(`   Subject: ${testMail.subject}`);
    
    const response = await fetch(`${API_BASE}/mail`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testMail),
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Mail sent successfully!');
      console.log(`   Database Message ID: ${data.mail.id}`);
      
      if (data.emailResults) {
        const { sent = 0, failed = 0 } = data.emailResults;
        console.log(`   Email Results: ${sent} sent, ${failed} failed`);
        
        if (data.emailResults.details && data.emailResults.details.sent && data.emailResults.details.sent.length > 0) {
          console.log('✅ Email delivery successful');
          data.emailResults.details.sent.forEach((result, index) => {
            console.log(`   - ${result.type}: ${result.recipients.join(', ')}`);
            if (result.messageId) {
              console.log(`     Message ID: ${result.messageId}`);
            }
          });
        }
        
        if (data.emailResults.details && data.emailResults.details.failed && data.emailResults.details.failed.length > 0) {
          console.log('❌ Email delivery failures:');
          data.emailResults.details.failed.forEach((failure, index) => {
            console.log(`   - ${failure.type}: ${failure.error}`);
          });
        }
      } else {
        console.log('⚠️ No email results returned (check email configuration)');
      }
      
      return true;
    } else {
      console.error('❌ Failed to send mail:', data.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Error sending mail:', error.message);
    return false;
  }
}

async function testPositionMapping() {
  try {
    console.log('\n🗂️ Testing position email mappings...');
    const response = await fetch(`${API_BASE}/management/position-emails`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (response.ok) {
      if (data.mappings.length > 0) {
        console.log('✅ Position email mappings found:');
        data.mappings.forEach(mapping => {
          console.log(`   - ${mapping.position}: ${mapping.email} (${mapping.employeeName})`);
        });
      } else {
        console.log('⚠️ No position email mappings configured');
        console.log('   Emails will be sent to personal addresses of employees in each position');
      }
      return data.mappings;
    } else {
      console.error('❌ Failed to fetch position mappings:', data.error);
      return [];
    }
  } catch (error) {
    console.error('❌ Error fetching position mappings:', error.message);
    return [];
  }
}

async function runTests() {
  console.log('🚀 Starting Email Integration Tests\n');
  
  // Test 1: Environment Configuration
  const configOk = await testEmailConfiguration();
  if (!configOk) {
    console.log('\n❌ Tests failed - configuration issues');
    process.exit(1);
  }
  
  // Test 2: Authentication
  const loginOk = await login();
  if (!loginOk) {
    console.log('\n❌ Tests failed - authentication issues');
    console.log('Please ensure you have a valid test user account');
    process.exit(1);
  }
  
  // Test 3: Position Mappings
  await testPositionMapping();
  
  // Test 4: Available Positions
  const positions = await getPositions();
  
  // Test 5: Send Test Email
  const emailOk = await testSendEmail(positions);
  
  console.log('\n🏁 Test Summary:');
  console.log(`   Configuration: ${configOk ? '✅' : '❌'}`);
  console.log(`   Authentication: ${loginOk ? '✅' : '❌'}`);
  console.log(`   Email Sending: ${emailOk ? '✅' : '❌'}`);
  
  if (configOk && loginOk && emailOk) {
    console.log('\n🎉 All tests passed! Email integration is working correctly.');
  } else {
    console.log('\n⚠️ Some tests failed. Please check the issues above.');
  }
}

// Run tests if script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export { runTests };
