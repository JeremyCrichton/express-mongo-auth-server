/**
 * Express application configuration
 */

const express = require('express');
const morgan = require('morgan');

const userRouter = require('./routes/userRoutes');

const app = express();

/**
 *m MIDDLEWARES
 */
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Add data from body to req object (add body property on req obj)
app.use(express.json());
// app.use(express.static(`${__dirname}/public`)); //Serve static files from the public folder

// Add date of req to req object
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

/**
 * ROUTES
 */
app.use('/api/v1/users', userRouter);

module.exports = app;
