const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");

let databaseUser = [];
let idUser = 0;

router.get("/", (req, res) => {
  res.status(200).json({
    status: 200,
    result: "Hello World!",
  });
});

// UC-201 Register as a new user
router.post("/api/user", userController.addUser);

// UC-202 Get all users
router.get("/api/user", userController.getAllUsers);

// UC-203 Request personal user profile
router.get("/api/user/profile", (req, res) => {
  res.status(401).send("Deze functionaliteit is nog niet gerealiseerd.");
});

// UC-204 Get single user by ID
router.get("/api/user/:id", userController.getUserById);

// UC-205 Update a single user
router.put("/api/user/:id", (req, res) => {
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
});

// UC-206 Delete an user
router.delete("/api/user/:id", (req, res) => {
  const deletesingleuserbyid = req.params.id;
  console.log(`User met ID ${deletesingleuserbyid} verwijderd`);

  let index = databaseUser.findIndex(
    (user) => user.idUser == deletesingleuserbyid
  );
  let user = databaseUser.filter((item) => item.idUser == deletesingleuserbyid);

  console.log("Index van user = " + index);

  if (index == -1) {
    res.status(403).send("Forbidden.");
  } else {
    databaseUser.splice(index, 1);
    res.status(201).json({
      result: user,
    });
  }
});

module.exports = router;
