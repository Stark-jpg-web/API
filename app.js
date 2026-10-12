const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Hello from the tour API',
    app: 'Stark',
  });
});

app.post('/', (req, res) => {
  res.send({
    message: 'You can post to this URL',
    app: 'Stark',
  });
});

const port = 3000;
app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});
