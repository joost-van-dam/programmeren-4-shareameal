const express = require("express");
require("dotenv").config();
const app = express();
const port = process.env.PORT;
// const port = 3000;
const router = require("./src/routes/user.routes");
// require("dotenv").config();
const bodyParser = require("body-parser");
app.use(bodyParser.json());

app.all("*", (req, res, next) => {
  const method = req.method;
  // console.log(`Method ${method} is aangeroepen`);
  next();
});

app.use(router);

app.all("*", (req, res) => {
  res.status(400).json({
    status: 400,
    result: "End-point not found",
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
