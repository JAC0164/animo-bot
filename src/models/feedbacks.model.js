const mongoose = require("mongoose");

const FeedbacksSchema = new mongoose.Schema({
  value: String,
});

module.exports = mongoose.model("feedbacks", FeedbacksSchema);
