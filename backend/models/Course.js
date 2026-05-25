import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  color: { type: String, default: 'bg-slate-500' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

const Course = mongoose.model('Course', courseSchema);
export default Course;
