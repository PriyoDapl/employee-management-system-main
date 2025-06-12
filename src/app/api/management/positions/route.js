import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Employee } from "@/model/Employee";
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

// GET - Get unique positions and associated employee names (Management only)
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
          error: "Unauthorized: Only management can access this endpoint",
        },
        { status: 403 }
      );
    }

    // Get all employees with their user data
    const employees = await Employee.find({ isActive: true })
      .populate("user", "firstName lastName email isActive")
      .sort({ position: 1 });

    // Filter out employees with inactive users
    const activeEmployees = employees.filter(emp => emp.user && emp.user.isActive);

    // Group employees by position
    const positionGroups = {};
    activeEmployees.forEach(employee => {
      const position = employee.position;
      if (!positionGroups[position]) {
        positionGroups[position] = [];
      }
      
      const employeeName = employee.user.firstName && employee.user.lastName 
        ? `${employee.user.firstName} ${employee.user.lastName}`
        : employee.user.email;
      
      positionGroups[position].push({
        _id: employee._id,
        employeeId: employee.employeeId,
        name: employeeName,
        email: employee.user.email,
        userId: employee.user._id
      });
    });

    // Convert to array format with unique positions
    const positions = Object.keys(positionGroups).map(position => ({
      position,
      employees: positionGroups[position]
    }));

    return NextResponse.json({
      success: true,
      positions,
    });
  } catch (error) {
    console.error("GET /api/management/positions error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch positions",
      },
      { status: error.message === "No token provided" ? 401 : 500 }
    );
  }
}
