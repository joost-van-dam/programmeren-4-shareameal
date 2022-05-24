const assert = require("assert");
const { json } = require("express/lib/response");
const pool = require("../../databaseconnectie/dbtest");
const jwt = require("jsonwebtoken");

const logger = require("../config/config").logger;
const jwtSecretKey = require("../config/config").jwtSecretKey;
const emailRegex = /^\w+([.-]?\w+)@\w+([.-]?\w+)(.\w{1,3})+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/;

let controller = {
  login(req, res, next) {
    pool.getConnection((err, connection) => {
      if (err) {
        logger.error("Error getting connection from database-pool-connection");
        res.status(500).json({
          error: err.messages,
          datetime: new Date().toISOString(),
        });
      }

      // console.log("Login called");
      if (connection) {
        // 1. Kijk of deze useraccount bestaat.
        connection.query(
          "SELECT `id`, `emailAdress`, `password`, `firstName`, `lastName` FROM `user` WHERE `emailAdress` = ?",
          [req.body.emailAdress],
          (err, rows, fields) => {
            connection.release();
            if (err) {
              logger.error("Error on login: ", err.message);
              res.status(500).json({
                error: err.message,
                datetime: new Date().toISOString(),
              });
            }
            if (rows) {
              // 2. Er was een resultaat, check het password.
              if (
                rows &&
                rows.length === 1 &&
                rows[0].password == req.body.password
              ) {
                logger.info(
                  "passwords DID match, sending userinfo and valid token"
                );
                // Extract the password from the userdata - we do not send that in the response.
                const { password, ...userinfo } = rows[0];
                // Create an object containing the data we want in the payload.
                const payload = {
                  userId: userinfo.id,
                };

                jwt.sign(
                  payload,
                  jwtSecretKey,
                  { expiresIn: "12d" },
                  function (err, token) {
                    // console.log("sign called!");
                    logger.debug("User logged in, sending: ", userinfo);
                    res.status(200).json({
                      status: 200,
                      message: { ...userinfo, token },
                    });
                  }
                );
              } else {
                logger.info("User not found or password invalid");
                res.status(404).json({
                  status: 404,
                  message: "User not found or password invalid",
                  // datetime: new Date().toISOString(),
                });
              }
            }
          }
        );
      }
    });
  },

  //
  //
  //
  validateLogin(req, res, next) {
    // Verify that we receive the expected input
    // console.log("validate login called");
    try {
      assert(
        typeof req.body.emailAdress === "string",
        "email must be a string."
      );
      assert(
        typeof req.body.password === "string",
        "password must be a string."
      );

      assert(emailRegex.test(req.body.emailAdress), "Invalid email");
      assert(passwordRegex.test(req.body.password), "Invalid password");

      next();
    } catch (error) {
      res.status(400).json({
        status: 400,
        message: error.message,
      });
    }
  },

  //
  //
  //
  validateToken(req, res, next) {
    logger.info("validateToken called");
    // logger.trace(req.headers)
    // The headers should contain the authorization-field with value 'Bearer [token]'
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      logger.warn("Authorization header missing!");
      res.status(401).json({
        status: 401,
        message: "Authorization header missing!",
        datetime: new Date().toISOString(),
      });
    } else {
      // Strip the word 'Bearer ' from the headervalue
      const token = authHeader.substring(7, authHeader.length);

      jwt.verify(token, jwtSecretKey, (err, payload) => {
        if (err) {
          logger.warn("Not authorized");
          res.status(401).json({
            error: "Not authorized",
            datetime: new Date().toISOString(),
          });
        }
        if (payload) {
          logger.debug("token is valid", payload);
          // User heeft toegang. Voeg UserId uit payload toe aan
          // request, voor ieder volgend endpoint.
          req.userId = payload.userId;
          next();
        }
      });
    }
  },
};

module.exports = controller;
