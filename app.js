const express = require('express');
const fs = require('fs');

const app = express();

app.use(express.json());

const movies = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/movies-simple.json`),
);

const getAllMovies = (req, res) => {
  res.status(200).json({
    status: 'success',
    results: movies.length,
    data: {
      movies,
    },
  });
};

const getMovie = (req, res) => {
  const id = Number(req.params.id);
  const movie = movies.find((el) => el.id === id);

  if (!movie) {
    return res.status(404).json({
      status: 'fail',
      message: 'Movie not found with that ID',
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      movie,
    },
  });
};

const createMovie = (req, res) => {
  const newId = movies[movies.length - 1].id + 1;
  const newMovie = { id: newId, ...req.body };

  movies.push(newMovie);

  fs.writeFile(
    `${__dirname}/dev-data/data/movies-simple.json`,
    JSON.stringify(movies),
    (err) => {
      if (err) {
        return res.status(500).json({
          status: 'error',
          message: 'Failed to persist movie data',
        });
      }

      res.status(201).json({
        status: 'success',
        data: {
          movie: newMovie,
        },
      });
    },
  );
};

(req, res) => {
  const id = Number(req.params.id);
  const movie = movies.find((el) => el.id === id);

  if (!movie) {
    return res.status(404).json({
      status: 'fail',
      message: 'Movie not found with that ID',
    });
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
};

const deleteMovie = (req, res) => {
  const id = Number(req.params.id);
  const movieIndex = movies.findIndex((el) => el.id === id);

  if (!movieIndex) {
    return res.status(404).json({
      status: 'fail',
      message: 'Movie not found with that ID',
    });
  }

  movies.splice(movieIndex, 1);

  fs.writeFile(
    `${__dirname}/dev-data/data/movies-simple.json`,
    JSON.stringify(movies),
    (err) => {
      if (err) {
        return res.status(500).json({
          status: 'error',
          message: 'Failed to persist movie data',
        });
      }

      res.status(204).json({
        status: 'success',
        data: null,
      });
    },
  );
};

/* // 1) GET all movies
app.get('/api/v1/movies', getAllMovies);

// 2) GET single movie by ID
app.get('/api/v1/movies/:id', getMovie);

// 3) POST new movie
app.post('/api/v1/movies', createMovie);

// 5) DELETE movie
app.delete('/api/v1/movies/:id', deleteMovie); */

app.route('/api/v1/movies').get(getAllMovies).post(createMovie);

app.route('/api/v1/movies/:id').get(getMovie).delete(deleteMovie);

const port = 3000;
app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});
