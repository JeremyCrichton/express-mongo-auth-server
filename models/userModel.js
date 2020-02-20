const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!']
  },
  email: {
    type: String,
    required: [true, 'Please provide your email address.'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false // Never show in any output
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    minlength: 6,
    select: false,
    validate: {
      // This only works on CREATE or SAVE
      validator: function(el) {
        return el === this.password;
      },
      message: 'Pleae make sure your passwords match.'
    }
  }
});

// pre runs between getting the data and saving to the db
userSchema.pre('save', async function(next) {
  // Only run if pw was modified
  if (!this.isModified('password')) return next();

  // Hash pw w/ cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field - don't need to persist to db
  this.passwordConfirm = null;
  next();
});

// Create an instance method to be available on all documents in this User collection
// - return true if passwords match
userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
