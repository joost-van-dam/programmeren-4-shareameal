const assert = require("assert");
const { json } = require("express/lib/response");
const pool = require("../../databaseconnectie/dbtest");
const jwt = require("jsonwebtoken");

let controller = {
  // Deze nog fixen na les 5
  // validateToken
  validate: (req, res, next) => {
    const token = req.header;
    console.log(token);
    next();
  },

  login: (req, res, next) => {
    // Assert voor validatie
    const { emailAdress, password } = req.body;

    const queryString =
      "SELECT id, firstName, lastName, emailAdress, password FROM user WHERE emailAdress=?";

    pool.getConnection(function (err, connection) {
      if (err) next(err);

      connection.query(
        queryString,
        // [emailAdress],
        [req.body.emailAdress],
        function (error, results, fields) {
          connection.release();

          if (error) next(error);

          if (results && results.length === 1) {
            // er was een user met dit emailadres
            // check of het password klopt
            console.log(results);

            const user = results[0];

            if (user.password === password) {
              // email en password correct!

              jwt.sign(
                { userid: user.id },
                process.env.JWT_SECRET,
                { expiresIn: "7d" },
                //   { algorithm: "RS256" },
                function (err, token) {
                  if (err) console.log(err);
                  if (token) {
                    console.log(token);
                    res.status(200).json({
                      statusCode: 200,
                      results: token,
                    });
                  }
                }
              );
            } else {
              //password did not match.
              res.status(404).json({
                statusCode: 404,
                message: "password incorrect",
              });
            }
          } else {
            // er was geen user
            console.log("user not found");
            res.status(404).json({
              statusCode: 404,
              message: "email not found",
            });
          }

          //   console.log("#results = " + results.length);
          //   res.status(200).json({
          //     statusCode: 200,
          //     result: results,
          //   });
        }
      );
    });
  },
};

module.exports = controller;
