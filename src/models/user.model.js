const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  favorites: {
    type: [
      {
        id: {
          type: Number,
        },
        title: {
          type: String,
        },
        url: {
          type: String,
        },
        img: {
          type: String,
        },
      },
    ],
  },
  chatId: {
    type: String,
  },
  isAdvancedCmdUsed: {
    type: Boolean,
  },
});

module.exports = mongoose.model('user', userSchema);
