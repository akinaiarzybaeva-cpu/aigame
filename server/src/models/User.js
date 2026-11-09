import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 30 },
  username: { type: String, required: true, trim: true, lowercase: true, unique: true, minlength: 3, maxlength: 20 },
  email: { type: String, required: true, trim: true, lowercase: true, unique: true },
  passwordHash: { type: String, required: true, select: false },
  xp: { type: Number, default: 0, min: 0 },
  completedGames: { type: [String], default: [] },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
