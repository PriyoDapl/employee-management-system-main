import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User } from '@/model/User';
import { Employee } from '@/model/Employee';
import { signToken } from '@/lib/auth';

export async function POST(request) {
  try {
    await dbConnect();
    
    const { email, password, role, firstName, lastName } = await request.json();

    // Validate required fields
    if (!email || !password || !role) {
      return NextResponse.json(
        { error: 'Email, password, and role are required' },
        { status: 400 }
      );
    }

    // Validate password length this in server-side. Remember this problem that took 2 hours to solve. Better do error handling from before and not wait until the database throws an error. Internal error 500 *sigh*.
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Check if user already exists from the email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 409 }
      );
    }

    // Create new user
    const user = new User({
      email,
      password,
      role,
      firstName: firstName || '',
      lastName: lastName || '',
    });

    try {
      await user.save();
      console.log('User created successfully:', user._id);
    } catch (userError) {
      console.error('User creation error:', userError);
      
      if (userError.code === 11000) {
        return NextResponse.json(
          { error: 'User already exists with this email' },
          { status: 409 }
        );
      }
      
      if (userError.name === 'ValidationError') {
        const validationErrors = Object.values(userError.errors).map(err => err.message);
        return NextResponse.json(
          { error: validationErrors.join(', ') },
          { status: 400 }
        );
      }
      
      throw userError; // Re-throw if it's not a handled error
    }

    // If user is an employee, create employee record
    if (role === 'employee') {
      try {
        console.log('Creating employee record for user:', user._id);
        
        // Generate employeeId manually as backup
        const employeeCount = await Employee.countDocuments();
        const employeeId = `EMP${String(employeeCount + 1).padStart(4, '0')}`;
        
        const employee = new Employee({
          user: user._id,
          employeeId: employeeId,
          department: 'General', // Default department
          position: 'Employee', // Default position
          salary: 0, // Default salary
        });
        
        console.log('Employee object before save:', employee);
        const savedEmployee = await employee.save();
        console.log('Employee record created successfully:', savedEmployee.employeeId);
      } catch (employeeError) {
        console.error('Employee creation error:', employeeError);
        console.error('Employee creation error details:', employeeError.message);
        // Delete the user if employee creation fails
        await User.findByIdAndDelete(user._id);
        return NextResponse.json(
          { error: 'Failed to create employee record: ' + employeeError.message },
          { status: 500 }
        );
      }
    }

    // Generate token
    const token = signToken({
      userId: user._id,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Signup error:', error);
    
    // Check if error is due to duplicate email
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 409 }
      );
    }
    
    // Check if error is due to validation (like password length)
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { error: validationErrors.join(', ') },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}