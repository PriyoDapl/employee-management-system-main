#!/bin/bash

# Email Integration Quick Start Script
# This script helps you get started with the email functionality

echo "🚀 Employee Management System - Email Integration Quick Start"
echo "============================================================"
echo

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the project root directory."
    exit 1
fi

echo "✅ Environment check passed"
echo

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local file not found. Please create it first."
    exit 1
fi

# Check for email configuration
if ! grep -q "SMTP_HOST" .env.local; then
    echo "⚠️  Email configuration not found in .env.local"
    echo "🔧 Running email setup assistant..."
    echo
    node setup-email.js
else
    echo "✅ Email configuration found in .env.local"
fi

echo
echo "📋 Quick Start Checklist:"
echo "========================="
echo

# Check email configuration
echo -n "1. Email Configuration: "
if grep -q "SMTP_HOST" .env.local && grep -q "SMTP_USER" .env.local; then
    echo "✅ Configured"
else
    echo "❌ Missing - Run: node setup-email.js"
fi

# Check if development server dependencies are installed
echo -n "2. Dependencies: "
if [ -d "node_modules" ]; then
    echo "✅ Installed"
else
    echo "⚠️  Installing dependencies..."
    npm install
fi

# Check if the development server is running
echo -n "3. Development Server: "
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Running"
else
    echo "❌ Not running - Run: npm run dev"
fi

echo
echo "🎯 Next Steps:"
echo "=============="
echo "1. Start the development server (if not running):"
echo "   npm run dev"
echo
echo "2. Configure position email mappings (optional):"
echo "   - Login to the management dashboard"
echo "   - Go to Settings → Position Email Mapping"
echo "   - Add mappings for positions that need dedicated emails"
echo
echo "3. Test the email functionality:"
echo "   node test-email.js"
echo
echo "4. Send your first email:"
echo "   - Login to the system"
echo "   - Go to Mail → Send Mail"
echo "   - Send a test message"
echo
echo "📚 Documentation:"
echo "=================="
echo "- Implementation Summary: IMPLEMENTATION_SUMMARY.md"
echo "- Detailed Guide: EMAIL_INTEGRATION_GUIDE.md"
echo "- Test email functionality: node test-email.js"
echo "- Configure email settings: node setup-email.js"
echo
echo "🎉 You're all set! Happy emailing! 📧"
