import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: [100, 'Project name cannot exceed 100 characters'],
  },
  details: {
    type: String,
    required: [true, 'Project details are required'],
    trim: true,
    maxlength: [5000, 'Project details cannot exceed 5000 characters'],
  },
}, {
  timestamps: true,
});

// Index for better performance
projectSchema.index({ name: 1 });
projectSchema.index({ createdAt: -1 });

// Force delete any existing model to prevent caching issues
if (mongoose.models.Project) {
  delete mongoose.models.Project;
}

export const Project = mongoose.model('Project', projectSchema);

export default Project;
