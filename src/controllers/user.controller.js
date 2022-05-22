const assert = require("assert");
const { all } = require("express/lib/application");
const pool = require("../../databaseconnectie/dbtest");
const phoneRegex = /(06)(\s|\-|)\d{8}|31(\s6|\-6|6)\d{8}/;
const emailRegex = /^\w+([.-]?\w+)@\w+([.-]?\w+)(.\w{1,3})+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/;

let controller = {
  validateUser: (req, res, next) => {
    let user = req.body;
    let { firstName, lastName, emailAdress, password, street, city } = user;

    try {
      assert(typeof firstName === "string", "First firstName must be a string");
      assert(typeof lastName === "string", "Last firstName must be a string");
      assert(typeof emailAdress === "string", "Email must be a string");
      assert(typeof password === "string", "Password must be a string");
      assert(typeof street === "string", "Street must be a string");
      assert(typeof city === "string", "City must be a string");
      assert(emailRegex.test(emailAdress), "Invalid email");
      assert(passwordRegex.test(password), "Invalid password");

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
    // console.log("validateUpdate aangeroepen!");
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
      assert(typeof firstName === "string", "First firstName must be a string");
      assert(typeof lastName === "string", "Last firstName must be a string");
      assert(typeof isActive === "boolean", "Is active must be a boolean");
      assert(typeof emailAdress === "string", "Email must be a string");
      assert(typeof password === "string", "Password must be a string");
      assert(typeof phoneNumber === "string", "Phonenumber must be a string");
      assert(typeof street === "string", "Street must be a string");
      assert(typeof city === "string", "City must be a string");
      assert(phoneRegex.test(phoneNumber), "Invalid phonenumber");

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
    // console.log("Add user aangeroepen");
    let user = req.body;

    pool.getConnection(function (err, connection) {
      if (err) throw err;

      connection.query(
        `INSERT INTO user (firstName, lastName, isActive, emailAdress, password, street, city) VALUES ('${user.firstName}' ,'${user.lastName}' ,1 ,'${user.emailAdress}' ,'${user.password}' ,'${user.street}', '${user.city}')`,
        function (error, results, fields) {
          connection.release();
          // if (error) throw error;

          // console.log("Add user aangeroepen1");

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

                let user = results[0];

                if (user.isActive == 1) {
                  user.isActive = true;
                } else {
                  user.isActive = false;
                }

                // user[isActive] = user[isActive] == 1;

                res.status(201).json({
                  status: 201,
                  result: user,
                  // result: results[0],
                });
              }
            );
          }
        }
      );
    });
  },

  getAllUsers: (req, res) => {
    const queryParams = req.query;

    let { firstName, isActive } = req.query;
    let queryString = "SELECT * FROM `user`";
    if (firstName || isActive) {
      queryString += " WHERE ";
      if (firstName) {
        queryString += "`firstName` LIKE ?";
        firstName = "%" + firstName + "%";
      }
      if (firstName && isActive) queryString += " AND ";
      if (isActive) {
        queryString += "`isActive` = ?";
      }
    }
    queryString += ";";

    pool.getConnection(function (err, connection) {
      if (err) throw err; // not connected!

      connection.query(
        queryString,
        [firstName, isActive],
        function (error, results, fields) {
          connection.release();
          if (error) throw error;

          // console.log("results = ", results);

          res.status(200).json({
            status: 200,
            results: results,
          });
        }
      );
    });
  },

  getUserProfile: (req, res) => {
    const getprofilebyid = req.userId;
    // console.log("De getprofilebyid = " + getprofilebyid);
    pool.getConnection(function (err, connection) {
      if (err) throw err; // not connected!

      connection.query(
        `SELECT * FROM user WHERE id = ${getprofilebyid}`,
        function (error, results, fields) {
          connection.release();
          if (error) throw error;

          // console.log("results = ", results);

          res.status(200).json({
            status: 200,
            results: results,
          });
        }
      );
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
            // console.log("DE ERROR IS: " + error);
          }

          if (results) {
            if (results.length === 0) {
              return res.status(404).json({
                status: 404,
                message: "User does not exist",
              });
            }

            return res.status(200).json({
              status: 200,
              result: results[0],
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
    // console.log(`User met ID ${putsingleuserbyid} aangepast`);

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

            // console.log(error);
            return res.status(400).json({
              status: 400,
              error: error.message,
            });
          }

          if (results) {
            if (results.affectedRows === 0) {
              return res.status(400).json({
                status: 400,
                message: "User does not exist",
              });
            }

            // console.log("LET OP DIT ZIJN DE RESULTS!!!: " + results);

            connection.query(
              `SELECT * FROM user WHERE id = '${putsingleuserbyid}'`,
              function (error, results, fields) {
                connection.release();

                // if (error) throw error;

                if (results) {
                  res.status(200).json({
                    status: 200,
                    result: results[0],
                  });
                }
              }
            );
          } else {
            return res.status(400).json({
              status: 400,
            });
          }
        }
      );
    });
  },

  deleteUserById: (req, res) => {
    // try {
    const deletesingleuserbyid = req.params.id;
    // } catch (error) {
    //   console.log(error);
    // }

    // const deletesingleuserbyid = req.params.id;
    // console.log(`User met ID ${deletesingleuserbyid} verwijderd`);

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

          // if (results.length === 0) {
          //   return res.status(400).json({
          //     status: 400,
          //     message: "User does not exist",
          //   });
          // }

          if (results) {
            // if (results.length === 0) {
            //   return res.status(400).json({
            //     status: 400,
            //     message: "User does not exist",
            //   });
            // }

            if (results.affectedRows === 0) {
              return res.status(400).json({
                status: 400,
                message: "User does not exist",
              });
            }

            return res.status(200).json({
              status: 200,
              message: "Deleted",
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
