const express = require('express');
const fs = require('fs');

const app = express();

app.use(express.json());

/* app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Welcome to the Scout REST API',
    app: 'Scout',
  });
});

app.post('/', (req, res) => {
  res.send({
    message: 'You can post to this URL',
    app: 'Stark',
  });
}); */

const movies = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/movies-simple.json`),
);

app.get('/api/v1/movies/:id', (req, res) => {
  const id = Number(req.params.id);
  const movie = movies.find((el) => el.id === id);

  if (!movie) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }
  res.status(200).json({
    status: 'success',
    results: movies.length,
    data: {
      movie: movie,
    },
  });
});

app.post('/api/v1/movies', (req, res) => {
  console.log(req.body);
  const newId = movies[movies.length - 1].id + 1;
  console.log(newId);
  const newMovie = Object.assign({ id: newId }, req.body);
  console.log(newMovie);
  movies.push(newMovie);

  fs.writeFile(
    `${__dirname}/dev-data/data/movies-simple.json`,
    JSON.stringify(movies),
    (err) => {
      res.status(201).json({
        status: 'success',
        data: {
          movie: newMovie,
        },
      });
    },
  );
});

const port = 3000;
app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});
