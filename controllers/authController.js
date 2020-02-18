const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

exports.signup = async (req, res, next) => {
  try {
    // const newUser = await User.create(req.body); // WRONG version - any user could sign up as admin
    const { name, email, password, passwordConfirm } = req.body;
    const newUser = await User.create({
      name,
      email,
      password,
      passwordConfirm
    });
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: newUser
      }
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      status: 'fail',
      message: 'Invalid data sent'
    });
  }
};

exports.login = (req, res, next) => {
  const { email, password } = req.body;

  // Do stuff
};
