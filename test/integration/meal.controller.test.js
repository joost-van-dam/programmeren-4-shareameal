process.env.DB_DATABASE = process.env.DB_DATABASE || "share-a-meal-testdb";

const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../../index");
const pool = require("../../databaseconnectie/dbtest");
const { Test } = require("mocha");
const jwt = require("jsonwebtoken");
const { jwtSecretKey, logger } = require("../../src/config/config");

chai.should();
chai.use(chaiHttp);

const CLEAR_MEAL_TABLE = "DELETE IGNORE FROM `meal`;";
const CLEAR_PARTICIPANTS_TABLE = "DELETE IGNORE FROM `meal_participants_user`;";
const CLEAR_USERS_TABLE = "DELETE IGNORE FROM `user`;";
const CLEAR_DB =
  CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE;

describe("Share-a-meal API Tests", () => {
  describe("UC-301 Maaltijd aanmaken", () => {
    it("TC-301-1 Verplicht veld ontbreekt", (done) => {
      chai
        .request(server)
        .post("/api/meal")
        .set("authorization", "Bearer " + jwt.sign({ id: 1 }, jwtSecretKey))
        // .set("authorization", "Bearer " + jwt.sign({ id: 1 }, jwtSecretKey))
        .send({
          name: "pizza",
          description: "pizza met tomaat",
          isVega: true,
          isVegan: true,
          isToTakeHome: true,
          dateTime: "2022-05-24T16:00:00.000Z",
          imageUrl:
            "https://www.leukerecepten.nl/wp-content/uploads/2019/03/pizza_recepten-432x432.jpg",
          maxAmountOfParticipants: 4,
          allergenes: ["cheese", "gluten"],
          price: 7.49,
        })
        .end((err, res) => {
          res.should.be.an("Object");
          let { status, result } = res.body;
          status.should.equals(201);
          //   result.name.should.be.a("string").that.equals("pizza");
          //   result.description.should.be
          //     .a("string")
          //     .that.equals("pizza met tomaat");

          //   result.isVega.should.be.a("boolean").that.equals(true);
          //   result.isVegan.should.be.a("boolean").that.equals(true);
          //   result.isToTakeHome.should.be.a("boolean").that.equals(true);
          //   result.imageUrl.should.be
          //     .a("string")
          //     .that.equals(
          //       "https://www.leukerecepten.nl/wp-content/uploads/2019/03/pizza_recepten-432x432.jpg"
          //     );
          //   result.allergenes.should.be.a("string").that.equals("cheese");
          //   result.price.should.be.a("number").that.equals(7.49);

          done();
        });
    });
    it("TC-301-2 Niet ingelogd", (done) => {
      done();
    });
    it("TC-301-3 Maaltijd succesvol toegevoegd", (done) => {
      done();
    });
  });
  describe("UC-303 Lijst van maaltijden opvragen", () => {
    it("TC-303-1 Lijst van maaltijden geretourneerd", (done) => {
      done();
    });
  });
  describe("UC-304 Details van een maaltijd opvragen", () => {
    it("TC-304-1 Maaltijd bestaat niet", (done) => {
      done();
    });
    it("TC-304-2 Details van maaltijd geretourneerd", (done) => {
      done();
    });
  });
  describe("UC-305 Maaltijd verwijderen", () => {
    it("TC-305-2 Niet ingelogd", (done) => {
      done();
    });
    it("TC-305-3 Niet de eigenaar van de data", (done) => {
      done();
    });
    it("TC-305-4 Maaltijd bestaat niet", (done) => {
      done();
    });
    it("TC-305-5 Maaltijd succesvol verwijderd", (done) => {
      done();
    });
  });
});
