const assert = require("assert");
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
    // res.status(201).json({
    //   result: databaseUser,
    // });

    console.log("1");

    pool.getConnection(function (err, connection) {
      console.log("2");

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
    let user = databaseUser.filter((item) => item.idUser == getsingleuserbyid);
    if (user.length > 0) {
      console.log(user);
      res.status(201).json({
        result: user,
      });
    } else {
      res.status(403).send("Forbidden, no access.");
    }
  },

  updateUserById: (req, res) => {
    const putsingleuserbyid = req.params.id;
    let updatedUser = { idUser: putsingleuserbyid, ...req.body };
    console.log(`User met ID ${putsingleuserbyid} aangepast`);

    let index = databaseUser.findIndex(
      (user) => user.idUser == putsingleuserbyid
    );

    console.log("Index van user = " + index);

    if (index == -1) {
      res.status(403).send("Forbidden.");
    } else {
      databaseUser[index] = updatedUser;
      res.status(201).json({
        result: updatedUser,
      });
    }
  },

  deleteUserById: (req, res) => {
    const deletesingleuserbyid = req.params.id;
    console.log(`User met ID ${deletesingleuserbyid} verwijderd`);

    let index = databaseUser.findIndex(
      (user) => user.idUser == deletesingleuserbyid
    );
    let user = databaseUser.filter(
      (item) => item.idUser == deletesingleuserbyid
    );

    console.log("Index van user = " + index);

    if (index == -1) {
      res.status(403).send("Forbidden.");
    } else {
      databaseUser.splice(index, 1);
      res.status(201).json({
        result: user,
      });
    }
  },
};

module.exports = controller;
