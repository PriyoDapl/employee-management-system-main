import mongoose from 'mongoose';

const roleEmailMappingSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

roleEmailMappingSchema.index({ role: 1 });
roleEmailMappingSchema.index({ isActive: 1 });

export const RoleEmailMapping = mongoose.models.RoleEmailMapping || mongoose.model('RoleEmailMapping', roleEmailMappingSchema);

export default RoleEmailMapping;
