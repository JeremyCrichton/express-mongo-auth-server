/**
 * Function to replace trycatch blocks in async functions
 * - Wrap async functions in this function
 * - this fn returns an anon fn which will be assignd to the particular method (ex. createTour)
 * - this anon fn will be called when a new tour is created using the createTour handler
 * - it will call the fn we passed in initially and execute the code within
 * - since the fn passed in is an async fn, it will return a promise, so if there is an error, we catch the error with the catch method here
 * - this catch method passes the error into the next() fn which will send the error to our global error handling middleware
 */

module.exports = fn => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
