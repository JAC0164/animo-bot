const mongoose = require('mongoose');

const AnimeSchema = new mongoose.Schema(
  {
    name: String,
    episode: {
      type: Number,
      require: true,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('anime', AnimeSchema);
