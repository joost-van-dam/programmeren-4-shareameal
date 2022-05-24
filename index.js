const express = require("express");
require("dotenv").config();
const app = express();
const port = process.env.PORT;
// const port = 3000;
const userRoutes = require("./src/routes/user.routes");
const authRoutes = require("./src/routes/auth.routes");
const mealRoutes = require("./src/routes/meal.routes");
// const jwt = require("./src/jwt-test");
// require("dotenv").config();
const bodyParser = require("body-parser");
app.use(bodyParser.json());

app.all("*", (req, res, next) => {
  const method = req.method;
  // console.log(`Method ${method} is aangeroepen`);
  next();
});

app.use(userRoutes);
app.use(authRoutes);
app.use(mealRoutes);
// jwt.sign;

app.all("*", (req, res) => {
  console.log("Let op index.js fout handler");
  res.status(400).json({
    status: 400,
    result: "End-point not found",
  });
});

// Hier moet je nog je Express errorhandler toevoegen.
app.use((err, req, res, next) => {
  res.status(err.status).json({
    status: err.status,
    message: err.message,
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

module.exports = app;
