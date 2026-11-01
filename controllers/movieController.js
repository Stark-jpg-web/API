const fs = require('fs');

const movies = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/movies-simple.json`),
);

exports.checkId = (req, res, next, val) => {
  const id = Number(val);
  const movieIndex = movies.findIndex((el) => el.id === id);
  req.movie = movie;
  if (!movie) {
    return res.status(404).json({
      status: 'fail',
      message: 'Movie not found with that ID',
    });
  }
  req.movie = movies[movieIndex];
  req.movieIndex = movieIndex;
  next();
};

exports.checkBody = (req, res, next) => {
  console.log(req.body);
  if (!req.body.title || !req.body.releaseYear) {
    return res.status(400).json({
      status: 'fail',
      message: 'Missing Title or release_date',
    });
  }
  next();
};

exports.getAllMovies = (req, res) => {
  res.status(200).json({
    status: 'success',
    results: movies.length,
    data: {
      movies: movies,
    },
  });
};

exports.getMovie = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      movie: req.movie,
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
  res.status(200).json({
    status: 'success',
    data: {
      movie: { ...req.movie, ...req.body },
    },
  });
};

exports.deleteMovie = (req, res) => {
  movies.splice(req.movieIndex, 1);
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
