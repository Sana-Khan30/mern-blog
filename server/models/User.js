import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,           // spaces remove karta hai automatically
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,      // hamesha lowercase save hoga
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,        // ⚠️ IMPORTANT: queries mein password automatically nahi aayega
    },
    avatar: {
      type: String,
      default: '',          // Cloudinary URL baad mein save hoga
    },
    bio: {
      type: String,
      default: '',
      maxlength: [200, 'Bio cannot exceed 200 characters'],
    },
    role: {
      type: String,
      enum: ['user', 'admin'],  // sirf yeh do values allowed hain
      default: 'user',
    },
  },
  {
    timestamps: true, // createdAt aur updatedAt automatically add hoga
  }
);

// ─── PASSWORD HASH MIDDLEWARE ──────────────────────
// .save() se pehle automatically chalta hai
// "pre hook" kehte hain ise
userSchema.pre('save', async function (next) {
  // Agar password change nahi hua toh skip karo
  // (profile update pe dobara hash na ho)
  if (!this.isModified('password')) return next();

  // Salt generate karo — 12 rounds = secure + fast balance
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ─── PASSWORD COMPARE METHOD ───────────────────────
// Login ke waqt use hoga: user.comparePassword(enteredPassword)
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;