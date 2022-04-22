const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

const bodyParser = require("body-parser");
app.use(bodyParser.json());

let databaseUser = [];
let idUser = 0;

// let databaseMovie = [];
// let idMovie = 0;

app.all("*", (req, res, next) => {
  const method = req.method;
  console.log(`Method ${method} is aangeroepen`);
  next();
});

app.get("/", (req, res) => {
  res.status(200).json({
    status: 200,
    result: "Hello World!",
  });
});

app.post("/api/user", (req, res) => {
  let user = req.body;
  // idUser++;

  user = {
    idUser,
    ...user,
  };
  console.log(user);

  // let contains = databaseUser.filter(
  //   (item) => item.emailAdress == user.emailAdress
  // );

  // let contains = databaseUser.filter(
  //   (item) => item.emailAdress == user.emailAdress
  // );
  // console.log("Contains = " + contains);

  console.log(
    "Contains: " +
      databaseUser.some((item) => item.emailAdress == user.emailAdress)
  );

  if (databaseUser.some((item) => item.emailAdress == user.emailAdress)) {
    // res.status(401).json({
    //   status: 401,
    //   result: "Forbidden.",
    // });

    res.status(401).send("Forbidden.");
  } else {
    databaseUser.push(user);
    res.status(201).json({
      id: idUser,
      firstName: user.firstName,
      lastName: user.lastName,
      street: user.lastName,
      city: user.city,
      isActive: true,
      emailAdress: user.emailAdress,
      password: user.password,
      phoneNumber: user.phoneNumber,
    });
  }
  idUser++;
});

// app.post("/api/movie", (req, res) => {
//   let movie = req.body;
//   idMovie++;
//   movie = {
//     idMovie,
//     ...movie,
//   };
//   console.log(movie);
//   databaseMovie.push(movie);
//   res.status(201).json({
//     status: 201,
//     result: databaseMovie,
//   });
// });

// app.get("/api/movie/:movieId", (req, res, next) => {
//   const movieId = req.params.movieId;
//   console.log(`Movie met ID ${movieId} gezocht`);
//   let movie = databaseMovie.filter((item) => item.idMovie == movieId);
//   if (movie.length > 0) {
//     console.log(movie);
//     res.status(200).json({
//       status: 200,
//       result: movie,
//     });
//   } else {
//     res.status(401).json({
//       status: 401,
//       result: `Movie with ID ${movieId} not found`,
//     });
//   }
// });

// app.get("/api/movie", (req, res, next) => {
//   res.status(200).json({
//     status: 200,
//     result: databaseMovie,
//   });
// });

app.all("*", (req, res) => {
  res.status(401).json({
    status: 401,
    result: "End-point not found",
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
