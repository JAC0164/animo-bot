const mongoose = require("mongoose");

mongoose
  .connect(
    "mongodb+srv://charo164:" + process.env.DB_USER_PASS + "@cluster0.zcti7.mongodb.net/animo",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    }
  )
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("Failed to connect to MongoDB", err));
