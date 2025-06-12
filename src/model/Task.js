import mongoose from "mongoose";

const taskActivitySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["Assigned", "In Progress", "On Hold", "Under Review", "Completed"],
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [500, "Comment cannot exceed 500 characters"],
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: true,
  }
);

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      maxlength: [200, "Task title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Task description cannot exceed 2000 characters"],
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Assigned employee is required"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator is required"],
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: ["Assigned", "In Progress", "On Hold", "Under Review", "Completed"],
      default: "Assigned",
    },
    dueDate: {
      type: Date,
      validate: {
        validator: function (value) {
          if (!value) return true;
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const dueDate = new Date(value);
          dueDate.setHours(0, 0, 0, 0);
          return dueDate >= today;
        },
        message: "Due date cannot be in the past",
      },
    },
    completedDate: {
      type: Date,
    },
    estimatedHours: {
      type: Number,
      min: [0.5, "Estimated hours must be at least 0.5"],
      max: [1000, "Estimated hours cannot exceed 1000"],
    },
    actualHours: {
      type: Number,
      min: [0, "Actual hours cannot be negative"],
      max: [1000, "Actual hours cannot exceed 1000"],
    },
    tags: [{
      type: String,
      trim: true,
      maxlength: [50, "Tag cannot exceed 50 characters"],
    }],
    attachments: [{
      fileName: String,
      fileUrl: String,
      uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    activity: [taskActivitySchema],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ projectId: 1, status: 1 });
taskSchema.index({ createdBy: 1, createdAt: -1 });
taskSchema.index({ dueDate: 1, status: 1 });
taskSchema.index({ priority: 1, status: 1 });
taskSchema.index({ status: 1, isActive: 1 });

// Middleware to add initial activity entry when task is created
taskSchema.pre('save', function(next) {
  if (this.isNew) {
    this.activity.push({
      status: this.status,
      updatedBy: this.createdBy,
      comment: "Task created",
    });
  }
  next();
});

// Another Middleware to handle completed date
taskSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'Completed' && !this.completedDate) {
      this.completedDate = new Date();
    } else if (this.status !== 'Completed') {
      this.completedDate = undefined;
    }
  }
  next();
});

// Virtual for checking if task is overdue
taskSchema.virtual('isOverdue').get(function() {
  return this.dueDate < new Date() && this.status !== 'Completed';
});

// Virtual for progress percentage based on status (not in use but for later reference)
taskSchema.virtual('progressPercentage').get(function() {
  const statusProgress = {
    'Assigned': 0,
    'In Progress': 25,
    'On Hold': 25,
    'Under Review': 75,
    'Completed': 100,
  };
  return statusProgress[this.status] || 0;
});

// Method to add activity entry
taskSchema.methods.addActivity = function(status, updatedBy, comment = '') {
  this.activity.push({
    status,
    updatedBy,
    comment,
    timestamp: new Date(),
  });
  this.status = status;
  return this.save();
};

// Static method to get tasks by employee
taskSchema.statics.getTasksByEmployee = function(employeeId, filters = {}) {
  const query = { assignedTo: employeeId, isActive: true };
  
  if (filters.status) {
    query.status = filters.status;
  }
  
  if (filters.priority) {
    query.priority = filters.priority;
  }
  
  if (filters.projectId) {
    query.projectId = filters.projectId;
  }
  
  if (filters.overdue) {
    query.dueDate = { $lt: new Date() };
    query.status = { $ne: 'Completed' };
  }
  
  return this.find(query)
    .populate('projectId', 'name isActive')
    .populate('createdBy', 'firstName lastName email')
    .populate('activity.updatedBy', 'firstName lastName email')
    .sort({ dueDate: 1, priority: -1 });
};

// Static method to get tasks by project
taskSchema.statics.getTasksByProject = function(projectId, filters = {}) {
  const query = { projectId, isActive: true };
  
  if (filters.status) {
    query.status = filters.status;
  }
  
  if (filters.assignedTo) {
    query.assignedTo = filters.assignedTo;
  }
  
  return this.find(query)
    .populate('assignedTo', 'firstName lastName email')
    .populate('createdBy', 'firstName lastName email')
    .populate('activity.updatedBy', 'firstName lastName email')
    .sort({ dueDate: 1, priority: -1 });
};

export const Task = mongoose.models.Task || mongoose.model("Task", taskSchema);

export default Task;
