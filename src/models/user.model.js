const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
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
          msg: [Number],
        },
      ],
    },
    isAdvancedCmdUsed: {
      type: Boolean,
    },
  }
);

module.exports = mongoose.model("user", userSchema);
