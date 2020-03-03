const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

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
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
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
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date
});

/**
 * Middlewares - run between getting the data and saving to the db
 */
userSchema.pre('save', async function(next) {
  // Only run if pw was modified
  if (!this.isModified('password')) return next();

  // Hash pw w/ cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field - don't need to persist to db
  this.passwordConfirm = null;
  next();
});

/**
 * INSTANCE METHODS (available on all documets in the User collection)
 */

// Return true if passwords match
userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Return true if User pw has been changed subsequent to passed in JWT, otherwise return false
userSchema.methods.changedPasswordAfterTokenIssued = function(token) {
  if (this.passwordChangedAt) {
    const passwordChangedAtTimestamp = this.passwordChangedAt.getTime() / 1000;

    return token.iat < passwordChangedAtTimestamp;
  }
  return false;
};

// Generate a random token for password reset
userSchema.methods.createPasswordResetToken = function() {
  // Generate a 32 byte cryptographically strong psuedo-random token
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Modify document with encrypted password reset token
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Modify document with expiry date 10 minutes from when token created
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  // Return plaintext reset token
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
