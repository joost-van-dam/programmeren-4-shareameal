const assert = require("assert");
const { all } = require("express/lib/application");
const { acceptsCharsets } = require("express/lib/request");
const pool = require("../../databaseconnectie/dbtest");

let controller = {
  validateMeal: (req, res, next) => {
    console.log("valide meal function called");
    const meal = req.body;

    try {
      assert(
        typeof meal.name == "string",
        "Name must be filled in or a string"
      );
      assert(
        typeof meal.description == "string",
        "Description must be filled in or a string"
      );
      assert(typeof meal.isVega == "boolean", "Is vega should be a boolean");
      assert(typeof meal.isVegan == "boolean", "Is vegan should be a boolean");
      assert(
        typeof meal.isToTakeHome == "boolean",
        "Is to take home should be a boolean"
      );
      assert(typeof meal.dateTime == "string", "Datetime should be a string");
      assert(typeof meal.imageUrl == "string", "Image url should be a string");
      assert(meal.allergenes, "Allergenes should be a array with a string");
      assert(
        typeof meal.maxAmountOfParticipants == "number",
        "Maximum amount of participants should be a number"
      );
      assert(typeof meal.price == "number", "Price should be a number");

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
  addMeal: (req, res) => {
    const meal = req.body;

    // Valideren dat een user ID is meegegeven
    if (!userId) {
      res.status(401).json({
        status: 401,
        message: "Not authorized! (user ID missing from payload).",
      });
    }
    meal.cookId = req.userId;

    pool.getConnection(function (err, connection) {
      console.log("Add meal #2");
      if (err) throw err;

      connection.query(
        `INSERT INTO meal (name,
            description,
            isVega,
            isVegan,
            isToTakeHome,
            dateTime,
            imageUrl,
            maxAmountOfParticipants, allergenes, price, cookId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          meal.name,
          meal.description,
          meal.isVega,
          meal.isVegan,
          meal.isToTakeHome,
          meal.dateTime.replace("T", " ").substring(0, 19),
          meal.imageUrl,
          meal.maxAmountOfParticipants,
          meal.allergenes.join(),
          meal.price,
          meal.cookId,
        ],
        function (error, results, fields) {
          if (error) {
            connection.release();
            if (error.errno == 1062) {
              // if (error) throw error;
              return res.status(409).json({
                status: 409,
                message: "Meal bestaat al",
              });
            } else {
              console.log("Dit gaat fout! " + error.message);
              return res.status(400).json({
                status: 400,
                message: error.message,
              });
            }
          } else {
            connection.query(
              `SELECT LAST_INSERT_ID() AS id;`,
              function (error, results, fields) {
                connection.release();
                if (error) {
                  res.status(500).json({
                    status: 500,
                    message: "Database error on adding meal: " + error.message,
                  });
                }
                const { id } = results[0];

                res.status(201).json({
                  status: 201,
                  result: { id, ...meal },
                });
              }
            );
          }
        }
      );
    });
  },

  getAllMeals: (req, res) => {
    const queryParams = req.query;

    // let { firstName, isActive } = req.query;
    let queryString = "SELECT * FROM `meal`";
    // if (firstName || isActive) {
    //   queryString += " WHERE ";
    //   if (firstName) {
    //     queryString += "`firstName` LIKE ?";
    //     firstName = "%" + firstName + "%";
    //   }
    //   if (firstName && isActive) queryString += " AND ";
    //   if (isActive) {
    //     queryString += "`isActive` = ?";
    //   }
    // }
    // queryString += ";";

    pool.getConnection(function (err, connection) {
      if (err) throw err; // not connected!

      connection.query(
        "SELECT * FROM `meal`",
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

  getMealProfile: (req, res) => {
    const getprofilebyid = req.mealId;
    // console.log("De getprofilebyid = " + getprofilebyid);
    pool.getConnection(function (err, connection) {
      if (err) throw err; // not connected!

      connection.query(
        `SELECT * FROM meal WHERE id = ${getprofilebyid}`,
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

  getMealById: (req, res) => {
    const getsinglemealbyid = req.params.id;
    // console.log(`meal met ID ${getsinglemealbyid} gezocht`);
    console.log("ID" + getsinglemealbyid);

    pool.getConnection(function (err, connection) {
      if (err) throw err;
      connection.query(
        "SELECT * FROM meal WHERE id = " + getsinglemealbyid,
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
                message: "meal does not exist",
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

  updateMealById: (req, res) => {
    const putsinglemealbyid = req.params.id;
    let updatedmeal = { idmeal: putsinglemealbyid, ...req.body };
    // console.log(`meal met ID ${putsinglemealbyid} aangepast`);

    pool.getConnection(function (err, connection) {
      if (err) throw err;
      connection.query(
        "UPDATE meal SET firstName=?, lastName=?, isActive=?, emailAdress=?, password=?, phoneNumber=?, street=?, city=? WHERE id = ?",
        [
          updatedmeal.firstName,
          updatedmeal.lastName,
          updatedmeal.isActive,
          updatedmeal.emailAdress,
          updatedmeal.password,
          updatedmeal.phoneNumber,
          updatedmeal.street,
          updatedmeal.city,
          putsinglemealbyid,
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
                message: "meal does not exist",
              });
            }

            // console.log("LET OP DIT ZIJN DE RESULTS!!!: " + results);

            connection.query(
              `SELECT * FROM meal WHERE id = '${putsinglemealbyid}'`,
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

  deleteMealById: (req, res) => {
    // try {
    const deletesinglemealbyid = req.params.id;
    // } catch (error) {
    //   console.log(error);
    // }

    // const deletesinglemealbyid = req.params.id;
    // console.log(`meal met ID ${deletesinglemealbyid} verwijderd`);

    pool.getConnection(function (err, connection) {
      if (err) {
        throw res.status(400).json({
          status: 400,
          error: err,
        });
      }

      connection.query(
        "DELETE FROM meal WHERE id = " + deletesinglemealbyid,
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
          //     message: "meal does not exist",
          //   });
          // }

          if (results) {
            // if (results.length === 0) {
            //   return res.status(400).json({
            //     status: 400,
            //     message: "meal does not exist",
            //   });
            // }

            if (results.affectedRows === 0) {
              return res.status(400).json({
                status: 400,
                message: "meal does not exist",
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
