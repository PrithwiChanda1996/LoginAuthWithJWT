const express = require("express");
const expressLayout = require("express-ejs-layouts");
const connectDB = require("./config/db");
const path = require("path");

const app = express();

//Connect Database
connectDB();

//EJS setup
app.use(expressLayout);
app.set("view engine", "ejs");

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
