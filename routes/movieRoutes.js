const express = require('express');
const movieController = require('../controllers/movieController');

const router = express.Router();

/* router.param('id', movieController.checkId); */

router
  .route('/')
  .get(movieController.getAllMedia)
  .post(movieController.createMedia);

router
  .route('/:id')
  .get(movieController.getMedia)
  .delete(movieController.deleteMedia)
  .patch(movieController.updateMedia);

module.exports = router;
