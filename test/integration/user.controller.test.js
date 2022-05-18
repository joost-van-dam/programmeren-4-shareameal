process.env.DB_DATABASE = process.env.DB_DATABASE || "share-a-meal-testdb";

const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../../index");
const pool = require("../../databaseconnectie/dbtest");
const { Test } = require("mocha");
// const database = [];
const jwt = require("jsonwebtoken");
const { jwtSecretKey, logger } = require("../../src/config/config");

chai.should();
chai.use(chaiHttp);

const CLEAR_MEAL_TABLE = "DELETE IGNORE FROM `meal`;";
const CLEAR_PARTICIPANTS_TABLE = "DELETE IGNORE FROM `meal_participants_user`;";
const CLEAR_USERS_TABLE = "DELETE IGNORE FROM `user`;";
const CLEAR_DB =
  CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE;

const TEST_USERS =
  "INSERT INTO user (firstName, lastName, isActive, emailAdress, password, street, city) VALUES ('Joost' ,'van Dam' ,1 ,'joost.vandam@avans.nl' ,'wachtwoord123' ,'Lovensdijkstraat', 'Breda'), ('Robin' ,'Schellius' ,1 ,'robin.schellius@avans.nl' ,'wachtwoord456' ,'Hogeschoollaan', 'Breda')";
const TEST_USER_AT_ID_IS_1000000 =
  "INSERT INTO user (id, firstName, lastName, isActive, emailAdress, password, street, city) VALUES (1000000, 'Joost' ,'van Dam' ,1 ,'joost.vandam@avans.nl' ,'wachtwoord123' ,'Lovensdijkstraat', 'Breda')";

describe("Share-a-meal API Tests", () => {
  describe("UC-201 Registreren als nieuwe gebruiker", () => {
    beforeEach((done) => {
      pool.getConnection(function (err, connection) {
        if (err) throw err;
        connection.query(CLEAR_DB, function (error, result, field) {
          if (error) throw error;
          connection.query(TEST_USERS, function (error, result, field) {
            if (error) throw error;
            // connection.query(
            //   "SELECT * FROM user",
            //   function (error, result, field) {
            //     if (error) throw error;
            //     console.log(result);
            connection.release();
            done();
            //   }
            // );
          });
        });
      });
    });

    it("TC-201-1 Verplicht veld ontbreekt", (done) => {
      chai
        .request(server)
        .post("/api/user")
        .send({
          firstName: "John",
          lastName: "Doe",
          street: "Lovensdijkstraat 61",
          city: "Breda",
          isActive: true,
          // "emailAdress": "h.doe@server.com",
          password: "secret",
          phoneNumber: "06 12425475",
        })
        .end((err, res) => {
          res.should.be.an("Object");
          let { status, message } = res.body;
          // console.log("Hier is de res.body: " + JSON.stringify(res.body));
          // console.log("Hier is de message: " + JSON.stringify(message));
          // console.log("Hier is de message: " + message.values);
          // console.log("Hier is de error: " + err);

          status.should.equals(400);
          message.should.be.a("string").that.equals("Email must be a string");
          done();
        });
    });

    it("TC-201-4 Gebruiker bestaat al", (done) => {
      chai
        .request(server)
        .post("/api/user")
        .send({
          firstName: "Joost",
          lastName: "van Dam",
          street: "Lovensdijkstraat 61",
          city: "Breda",
          isActive: true,
          emailAdress: "joost.vandam@avans.nl",
          password: "secret",
          phoneNumber: "06 12425475",
        })
        .end((err, res) => {
          res.should.be.an("Object");
          let { status, message } = res.body;
          status.should.equals(409);
          message.should.be.a("string").that.equals("Gebruiker bestaat al");
          done();
        });
    });

    it("TC-201-5 Gebruiker succesvol geregistreerd", (done) => {
      chai
        .request(server)
        .post("/api/user")
        .set("authorization", "Bearer " + jwt.sign({ id: 1 }, jwtSecretKey))
        .send({
          firstName: "Thijs",
          lastName: "van Dam",
          street: "Lovensdijkstraat 61",
          city: "Breda",
          isActive: true,
          emailAdress: "thijs.vandam@avans.nl",
          password: "secret",
          phoneNumber: "06 12425475",
        })
        .end((err, res) => {
          res.should.be.an("Object");
          let { status } = res.body;
          // let { status, result } = res.body;
          status.should.equals(201);
          // result.should.be.a("string").that.equals("Gebruiker bestaat al");
          done();
        });
    });

    // it("TC-202", (done) => {});

    // //Alleen deze draaier
    // it.only("TC-202", (done) => {});

    // //Deze overslaan
    // it.skip("TC-202", (done) => {});
  });
  describe("UC-202 Overzicht van gebruikers", () => {
    beforeEach((done) => {
      pool.getConnection(function (err, connection) {
        if (err) throw err;
        connection.query(CLEAR_DB, function (error, result, field) {
          if (error) throw error;
          // connection.query(TEST_USERS, function (error, result, field) {
          // if (error) throw error;
          // connection.query(
          //   "SELECT * FROM user",
          //   function (error, result, field) {
          //     if (error) throw error;
          //     console.log(result);
          connection.release();
          done();
          //   }
          // );
          // });
        });
      });
    });

    it("TC-202-1 Toon nul gebruikers", (done) => {
      chai
        .request(server)
        .get("/api/user")
        .set("authorization", "Bearer " + jwt.sign({ id: 1 }, jwtSecretKey))
        .end((err, res) => {
          res.should.be.an("Object");
          let { status, results } = res.body;
          status.should.equals(200);
          results.should.be.an("array").that.has.length(0);
          done();
        });
    });

    it("TC-202-2 Toon twee gebruikers", (done) => {
      pool.getConnection(function (err, connection) {
        connection.query(TEST_USERS, function (error, result, field) {
          if (error) throw error;
        });
      });

      chai
        .request(server)
        .get("/api/user")
        .set("authorization", "Bearer " + jwt.sign({ id: 1 }, jwtSecretKey))
        .end((err, res) => {
          res.should.be.an("Object");
          let { status, results } = res.body;
          status.should.equals(200);
          results.should.be.an("array").that.has.length(2);
          done();
        });
    });
  });

  describe("UC-203 Gebruikersprofiel opvragen", () => {
    it.skip("TC-203-1 Ongeldig token", (done) => {
      chai
        .request(server)
        .get("/api/user")
        .set("authorization", "Bearer " + jwt.sign({ id: 1 }, jwtSecretKey))
        .end((err, res) => {
          console.log("Hier is het res: " + res);
          console.log("Hier is het res.body: " + res.body);
          console.log("Hier is de error: " + err);
          res.should.be.an("Object");
          // let { status, results } = res.body;
          // status.should.equals(200);
          // results.should.be.an("array").that.has.length(1);
          done();
        });
    });
  });

  describe("UC-204 Details van gebruiker", () => {
    it("TC-204-2 User does not exist", (done) => {
      chai
        .request(server)
        .get("/api/user/0")
        .set("authorization", "Bearer " + jwt.sign({ id: 1 }, jwtSecretKey))
        .end((err, res) => {
          res.should.be.an("Object");
          let { status, message } = res.body;
          status.should.equals(404);
          message.should.be.a("string").that.equals("User does not exist");
          done();
        });
    });

    it("TC-204-3 Gebruiker-ID bestaat", (done) => {
      pool.getConnection(function (err, connection) {
        if (err) throw err;
        connection.query(CLEAR_DB, function (error, result, field) {
          if (error) throw error;
          connection.query(
            TEST_USER_AT_ID_IS_1000000,
            function (error, result, field) {
              if (error) throw error;
              // connection.query(
              //   "SELECT * FROM user",
              //   function (error, result, field) {
              //     if (error) throw error;
              //     console.log(result);
              connection.release();
              //   }
              // );
            }
          );
        });
      });

      chai
        .request(server)
        .get("/api/user/1000000")
        .set("authorization", "Bearer " + jwt.sign({ id: 1 }, jwtSecretKey))
        .end((err, res) => {
          res.should.be.an("Object");
          let { status, result } = res.body;
          status.should.equals(200);
          result.should.be.an("Object").that.deep.equals(result);
          done();
        });
    });
  });
});
