#!/usr/bin/env node

/**
 * SMTP Connection Test Script
 * 
 * This script tests your SMTP configuration without starting the full app.
 * 
 * Usage:
 *   node scripts/test-smtp.js
 * 
 * Make sure your .env file is configured with:
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_SECURE = process.env.SMTP_SECURE === 'true';
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM || SMTP_USER;

console.log('🔧 SMTP Configuration Test\n');
console.log('Configuration:');
console.log('  Host:', SMTP_HOST || '❌ NOT SET');
console.log('  Port:', SMTP_PORT);
console.log('  Secure:', SMTP_SECURE);
console.log('  User:', SMTP_USER || '❌ NOT SET');
console.log('  Pass:', SMTP_PASS ? '***' + SMTP_PASS.slice(-4) : '❌ NOT SET');
console.log('  From:', SMTP_FROM || '❌ NOT SET');
console.log('');

if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
  console.error('❌ Error: Missing required SMTP configuration!');
  console.error('');
  console.error('Please set the following in your .env file:');
  console.error('  - SMTP_HOST');
  console.error('  - SMTP_USER');
  console.error('  - SMTP_PASS');
  console.error('');
  console.error('See .env.smtp.example for examples.');
  process.exit(1);
}

console.log('🔄 Testing SMTP connection...\n');

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
  debug: false, // Set to true for detailed logs
});

// Test connection
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP Connection Failed!\n');
    console.error('Error:', error.message);
    console.error('');
    console.error('Common solutions:');
    console.error('  1. Check your username and password');
    console.error('  2. For Gmail, use an App Password (not your regular password)');
    console.error('  3. Verify the SMTP host and port are correct');
    console.error('  4. Check your firewall settings');
    console.error('');
    process.exit(1);
  } else {
    console.log('✅ SMTP Connection Successful!\n');
    console.log('Your email configuration is working correctly.');
    console.log('');
    
    // Ask if user wants to send a test email
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    readline.question('Would you like to send a test email? (y/n): ', async (answer) => {
      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        readline.question('Enter recipient email address: ', async (recipient) => {
          console.log('\n📧 Sending test email...\n');
          
          try {
            const testPin = Math.floor(1000 + Math.random() * 9000).toString();
            
            await transporter.sendMail({
              from: `"DU Alumni 89 Test" <${SMTP_FROM}>`,
              to: recipient,
              subject: '✓ Test Email - SMTP Configuration Successful',
              text: `This is a test email to verify your SMTP configuration.\n\nTest PIN: ${testPin}\n\nIf you received this email, your SMTP settings are working correctly!`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <h2 style="color: #28a745;">✓ SMTP Configuration Successful</h2>
                  <p>This is a test email to verify your SMTP configuration.</p>
                  <div style="background-color: #f0f0f0; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
                    <p style="margin: 0 0 10px 0; color: #666;">Test PIN Code:</p>
                    <div style="font-size: 36px; font-weight: bold; letter-spacing: 10px; color: #667eea; font-family: monospace;">
                      ${testPin}
                    </div>
                  </div>
                  <p style="color: #666;">If you received this email, your SMTP settings are working correctly!</p>
                  <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                  <p style="font-size: 12px; color: #999;">DU Alumni '89 Connect - Two-Step Verification Test</p>
                </div>
              `,
            });
            
            console.log('✅ Test email sent successfully!');
            console.log(`   Check ${recipient} for the test email.`);
            console.log('');
            console.log('🎉 Your SMTP configuration is fully working!');
            console.log('   You can now use two-step verification in your app.');
            console.log('');
          } catch (emailError) {
            console.error('❌ Failed to send test email:', emailError.message);
          }
          
          readline.close();
          process.exit(0);
        });
      } else {
        console.log('Test email skipped.');
        console.log('');
        console.log('🎉 SMTP connection verified successfully!');
        console.log('   You can now use two-step verification in your app.');
        console.log('');
        readline.close();
        process.exit(0);
      }
    });
  }
});
