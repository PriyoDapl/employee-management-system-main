#!/bin/bash

# Quick Email Configuration Script
# Run this script to quickly set up email configuration

echo "🚀 Email Integration Quick Setup"
echo "================================"
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local file not found!"
    echo "Please create .env.local file first."
    exit 1
fi

echo "📧 Email Provider Setup"
echo "----------------------"
echo "1. Gmail/Google Workspace (Recommended)"
echo "2. Microsoft 365/Outlook"
echo "3. Custom SMTP Server"
echo ""
read -p "Select your email provider (1-3): " provider

case $provider in
    1)
        echo ""
        echo "📝 Gmail/Google Workspace Setup:"
        echo "1. Enable 2-Factor Authentication on your Google account"
        echo "2. Go to Google Account Settings → Security → 2-Step Verification → App passwords"
        echo "3. Generate an app password for 'Mail'"
        echo "4. Copy the 16-character password"
        echo ""
        read -p "Enter your Gmail address: " email
        read -s -p "Enter your app password: " password
        echo ""
        
        # Update .env.local
        sed -i "s/SMTP_USER=.*/SMTP_USER=$email/" .env.local
        sed -i "s/SMTP_PASS=.*/SMTP_PASS=$password/" .env.local
        sed -i "s/DEFAULT_FROM_EMAIL=.*/DEFAULT_FROM_EMAIL=$email/" .env.local
        ;;
    2)
        echo ""
        echo "📝 Microsoft 365/Outlook Setup:"
        read -p "Enter your Outlook email: " email
        read -s -p "Enter your password: " password
        echo ""
        
        # Update .env.local for Outlook
        sed -i "s/SMTP_HOST=.*/SMTP_HOST=smtp-mail.outlook.com/" .env.local
        sed -i "s/SMTP_USER=.*/SMTP_USER=$email/" .env.local
        sed -i "s/SMTP_PASS=.*/SMTP_PASS=$password/" .env.local
        sed -i "s/DEFAULT_FROM_EMAIL=.*/DEFAULT_FROM_EMAIL=$email/" .env.local
        ;;
    3)
        echo ""
        echo "📝 Custom SMTP Setup:"
        read -p "Enter SMTP host: " host
        read -p "Enter SMTP port: " port
        read -p "Enter email address: " email
        read -s -p "Enter password: " password
        echo ""
        
        # Update .env.local for custom SMTP
        sed -i "s/SMTP_HOST=.*/SMTP_HOST=$host/" .env.local
        sed -i "s/SMTP_PORT=.*/SMTP_PORT=$port/" .env.local
        sed -i "s/SMTP_USER=.*/SMTP_USER=$email/" .env.local
        sed -i "s/SMTP_PASS=.*/SMTP_PASS=$password/" .env.local
        sed -i "s/DEFAULT_FROM_EMAIL=.*/DEFAULT_FROM_EMAIL=$email/" .env.local
        ;;
    *)
        echo "❌ Invalid selection"
        exit 1
        ;;
esac

echo ""
echo "✅ Email configuration updated!"
echo ""

# Update test credentials
echo "🧪 Test Configuration"
echo "--------------------"
read -p "Enter your login email for testing: " test_email
read -s -p "Enter your login password for testing: " test_password
echo ""

# Update test-email.js
if [ -f "test-email.js" ]; then
    sed -i "s/email: '.*',/email: '$test_email',/" test-email.js
    sed -i "s/password: '.*'/password: '$test_password'/" test-email.js
    echo "✅ Test credentials updated!"
else
    echo "⚠️  test-email.js not found - you'll need to update test credentials manually"
fi

echo ""
echo "🚀 Setup Complete!"
echo "=================="
echo ""
echo "Next steps:"
echo "1. Start the development server: npm run dev"
echo "2. Run email tests: node test-email.js"
echo "3. Log in to the system and go to Settings"
echo "4. Add position email mappings"
echo "5. Send a test email through the Mail system"
echo ""
echo "📖 For detailed instructions, see EMAIL_SETUP_GUIDE.md"
