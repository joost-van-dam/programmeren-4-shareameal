const assert = require("assert");
const { all } = require("express/lib/application");
const pool = require("../../databaseconnectie/dbtest");
// let databaseUser = [];
// let idUser = 0;

let controller = {
  validateUser: (req, res, next) => {
    let user = req.body;
    let { emailAdress, password } = user;

    try {
      assert(typeof emailAdress === "string", "Email must be a string");
      assert(typeof password === "string", "Password must be a string");
      assert(typeof idUser === "number", "User id must be a number");
      next();
    } catch (err) {
      const error = {
        status: 404,
        result: err.message,
      };

      // console.log(err.code);
      // console.log(err.message);
      //   console.log(err);
      next(error);
    }

    // let {title, ...other} = user;
  },

  addUser: (req, res) => {
    let user = req.body;
    // idUser++;

    user = {
      idUser,
      ...user,
    };

    console.log(user);
    console.log(
      "Contains: " +
        databaseUser.some((item) => item.emailAdress == user.emailAdress)
    );

    if (databaseUser.some((item) => item.emailAdress == user.emailAdress)) {
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
      idUser++;
    }
  },

  getAllUsers: (req, res) => {
    pool.getConnection(function (err, connection) {
      if (err) throw err; // not connected!

      // Use the connection
      connection.query("SELECT * FROM user", function (error, results, fields) {
        // When done with the connection, release it.
        connection.release();

        // Handle error after the release.
        if (error) throw error;

        // Don't use the connection here, it has been returned to the pool.
        console.log("results = ", results);

        res.status(200).json({
          status: 200,
          results: results,
        });

        // // Nu een variable die je niet gebruikt.
        // pool.end((err) => {
        //   console.log("pool was closed.");
        // });
      });
    });
  },

  getUserById: (req, res) => {
    const getsingleuserbyid = req.params.id;
    console.log(`User met ID ${getsingleuserbyid} gezocht`);
    // let requestedUserInDatabase = false;

    // get all id's
    pool.getConnection(function (err, connection) {
      // if (err) throw err; // not connected!

      // Use the connection
      connection.query(
        "SELECT * FROM user WHERE id = " + getsingleuserbyid,
        function (error, results, fields) {
          // When done with the connection, release it.
          connection.release();

          // Handle error after the release.
          // if (error) throw error;

          // Don't use the connection here, it has been returned to the pool.
          console.log("All id's = ", results);

          res.status(201).json({
            result: results,
          });

          // results.forEach((Element) => allids.push(Object.values(Element)));

          // results.forEach((Element) =>
          //   console.log(Element.id == getsingleuserbyid)
          // );

          // console.log("test 4");

          // for (let i = 0; i < results.length; i++) {
          //   // console.log(results[i].id);

          //   if (results[i].id == getsingleuserbyid) {
          //     requestedUserInDatabase = true;
          //   }
          // }

          // console.log(allids);

          // console.log(requestedUserInDatabase);

          // if (requestedUserInDatabase) {
          //   connection.query(
          //     "SELECT * FROM user WHERE id = " + getsingleuserbyid,
          //     function (error, results, fields) {
          //       // When done with the connection, release it.
          //       connection.release();

          //       // Handle error after the release.
          //       if (error) throw error;

          //       // Don't use the connection here, it has been returned to the pool.
          //       console.log("results = ", results);

          //       res.status(201).json({
          //         result: results,
          //       });
          //     }
          //   );
          // } else {
          //   res.status(403).send("Forbidden, no access.");
          // }
        }
      );
    });
  },

  updateUserById: (req, res) => {
    const putsingleuserbyid = req.params.id;
    let updatedUser = { idUser: putsingleuserbyid, ...req.body };
    console.log(`User met ID ${putsingleuserbyid} aangepast`);

    pool.getConnection(function (err, connection) {
      if (err) throw err; // not connected!

      // Use the connection
      connection.query(
        "SELECT id FROM user",
        function (error, results, fields) {
          // When done with the connection, release it.
          connection.release();

          // Handle error after the release.
          if (error) throw error;

          // Don't use the connection here, it has been returned to the pool.
          console.log("All id's = ", results);

          for (let i = 0; i < results.length; i++) {
            // console.log(results[i].id);

            if (results[i].id == putsingleuserbyid) {
              requestedUserInDatabase = true;
            }
          }

          // console.log(allids);

          console.log(requestedUserInDatabase);

          if (requestedUserInDatabase) {
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
                // if (results.affectedRows > 0) {
                //   connection.query(
                //     "SELECT * FROM user WHERE id = " + putsingleuserbyid,
                //     function (error, results, fields) {
                //       res.status(201).json({
                //         status: 201,
                //         result: results[0],
                //       });
                //     }
                //   );
                // }

                connection.release();
                if (error) throw error;

                // console.log("results = ", results);

                res.status(201).json({
                  result: results,
                });
              }
            );
          } else {
            res.status(403).send("Forbidden, no access.");
          }
        }
      );
    });

    // let index = databaseUser.findIndex(
    //   (user) => user.idUser == putsingleuserbyid
    // );

    // console.log("Index van user = " + index);

    // if (index == -1) {
    //   res.status(403).send("Forbidden.");
    // } else {
    //   databaseUser[index] = updatedUser;
    //   res.status(201).json({
    //     result: updatedUser,
    //   });
    // }
  },

  deleteUserById: (req, res) => {
    const deletesingleuserbyid = req.params.id;
    console.log(`User met ID ${deletesingleuserbyid} verwijderd`);

    var deletedUser = [];

    let requestedUserInDatabase = false;

    // get all id's
    pool.getConnection(function (err, connection) {
      if (err) {
        throw res.status(400).json({
          status: 400,
          error: err,
        });
      }

      // Use the connection
      connection.query(
        "DELETE FROM user WHERE id = " + deletesingleuserbyid,
        function (error, results, fields) {
          // When done with the connection, release it.
          connection.release();
          if (error) {
            console.log(error);

            let errorMessage = error.message;

            if (error.errno == 1451) {
              errorMessage = `Foreignkey error delete failed!`;
            }

            return res.status(400).json({
              status: 400,
              error: errorMessage,
            });
          }

          if (results.affectedRows > 0) {
            res.status(201).json({
              result: results,
            });
          } else {
            res.status(401).json({
              error: "Er is een fout opgetreden bij het verwijderen.",
            });
          }

          // Handle error after the release.
          // if (error) throw error;

          // Don't use the connection here, it has been returned to the pool.
          // console.log("All id's = ", results);

          // results.forEach((Element) => allids.push(Object.values(Element)));

          // results.forEach((Element) =>
          //   console.log(Element.id == getsingleuserbyid)
          // );

          // console.log("test 4");

          // for (let i = 0; i < results.length; i++) {
          //   // console.log(results[i].id);

          //   if (results[i].id == deletesingleuserbyid) {
          //     requestedUserInDatabase = true;
          //   }
          // }

          // console.log(allids);

          // console.log(requestedUserInDatabase);

          // if (requestedUserInDatabase) {
          //   // connection.query(
          //   //   "DELETE FROM meal WHERE cookId = " + deletesingleuserbyid,
          //   //   function (error, results, fields) {
          //   //     // Handle error after the release.
          //   //     if (error) throw error;
          //   //   }
          //   // );

          //   connection.query(
          //     "SELECT * FROM user WHERE id = " + deletesingleuserbyid,
          //     function (error, results, fields) {
          //       // Handle error after the release.
          //       if (error) throw error;

          //       databaseUser = results;
          //     }
          //   );

          //   connection.query(
          //     "DELETE FROM user WHERE id = " + deletesingleuserbyid,
          //     function (error, results, fields) {
          //       // When done with the connection, release it.
          //       connection.release();

          //       // Handle error after the release.
          //       if (error) throw error;

          //       // Don't use the connection here, it has been returned to the pool.
          //       console.log("results = ", results);

          //       res.status(201).json({
          //         result: deletedUser,
          //       });
          //     }
          //   );
          // } else {
          //   res.status(403).send("Forbidden, no access.");
          // }
        }
      );
    });
  },
};

module.exports = controller;
