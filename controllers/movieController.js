const fs = require('fs');

const movies = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/movies-simple.json`),
);

exports.getAllMovies = (req, res) => {
  res.status(200).json({
    status: 'success',
    results: movies.length,
    data: {
      movies,
    },
  });
};

exports.getMovie = (req, res) => {
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

exports.createMovie = (req, res) => {
  const newId = movies.length > 0 ? movies[movies.length - 1].id + 1 : 0;
  const newMovie = { id: newId, ...req.body };

  movies.push(newMovie);

  fs.writeFile(
    `${__dirname}/../dev-data/data/movies-simple.json`,
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
exports.updateMovie = (req, res) => {
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
      movie: { ...movie, ...req.body },
    },
  });
};

exports.deleteMovie = (req, res) => {
  const id = Number(req.params.id);
  const movieIndex = movies.findIndex((el) => el.id === id);

  if (movieIndex === -1) {
    return res.status(404).json({
      status: 'fail',
      message: 'Movie not found with that ID',
    });
  }

  movies.splice(movieIndex, 1);

  fs.writeFile(
    `${__dirname}/../dev-data/data/movies-simple.json`,
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
