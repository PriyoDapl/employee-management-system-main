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

// GET - Fetch single project
export async function GET(request, { params }) {
  try {
    // Verify token
    const decoded = getAuthenticatedUser(request);
    
    await dbConnect();

    const { id } = params;

    const project = await Project.findById(id);

    if (!project) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Project not found' 
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      project
    });

  } catch (error) {
    console.error('GET /api/projects/[id] error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch project'
      },
      { status: error.message === 'Invalid token' ? 401 : 500 }
    );
  }
}

// PUT - Update project
export async function PUT(request, { params }) {
  try {
    // Verify token
    const decoded = getAuthenticatedUser(request);
    
    await dbConnect();

    const { id } = params;
    const body = await request.json();
    const { name, details } = body;

    // Find the project
    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Project not found' 
        },
        { status: 404 }
      );
    }

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

    // Update project data
    const updateData = {
      name: name.trim(),
      details: details.trim(),
    };

    // Update the project
    const updatedProject = await Project.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Project updated successfully',
      project: updatedProject
    });

  } catch (error) {
    console.error('PUT /api/projects/[id] error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to update project'
      },
      { status: error.message === 'Invalid token' ? 401 : 500 }
    );
  }
}

// DELETE - Delete project
export async function DELETE(request, { params }) {
  try {
    // Verify token
    const decoded = getAuthenticatedUser(request);
    
    await dbConnect();

    const { id } = params;

    // Find the project
    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Project not found' 
        },
        { status: 404 }
      );
    }

    // Delete the project permanently
    await Project.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully'
    });

  } catch (error) {
    console.error('DELETE /api/projects/[id] error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to delete project'
      },
      { status: error.message === 'Invalid token' ? 401 : 500 }
    );
  }
}
