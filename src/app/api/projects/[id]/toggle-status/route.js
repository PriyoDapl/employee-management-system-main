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

// PATCH - Toggle project active status
export async function PATCH(request, { params }) {
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

    // Toggle the active status
    const updatedProject = await Project.findByIdAndUpdate(
      id,
      { isActive: !project.isActive },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      message: `Project ${updatedProject.isActive ? 'opened' : 'closed'} successfully`,
      project: updatedProject
    });

  } catch (error) {
    console.error('PATCH /api/projects/[id]/toggle-status error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to toggle project status'
      },
      { status: error.message === 'Invalid token' ? 401 : 500 }
    );
  }
}
