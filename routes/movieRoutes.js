const express = require('express');
const moviesController = require('../controllers/movieController');

const router = express.Router();

router.param('id', (req, res, next, val) => {
  console.log('The ID is:', val);
  next();
});

router
  .route('/')
  .get(moviesController.getAllMovies)
  .post(moviesController.createMovie);

router
  .route('/:id')
  .get(moviesController.getMovie)
  .delete(moviesController.deleteMovie)
  .patch(moviesController.updateMovie);

module.exports = router;
