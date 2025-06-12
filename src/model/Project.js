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
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Index for better performance
projectSchema.index({ name: 1 });
projectSchema.index({ createdAt: -1 });
projectSchema.index({ isActive: 1 });

// To prevent the "OverwriteModelError" when the model is already defined.
if (mongoose.models.Project) {
  delete mongoose.models.Project;
}

export const Project = mongoose.model('Project', projectSchema);

export default Project;
