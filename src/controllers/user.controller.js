const assert = require("assert");
let databaseUser = [];
let idUser = 0;

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
    res.status(201).json({
      result: databaseUser,
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
};

module.exports = controller;
