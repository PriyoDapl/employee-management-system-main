import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { User } from "@/model/User";
import { signToken } from "@/lib/auth";

export async function POST(request) {
  try {
    await dbConnect();

    const { email, password } = await request.json();

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Generate token
    const token = signToken({
      userId: user._id,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    // Provide more specific error messages for debugging
    if (error.name === "MongoServerError") {
      console.error("MongoDB connection error:", error.message);
      if (error.code === 8000) {
        console.error(
          "Authentication failed - check MongoDB Atlas credentials"
        );
      }
    }

    return NextResponse.json(
      { error: "Internal server error..." },
      { status: 500 }
    );
  }
}
