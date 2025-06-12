import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { PositionEmailMapping } from "@/model/PositionEmailMapping";
import { User } from "@/model/User";
import { verifyToken, getTokenFromHeaders } from "@/lib/auth";

// Helper function to get and verify token from request
const getAuthenticatedUser = (request) => {
  const token = getTokenFromHeaders(request.headers);
  if (!token) {
    throw new Error("No token provided");
  }
  return verifyToken(token);
};

// DELETE - Delete position email mapping (Management only)
export async function DELETE(request, { params }) {
  try {
    const decoded = getAuthenticatedUser(request);

    await dbConnect();

    // Check if user is management
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== "management") {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Only management can delete position email mappings",
        },
        { status: 403 }
      );
    }

    const { id } = params;

    // Find and delete the mapping
    const mapping = await PositionEmailMapping.findById(id);
    if (!mapping || !mapping.isActive) {
      return NextResponse.json(
        {
          success: false,
          error: "Position email mapping not found",
        },
        { status: 404 }
      );
    }

    // Soft delete by setting isActive to false
    mapping.isActive = false;
    mapping.updatedBy = decoded.userId;
    await mapping.save();

    return NextResponse.json({
      success: true,
      message: "Position email mapping deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/management/position-emails/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to delete position email mapping",
      },
      { status: error.message === "No token provided" ? 401 : 500 }
    );
  }
}
