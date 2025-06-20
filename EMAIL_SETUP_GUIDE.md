# Email Integration Setup Guide

## 🎯 Current Status
✅ Email integration code is complete and functional  
⚠️ Requires SMTP configuration to start sending actual emails  
✅ Database mail system works independently  

## 📧 Step 1: Configure Email Provider

### Option A: Gmail/Google Workspace (Recommended)
If your company uses Gmail or Google Workspace:

1. **Enable 2-Factor Authentication** on your Google account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Copy the 16-character password

3. **Update `.env.local`**:
```bash
SMTP_USER=priyadarsi.halder@digitalaptech.co.in
SMTP_PASS=your-16-char-app-password
```

### Option B: Microsoft 365/Outlook
If your company uses Office 365:

1. **Update `.env.local`**:
```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=priyadarsi.halder@digitalaptech.co.in
SMTP_PASS=your-email-password
```

### Option C: Custom SMTP Server
Contact your IT department for:
- SMTP server address
- Port number
- Authentication method
- Username/password

## 🧪 Step 2: Test Email Configuration

1. **Update test credentials** in `test-email.js`:
```javascript
const TEST_USER = {
  email: 'priyadarsi.halder@digitalaptech.co.in',
  password: 'your-login-password'  // Your system login password
};
```

2. **Start the development server**:
```bash
npm run dev
```

3. **Run email tests** (in another terminal):
```bash
node test-email.js
```

## 🏢 Step 3: Set Up Position Email Mappings

1. **Log in as management user**
2. **Go to Settings** in the navigation
3. **Add Position Email Mappings**:
   - HR Manager → hr@digitalaptech.co.in
   - Project Manager → pm@digitalaptech.co.in
   - Team Leader → tl@digitalaptech.co.in
   - etc.

## 🔍 Step 4: Verify Email Flow

### Test Scenario:
1. **Create management account** (if not exists):
```bash
npm run seed:hr hr@digitalaptech.co.in password123 HR Admin
```

2. **Test complete email flow**:
   - Send internal mail through the system
   - Check database mail (always works)
   - Verify real email delivery
   - Check email status in Mail History

## 🛠️ Troubleshooting

### Common Issues:

**"Authentication failed"**
- Check SMTP credentials
- For Gmail: Use App Password, not regular password
- For Outlook: Check if 2FA is affecting login

**"Connection refused"**
- Check SMTP host and port
- Verify firewall/network settings
- Try different ports (25, 465, 587)

**"Emails not received"**
- Check spam folders
- Verify email addresses in position mappings
- Check email status in Mail History tab

### Debug Mode:
Add to `.env.local` for detailed logging:
```bash
DEBUG_EMAIL=true
```

## 📋 Configuration Checklist

- [ ] SMTP credentials configured in `.env.local`
- [ ] App password generated (if using Gmail)
- [ ] Test user password updated in `test-email.js`
- [ ] Development server running (`npm run dev`)
- [ ] Email test script executed (`node test-email.js`)
- [ ] Management account created
- [ ] Position email mappings configured
- [ ] Test email sent and received

## 🚀 Production Deployment

### Before Going Live:
1. **Set up dedicated email account** for the system
2. **Configure SPF/DKIM records** (optional, for better deliverability)
3. **Test with all user roles**
4. **Monitor email delivery rates**
5. **Set up email quotas/limits** if needed

### Environment Variables for Production:
```bash
SMTP_HOST=your-production-smtp-host
SMTP_PORT=587
SMTP_USER=noreply@digitalaptech.co.in
SMTP_PASS=production-app-password
DEFAULT_FROM_EMAIL=noreply@digitalaptech.co.in
DEFAULT_FROM_NAME=Digital Aptech Employee Management
```

## 📞 Need Help?

The email integration is designed to be robust:
- **Database mail always works** (even if emails fail)
- **Graceful error handling** with detailed status messages
- **Dual system** ensures no functionality is lost

If you encounter issues:
1. Check the browser console for error messages
2. Look at server logs for SMTP errors
3. Verify email credentials with your email provider
4. Test with a simple email first

---

**Next Action Required:** Update the SMTP password in `.env.local` with your actual email credentials, then run the test script.
