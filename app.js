const express = require('express');

const app = express();

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

app.get('/api/v1/movies/genres/action', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Welcome to the Scout REST API Action Movies',
    app: 'Scout',
  });
});

const port = 3000;
app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});
