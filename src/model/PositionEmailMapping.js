import mongoose from 'mongoose';

const positionEmailMappingSchema = new mongoose.Schema({
  position: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  employeeName: {
    type: String,
    required: true,
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

positionEmailMappingSchema.index({ position: 1 });
positionEmailMappingSchema.index({ isActive: 1 });

export const PositionEmailMapping = mongoose.models.PositionEmailMapping || mongoose.model('PositionEmailMapping', positionEmailMappingSchema);

export default PositionEmailMapping;
