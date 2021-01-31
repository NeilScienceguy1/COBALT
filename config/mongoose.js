const mongoose = require("mongoose");

const connectDB = (uri) => {
  const connect = (uri) => {
    mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    mongoose.connection.on("connected", () => {
      console.log("Connected To MongoDB");
    });

    mongoose.connection.on("error", (err) => {
      return;
    });
  };
  connect(uri);
};

module.exports = connectDB;
