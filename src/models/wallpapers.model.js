const mongoose = require("mongoose");

const WallpaperSchema = new mongoose.Schema({
  fileUniqueId: String,
  fileId: String,
  caption: String,
});

module.exports = mongoose.model("wallpaper", WallpaperSchema);
