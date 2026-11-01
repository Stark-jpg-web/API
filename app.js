const express = require('express');
const morgan = require('morgan');

const movieRouter = require('./routes/movieRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();
app.use(express.json());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.static(`${__dirname}/public`));

//movie router
app.use('/api/v1/movies', movieRouter);

//user router
app.use('/api/v1/users', userRouter);

module.exports = app;
