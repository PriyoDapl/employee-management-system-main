import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Employee } from '@/model/Employee';
import { User } from '@/model/User';
import { verifyToken, getTokenFromHeaders } from '@/lib/auth';

export async function GET(request) {
  try {
    await dbConnect();
    
    const token = getTokenFromHeaders(request.headers);
    if (!token) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (decoded.role !== 'management') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Get all users with their employee data if they exist
    const users = await User.find()
      .select('email firstName lastName role isActive createdAt')
      .sort({ createdAt: -1 });

    // For users with employee role, also fetch their employee data
    const usersWithEmployeeData = await Promise.all(
      users.map(async (user) => {
        if (user.role === 'employee') {
          const employeeData = await Employee.findOne({ user: user._id })
            .select('employeeId department position salary hireDate skills personalInfo isActive createdAt updatedAt');
          return {
            ...user.toJSON(),
            employeeData: employeeData || null
          };
        }
        return user.toJSON();
      })
    );

    return NextResponse.json(usersWithEmployeeData);
  } catch (error) {
    console.error('Management users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
