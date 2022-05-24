const express = require("express");
const router = express.Router();
const mealController = require("../controllers/meal.controller");
const authController = require("../controllers/auth.controller");

router.get("/", (req, res) => {
  res.status(200).json({
    status: 200,
    result: "Hello World!",
  });
});

// UC-201 Register as a new meal
router.post(
  "/api/meal",
  authController.validateToken,
  mealController.validateMeal,
  mealController.addMeal
);
// router.post("/api/meal", mealController.addMeal);

// UC-202 Get all meals
router.get(
  "/api/meal",
  authController.validateToken,
  mealController.getAllMeals
);

// UC-203 Request personal meal profile
// router.get("/api/meal/profile", authController.validateToken, (req, res) => {
//   res.status(401).send("Deze functionaliteit is nog niet gerealiseerd.");
// });
router.get(
  "/api/meal/profile",
  authController.validateToken,
  mealController.getMealProfile
);

// UC-204 Get single meal by ID
router.get(
  "/api/meal/:id",
  authController.validateToken,
  mealController.getMealById
);

// // UC-205 Update a single meal
// router.put(
//   "/api/meal/:id",
//   authController.validateToken,
//   mealController.validateUpdate,
//   mealController.updateMealById
// );

// UC-305 Delete a meal
router.delete(
  "/api/meal/:id",
  authController.validateToken,
  mealController.deleteMealById
);

module.exports = router;
