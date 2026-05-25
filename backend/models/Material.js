import mongoose from 'mongoose';

const materialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true, // This can be text or a URL based on type
  },
  type: {
    type: String,
    enum: ['text', 'video', 'link'],
    default: 'text'
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Course',
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  isCompleted: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

const Material = mongoose.model('Material', materialSchema);
export default Material;
