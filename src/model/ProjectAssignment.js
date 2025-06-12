import mongoose from "mongoose";

const projectAssignmentSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedDate: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, "Notes cannot exceed 1000 characters"],
    },
  },
  {
    timestamps: true,
  }
);

projectAssignmentSchema.index({ employeeId: 1 });
projectAssignmentSchema.index({ projectId: 1 });
projectAssignmentSchema.index({ assignedDate: -1 });

// Here is the unique assignment per project-employee combination
projectAssignmentSchema.index(
  { projectId: 1, employeeId: 1 },
  { unique: true }
);

export const ProjectAssignment =
  mongoose.models.ProjectAssignment ||
  mongoose.model("ProjectAssignment", projectAssignmentSchema);

export default ProjectAssignment;
