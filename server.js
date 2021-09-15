const express = require("express");
const connectDB = require("./config/db");
const path = require("path");

const app = express();

//Connect Database
connectDB();
//Init Middleware
app.use(express.json({ extended: false }));

app.use("/dashboard", require("./api/dashboard"));
app.use("/", require("./api/auth"));

const PORT = 4000;

app.listen(PORT, () => {
  console.log(`Server started on port: ${PORT}`);
});
