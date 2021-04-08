const mongoose = require("mongoose");

const AnimeSchema = new mongoose.Schema({
  file_id: Number,
  title: String,
  caption: String,
});

module.exports = mongoose.model("anime", AnimeSchema);
