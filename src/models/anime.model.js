const mongoose = require('mongoose');

const AnimeSchema = new mongoose.Schema(
  {
    name: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('anime', AnimeSchema);
