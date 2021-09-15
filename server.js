const express = require("express");
const connectDB = require("./config/db");
const path = require("path");

const app = express();

//Connect Database
connectDB();
//Init Middleware
app.use(express.json({ extended: false }));

//Define routes
app.get("/", (req, res) => {
  res.send("Server running");
});
app.use("/api/dashboard", require("./api/dashboard"));
app.use("/api/auth", require("./api/auth"));

const PORT = 4000;

app.listen(PORT, () => {
  console.log(`Server started on port: ${PORT}`);
});
