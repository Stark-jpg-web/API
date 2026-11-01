const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true,
    maxlength: [40, 'Your name must not exceed 40 characters'],
    minlength: [3, 'Your name must be at least 3 characters long'],
    unique: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    trim: true,
    lowercase: true,
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide your password'],
    trim: true,
    minlength: [8, 'Your password must be at least 8 characters long'],
    maxlength: [12, 'Your password must not exceed 12 characters'],
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please provide your password confirm'],
    trim: true,
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'admin'],
    default: 'user',
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
