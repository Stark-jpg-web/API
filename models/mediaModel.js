const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema(
  {
    tmdbId: {
      type: Number,
      required: [true, 'A media item must have a TMDB ID'],
      unique: true,
      index: true,
    },
    mediaType: {
      type: String,
      required: [true, 'A media item must have a media type'],
      enum: {
        values: ['movie', 'tv'],
        message: 'Media type must be either movie or tv',
      },
    },
    title: {
      type: String,
      required: [true, 'A media item must have a title'],
      trim: true,
    },
    originalTitle: {
      type: String,
      trim: true,
    },
    overview: {
      type: String,
      default: '',
      trim: true,
    },
    overviewAr: {
      type: String,
      default: '',
      trim: true,
    },
    posterPath: {
      type: String,
      trim: true,
    },
    backdropPath: {
      type: String,
      trim: true,
    },
    releaseDate: {
      type: String,
      trim: true,
    },
    voteAverage: {
      type: Number,
      default: 0,
      min: [0, 'Rating must be above or equal to 0'],
      max: [10, 'Rating must be below or equal to 10'],
    },
    voteCount: {
      type: Number,
      default: 0,
      min: [0, 'Vote count cannot be negative'],
    },
    genres: [
      {
        id: Number,
        name: String,
      },
    ],
    runtime: Number,
    numberOfSeasons: Number,
    numberOfEpisodes: Number,
    budget: Number,
    revenue: Number,
    status: {
      type: String,
      trim: true,
    },
    lastCachedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual populate for reviews
mediaSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'mediaId',
  localField: 'tmdbId',
});

const Media = mongoose.model('Media', mediaSchema);

module.exports = Media;
