const mongoose = require('mongoose');
require('dotenv').config();

const app = require('./app');

const db = process.env.DATABASE_URL.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(db, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(con => {
    console.log('db connection successful');
  })
  .catch(err => {
    console.log(`Mongoose could not connect.`);
    console.log(err);
  });

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`App running on port ${port} 😬`);
});
