import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Employee } from "@/model/Employee";
import { User } from "@/model/User";
import { verifyToken, getTokenFromHeaders } from "@/lib/auth";

// GET FUNCTION: Fetch Employee Profile
export async function GET(request) {
  try {
    await dbConnect();

    const token = getTokenFromHeaders(request.headers);
    if (!token) {
      return NextResponse.json(
        { error: "Authorization token required" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (decoded.role !== "employee") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const employee = await Employee.findOne({ user: decoded.userId }).populate(
      "user",
      "email firstName lastName"
    );

    if (!employee) {
      return NextResponse.json(
        { error: "Employee profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(employee);
  } catch (error) {
    console.error("Employee profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST FUNCTION: Create Employee Profile
export async function POST(request) {
  try {
    await dbConnect();

    const token = getTokenFromHeaders(request.headers);
    if (!token) {
      return NextResponse.json(
        { error: "Authorization token required" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (decoded.role !== "employee") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Check if employee profile already exists
    let existingEmployee = await Employee.findOne({ user: decoded.userId });
    if (existingEmployee) {
      return NextResponse.json(
        {
          error:
            "Employee profile already exists. You cannot create another profile. Contact management for any changes.",
        },
        { status: 400 }
      );
    }

    const {
      firstName,
      lastName,
      employeeId,
      department,
      position,
      salary,
      hireDate,
      phone,
      address,
      emergencyContact,
      skills,
    } = await request.json();

    // Validate required fields
    if (!firstName || !lastName || !department || !position || !hireDate) {
      return NextResponse.json(
        { error: "Please fill in all required fields" },
        { status: 400 }
      );
    }

    // Update user with name information
    await User.findByIdAndUpdate(decoded.userId, {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    });

    // Generate employee ID if not provided
    const finalEmployeeId = employeeId || `EMP${Date.now()}`;

    // Create new employee profile
    const employee = new Employee({
      user: decoded.userId,
      employeeId: finalEmployeeId,
      department: department.trim(),
      position: position.trim(),
      salary: salary ? parseFloat(salary) : undefined,
      hireDate: new Date(hireDate),
      skills: Array.isArray(skills)
        ? skills.filter((skill) => skill.trim())
        : [],
      personalInfo: {
        phone: phone?.trim() || "",
        address: {
          street: address?.trim() || "",
        },
        emergencyContact: {
          phone: emergencyContact?.trim() || "",
        },
      },
    });

    await employee.save();

    const populatedEmployee = await Employee.findById(employee._id).populate(
      "user",
      "email firstName lastName"
    );

    return NextResponse.json({
      message: "Employee profile created successfully!",
      employee: populatedEmployee,
    });
  } catch (error) {
    console.error("Employee profile creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT FUNCTION: Update Employee Profile (Management Only)
export async function PUT(request) {
  try {
    await dbConnect();

    const token = getTokenFromHeaders(request.headers);
    if (!token) {
      return NextResponse.json(
        { error: "Authorization token required" },
        { status: 401 }
      );
    }
    const decoded = verifyToken(token);

    // Only management can update employee profiles
    if (decoded.role !== "management") {
      return NextResponse.json(
        {
          error: "Access denied. Only management can update employee details.",
        },
        { status: 403 }
      );
    }

    const {
      employeeId,
      firstName,
      lastName,
      department,
      position,
      salary,
      hireDate,
      phone,
      address,
      emergencyContact,
      skills,
    } = await request.json();

    // Find employee by employeeId
    let employee;
    if (employeeId) {
      employee = await Employee.findOne({ employeeId }).populate("user");
    } else {
      return NextResponse.json(
        { error: "Employee ID is required for updates" },
        { status: 400 }
      );
    }

    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    // Update user information
    await User.findByIdAndUpdate(employee.user._id, {
      firstName,
      lastName,
    });

    // Update employee information
    const updateData = {
      department,
      position,
      salary: parseFloat(salary),
      hireDate: new Date(hireDate),
      skills: Array.isArray(skills) ? skills : [],
      personalInfo: {
        phone,
        address: {
          street: address,
        },
        emergencyContact: {
          phone: emergencyContact,
        },
      },
    };

    const updatedEmployee = await Employee.findByIdAndUpdate(
      employee._id,
      updateData,
      { new: true }
    ).populate("user", "email firstName lastName");

    return NextResponse.json({
      message: "Employee profile updated successfully",
      employee: updatedEmployee,
    });
  } catch (error) {
    console.error("Employee profile update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
