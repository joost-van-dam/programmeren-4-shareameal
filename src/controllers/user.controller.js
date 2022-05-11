const assert = require("assert");
const { all } = require("express/lib/application");
const pool = require("../../databaseconnectie/dbtest");

let controller = {
  validateUser: (req, res, next) => {
    let user = req.body;
    let { firstName, lastName, emailAdress, password, street, city } = user;

    try {
      assert(typeof firstName === "string", "First name must be a string");
      assert(typeof lastName === "string", "Last name must be a string");
      assert(typeof emailAdress === "string", "Email must be a string");
      assert(typeof password === "string", "Password must be a string");
      assert(typeof street === "string", "Street must be a string");
      assert(typeof city === "string", "City must be a string");

      next();
    } catch (err) {
      const error = {
        status: 400,
        message: err.message,
      };

      next(error);
    }
  },

  validateUpdate: (req, res, next) => {
    let user = req.body;
    let {
      firstName,
      lastName,
      isActive,
      emailAdress,
      password,
      phoneNumber,
      street,
      city,
    } = user;

    try {
      assert(typeof firstName === "string", "First name must be a string");
      assert(typeof lastName === "string", "Last name must be a string");
      assert(typeof isActive === "boolean", "Is active must be a boolean");
      assert(typeof emailAdress === "string", "Email must be a string");
      assert(typeof password === "string", "Password must be a string");
      assert(typeof phoneNumber === "string", "Phonenumber must be a string");
      assert(typeof street === "string", "Street must be a string");
      assert(typeof city === "string", "City must be a string");

      next();
    } catch (err) {
      const error = {
        status: 400,
        message: err.message,
      };

      next(error);
    }
  },

  // UC-201 Registreren als nieuwe gebruiker
  addUser: (req, res) => {
    let user = req.body;

    // // if (user.city == undefined) {
    // console.log("TEST@@@@@@@@@@@@@@@");
    // // }

    pool.getConnection(function (err, connection) {
      if (err) throw err;

      connection.query(
        `INSERT INTO user (firstName, lastName, isActive, emailAdress, password, street, city) VALUES ('${user.firstName}' ,'${user.lastName}' ,1 ,'${user.emailAdress}' ,'${user.password}' ,'${user.street}', '${user.city}')`,
        function (error, results, fields) {
          connection.release();
          // if (error) throw error;

          if (error) {
            // console.log(error);
            // let errorMessage = error.message;

            if (error.errno == 1062) {
              // if (error) throw error;
              return res.status(409).json({
                status: 409,
                message: "Gebruiker bestaat al",
              });
            } else {
              return res.status(400).json({
                status: 400,
              });
            }
          } else {
            connection.query(
              `SELECT * FROM user WHERE emailAdress = '${user.emailAdress}'`,
              function (error, results, fields) {
                connection.release();

                if (error) throw error;

                res.status(201).json({
                  status: 201,
                  message: results,
                });
              }
            );
          }
        }
      );
    });
  },

  getAllUsers: (req, res) => {
    pool.getConnection(function (err, connection) {
      if (err) throw err; // not connected!

      connection.query("SELECT * FROM user", function (error, results, fields) {
        connection.release();
        if (error) throw error;

        // console.log("results = ", results);

        res.status(200).json({
          status: 200,
          results: results,
        });
      });
    });
  },

  getUserById: (req, res) => {
    const getsingleuserbyid = req.params.id;
    // console.log(`User met ID ${getsingleuserbyid} gezocht`);
    console.log("ID" + getsingleuserbyid);

    pool.getConnection(function (err, connection) {
      if (err) throw err;
      connection.query(
        "SELECT * FROM user WHERE id = " + getsingleuserbyid,
        function (error, results, fields) {
          connection.release();
          // if (error) throw error;

          if (!results) {
            console.log("DE ERROR IS: " + error);
          }

          if (results) {
            if (results.length === 0) {
              return res.status(404).json({
                status: 404,
                message: "Gebruiker-ID bestaat niet",
              });
            }

            return res.status(200).json({
              status: 200,
              message: results[0],
            });
          } else {
            return res.status(400).json({
              status: 400,
            });
          }
        }
      );
    });
  },

  updateUserById: (req, res) => {
    const putsingleuserbyid = req.params.id;
    let updatedUser = { idUser: putsingleuserbyid, ...req.body };
    console.log(`User met ID ${putsingleuserbyid} aangepast`);

    pool.getConnection(function (err, connection) {
      if (err) throw err;
      connection.query(
        "UPDATE user SET firstName=?, lastName=?, isActive=?, emailAdress=?, password=?, phoneNumber=?, street=?, city=? WHERE id = ?",
        [
          updatedUser.firstName,
          updatedUser.lastName,
          updatedUser.isActive,
          updatedUser.emailAdress,
          updatedUser.password,
          updatedUser.phoneNumber,
          updatedUser.street,
          updatedUser.city,
          putsingleuserbyid,
        ],
        function (error, results, fields) {
          connection.release();
          if (error) {
            if (error.errno == 1292) {
              console.log("NUMMER 1292 ERROR LET OP DEZE: " + error);
              return res.status(400).json({
                status: 400,
              });
            }

            console.log(error);

            let errorMessage = error.message;

            return res.status(400).json({
              status: 400,
              error: errorMessage,
            });
          }

          if (!results) {
            console.log("DE ERROR IS: " + error);
          }

          if (results) {
            if (results.length === 0) {
              return res.status(404).json({
                status: 404,
                message: "Gebruiker-ID bestaat niet",
              });
            }

            console.log("LET OP DIT ZIJN DE RESULTS!!!: " + results);

            connection.query(
              `SELECT * FROM user WHERE id = '${putsingleuserbyid}'`,
              function (error, results, fields) {
                connection.release();

                // if (error) throw error;

                if (results) {
                  res.status(200).json({
                    status: 200,
                    message: results,
                  });
                }
              }
            );

            // return res.status(200).json({
            //   status: 200,
            //   message: results[0],
            // });
          } else {
            return res.status(400).json({
              status: 400,
            });
            // connection.query(
            //   `SELECT * FROM user WHERE id = '${putsingleuserbyid}'`,
            //   function (error, results, fields) {
            //     connection.release();

            //     if (error) throw error;

            //     res.status(200).json({
            //       status: 200,
            //       message: results,
            //     });
            //   }
            // );
          }

          // if (results.affectedRows === 0) {
          //   res.status(400).json({
          //     status: 400,
          //     message: "Gebruiker bestaat niet.",
          //   });
          // } else {
          //   connection.query(
          //     `SELECT * FROM user WHERE id = '${putsingleuserbyid}'`,
          //     function (error, results, fields) {
          //       connection.release();

          //       if (error) throw error;

          //       res.status(200).json({
          //         status: 200,
          //         message: results,
          //       });
          //     }
          //   );
          // }
        }
      );
    });
  },

  deleteUserById: (req, res) => {
    const deletesingleuserbyid = req.params.id;
    console.log(`User met ID ${deletesingleuserbyid} verwijderd`);

    pool.getConnection(function (err, connection) {
      if (err) {
        throw res.status(400).json({
          status: 400,
          error: err,
        });
      }

      connection.query(
        "DELETE FROM user WHERE id = " + deletesingleuserbyid,
        function (error, results, fields) {
          connection.release();
          // if (error) throw error;
          if (error) {
            // console.log(error);

            if (error.errno == 1054) {
              console.log("NUMMER 1054 ERROR LET OP DEZE: " + error);
              return res.status(400).json({
                status: 400,
              });
            }

            let errorMessage = error.message;

            if (error.errno == 1451) {
              errorMessage = `Foreignkey error delete failed!`;
            }

            return res.status(400).json({
              status: 400,
              error: errorMessage,
            });
          }

          if (!results) {
            console.log("DE ERROR IS: " + error);
          }

          if (results.length === 0) {
            return res.status(400).json({
              status: 400,
              message: "Gebruiker-ID bestaat niet",
            });
          }

          if (results) {
            if (results.length === 0) {
              return res.status(400).json({
                status: 400,
                message: "Gebruiker-ID bestaat niet",
              });
            }

            console.log("ALS HIJ HIER KOMT LET OP!!!:" + results);

            if (results.affectedRows === 0) {
              res.status(400).json({
                status: 400,
                message: "Gebruiker bestaat niet.",
              });
            }

            return res.status(200).json({
              status: 200,
              message: results[0],
            });
          } else {
            return res.status(400).json({
              status: 400,
            });
          }

          // if (results.affectedRows === 0) {
          //   res.status(400).json({
          //     status: 400,
          //     message: "Gebruiker bestaat niet.",
          //   });
          // } else {
          //   res.status(200).json({
          //     status: 200,
          //     message: "Gebruiker verwijderd.",
          //   });
          // }
        }
      );
    });
  },
};

module.exports = controller;
