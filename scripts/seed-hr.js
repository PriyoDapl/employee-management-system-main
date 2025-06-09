/**
 * npm run seed:hr
*/
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables BEFORE importing other modules
dotenv.config({ path: path.join(__dirname, '../.env.local') });
dotenv.config({ path: path.join(__dirname, '../.env') });

// Debug: Check if MongoDB URI is loaded
console.log('Checking environment variables...');
console.log('Script directory:', __dirname);
console.log('Project root:', path.join(__dirname, '..'));
console.log('MongoDB URI loaded:', !!process.env.MONGODB_URI);
console.log('MongoDB URI (partial):', process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 20) + '...' : 'NOT FOUND');

if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI not found in environment variables!');
  console.error('Make sure you have one of these files with MONGODB_URI:');
  console.error('  - .env.local');
  console.error('  - .env');
  console.error('  - or set MONGODB_URI as system environment variable');
  process.exit(1);
}

const defaultHRUser = {
  email: 'hr@company.com',
  password: 'HR123456',
  role: 'management',
  firstName: 'HR',
  lastName: 'Admin',
  isActive: true
};

async function seedHRUser() {
  try {
    console.log('Connecting to database...');
    
    // Dynamic imports after environment is set up
    const { default: dbConnect } = await import('../src/lib/mongodb.js');
    const { User } = await import('../src/model/User.js');
    
    await dbConnect();
    
    // Check if HR user already exists
    const existingHR = await User.findOne({ 
      email: defaultHRUser.email,
      role: 'management' 
    });
    
    if (existingHR) {
      console.log(' HR user already exists with email:', defaultHRUser.email);
      console.log('If you want to reset the password, delete the existing user first.');
      return;
    }
    
    // Create new HR user
    console.log('Creating HR user...');
    const hrUser = new User(defaultHRUser);
    await hrUser.save();
    
    console.log('HR user created successfully!');
    console.log('Email:', defaultHRUser.email);
    console.log('Password:', defaultHRUser.password);
    console.log('IMPORTANT: Please change the default password after first login!');

  } catch (error) {
    console.error('Error creating HR user:', error.message);
    console.error('Full error:', error);
    
    if (error.code === 11000) {
      console.error('Duplicate email detected. User might already exist.');
    }
  } finally {
    // Close database connection
    process.exit(0);
  }
}

// Allow customization via command line arguments
const args = process.argv.slice(2);
if (args.length >= 2) {
  defaultHRUser.email = args[0];
  defaultHRUser.password = args[1];
  
  if (args[2]) defaultHRUser.firstName = args[2];
  if (args[3]) defaultHRUser.lastName = args[3];
}

console.log('Starting HR user seed process...');
seedHRUser();
