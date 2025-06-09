import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Project from '@/model/Project';
import { verifyToken, getTokenFromHeaders } from '@/lib/auth';

// Helper function to get and verify token from request
const getAuthenticatedUser = (request) => {
  const token = getTokenFromHeaders(request.headers);
  if (!token) {
    throw new Error('No token provided');
  }
  return verifyToken(token);
};

// GET - Fetch all projects
export async function GET(request) {
  try {
    // Verify token
    const decoded = getAuthenticatedUser(request);
    
    await dbConnect();

    // Fetch projects
    const projects = await Project.find({})
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      projects
    });

  } catch (error) {
    console.error('GET /api/projects error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch projects'
      },
      { status: error.message === 'Invalid token' ? 401 : 500 }
    );
  }
}

// POST - Create new project
export async function POST(request) {
  try {
    // Verify token
    const decoded = getAuthenticatedUser(request);
    
    await dbConnect();

    const body = await request.json();
    const { name, details } = body;

    // Validate required fields
    if (!name || !details) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Project name and details are required' 
        },
        { status: 400 }
      );
    }

    // Create project data
    const projectData = {
      name: name.trim(),
      details: details.trim(),
    };

    // Create project
    const project = new Project(projectData);
    await project.save();

    return NextResponse.json({
      success: true,
      message: 'Project created successfully',
      project: project
    }, { status: 201 });

  } catch (error) {
    console.error('POST /api/projects error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to create project'
      },
      { status: error.message === 'Invalid token' ? 401 : 500 }
    );
  }
}
