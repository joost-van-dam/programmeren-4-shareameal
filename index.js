const express = require("express");
require("dotenv").config();
const app = express();
const port = process.env.PORT;
// const port = 3000;
const userRoutes = require("./src/routes/user.routes");
const authRoutes = require("./src/routes/auth.routes");
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
// jwt.sign;

app.all("*", (req, res) => {
  res.status(400).json({
    status: 400,
    result: "End-point not found",
  });
});

// Hier moet je nog je Express errorhandler toevoegen.
app.use((err, req, res, next) => {
  console.log("Error: " + err.toString());
  console.log("Laten we dit even testen");
  // res.status(500).json({
  //   statusCode: 500,
  //   message: err.toString(),
  //   error: err.message,
  //   error2: err,
  // });

  res.status(err.status).json({
    status: err.status,
    message: err.message,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.log(
    "De error status: " + err.status + "\nDe error message: " + err.message
  );
  res.status(err.status).json(err);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

module.exports = app;
