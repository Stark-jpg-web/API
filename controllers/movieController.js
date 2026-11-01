const Media = require('../models/mediaModel');

exports.getAllMedia = async (req, res) => {
  try {
    const media = await Media.find();
    res.status(200).json({
      status: 'success',
      results: media.length,
      data: {
        media: media,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'Fail',
      message: `Bad Request : ${err}`,
    });
  }
};

exports.getMedia = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: {
        media: media,
        message: 'Movie Found',
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'Fail',
      message: `Bad Request : ${err}`,
    });
  }
};

exports.createMedia = async (req, res) => {
  try {
    const newMedia = await Media.create(req.body);
    res.status(200).json({
      status: 'success',
      data: {
        media: newMedia,
        message: 'media created successfully',
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'Fail',
      message: `Bad Request : ${err}`,
    });
  }
};

exports.updateMedia = async (req, res) => {
  try {
    const media = await Media.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'success',
      data: {
        media: media,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'Fail',
      message: `Bad Request : ${err}`,
    });
  }
};

exports.deleteMedia = async (req, res) => {
  try {
    await Media.findByIdAndDelete(req.params.id);
    res.status(204).json({ status: null });
  } catch (err) {
    res.status(400).json({
      status: 'Fail',
      message: `Bad Request : ${err}`,
    });
  }
};
