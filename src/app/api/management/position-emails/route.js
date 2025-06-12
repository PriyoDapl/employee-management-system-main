import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { PositionEmailMapping } from "@/model/PositionEmailMapping";
import { User } from "@/model/User";
import { Employee } from "@/model/Employee";
import { verifyToken, getTokenFromHeaders } from "@/lib/auth";

// Helper function to get and verify token from request
const getAuthenticatedUser = (request) => {
  const token = getTokenFromHeaders(request.headers);
  if (!token) {
    throw new Error("No token provided");
  }
  return verifyToken(token);
};

// GET - Get all position email mappings (Management only)
export async function GET(request) {
  try {
    const decoded = getAuthenticatedUser(request);

    await dbConnect();

    // Check if user is management
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== "management") {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Only management can view position email mappings",
        },
        { status: 403 }
      );
    }

    // Fetch all position email mappings
    const mappings = await PositionEmailMapping.find({ isActive: true })
      .populate("createdBy", "firstName lastName email")
      .populate("updatedBy", "firstName lastName email")
      .sort({ position: 1 });

    return NextResponse.json({
      success: true,
      mappings,
    });
  } catch (error) {
    console.error("GET /api/management/position-emails error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch position email mappings",
      },
      { status: error.message === "No token provided" ? 401 : 500 }
    );
  }
}

// POST - Create new position email mapping (Management only)
export async function POST(request) {
  try {
    const decoded = getAuthenticatedUser(request);

    await dbConnect();

    // Check if user is management
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== "management") {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Only management can create position email mappings",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { position, employeeName, email, description } = body;

    // Validate required fields
    if (!position || !employeeName || !email) {
      return NextResponse.json(
        {
          success: false,
          error: "Position, employee name, and email are required",
        },
        { status: 400 }
      );
    }

    // Check if position already exists
    const existingMapping = await PositionEmailMapping.findOne({
      position: position.trim(),
      isActive: true,
    });
    if (existingMapping) {
      return NextResponse.json(
        {
          success: false,
          error: "Position email mapping already exists for this position",
        },
        { status: 409 }
      );
    }

    // Create mapping
    const mapping = new PositionEmailMapping({
      position: position.trim(),
      employeeName: employeeName.trim(),
      email: email.trim().toLowerCase(),
      description: description?.trim() || "",
      createdBy: decoded.userId,
    });

    await mapping.save();

    // Populate mapping data for response
    await mapping.populate([
      { path: "createdBy", select: "firstName lastName email" },
    ]);

    return NextResponse.json(
      {
        success: true,
        message: "Position email mapping created successfully",
        mapping,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/management/position-emails error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create position email mapping",
      },
      { status: error.message === "No token provided" ? 401 : 500 }
    );
  }
}

// PUT - Update position email mapping (Management only)
export async function PUT(request) {
  try {
    const decoded = getAuthenticatedUser(request);

    await dbConnect();

    // Check if user is management
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== "management") {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Only management can update position email mappings",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, position, employeeName, email, description } = body;

    // Validate required fields
    if (!id || !position || !employeeName || !email) {
      return NextResponse.json(
        {
          success: false,
          error: "ID, position, employee name, and email are required",
        },
        { status: 400 }
      );
    }

    // Find the mapping
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

    // Check if position already exists for another mapping
    const existingMapping = await PositionEmailMapping.findOne({
      position: position.trim(),
      isActive: true,
      _id: { $ne: id },
    });
    if (existingMapping) {
      return NextResponse.json(
        {
          success: false,
          error: "Position email mapping already exists for this position",
        },
        { status: 409 }
      );
    }

    // Update mapping
    mapping.position = position.trim();
    mapping.employeeName = employeeName.trim();
    mapping.email = email.trim().toLowerCase();
    mapping.description = description?.trim() || "";
    mapping.updatedBy = decoded.userId;

    await mapping.save();

    // Populate mapping data for response
    await mapping.populate([
      { path: "createdBy", select: "firstName lastName email" },
      { path: "updatedBy", select: "firstName lastName email" },
    ]);

    return NextResponse.json({
      success: true,
      message: "Position email mapping updated successfully",
      mapping,
    });
  } catch (error) {
    console.error("PUT /api/management/position-emails error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update position email mapping",
      },
      { status: error.message === "No token provided" ? 401 : 500 }
    );
  }
}
