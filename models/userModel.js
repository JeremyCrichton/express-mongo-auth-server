const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!']
  },
  email: {
    type: String,
    required: [true, 'Please provide your email address.'],
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'A user must have a password']
  },
  passwordConfirm: {
    type: String,
    required: [true, 'A user must have a password']
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
