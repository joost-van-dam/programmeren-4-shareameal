const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../../index");
const pool = require("../../databaseconnectie/dbtest");
const { Test } = require("mocha");
// const database = [];

chai.should();
chai.use(chaiHttp);

const CLEAR_MEAL_TABLE = "DELETE IGNORE FROM `meal`";
const CLEAR_PARTICIPANTS_TABLE = "DELETE IGNORE FROM `meal_participants_user`";
const CLEAR_USERS_TABLE = "DELETE IGNORE FROM `user`";
const CLEAR_DB =
  CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE;

const TEST_USER1 =
  "INSERT INTO user (firstName, lastName, isActive, emailAdress, password, street, city) VALUES ('Joost' ,'van Dam' ,1 ,'joost.vandam@avans.nl' ,'wachtwoord123' ,'Lovensdijkstraat', 'Breda')";
const TEST_USER2 =
  "INSERT INTO user (firstName, lastName, isActive, emailAdress, password, street, city) VALUES ('Robin' ,'Schellius' ,1 ,'robin.schellius@avans.nl' ,'wachtwoord456' ,'Hogeschoollaan', 'Breda')";
const TEST_USER3 =
  "INSERT INTO user (firstName, lastName, isActive, emailAdress, password, street, city) VALUES ('Davide' ,'Ambesi' ,1 ,'davide.ambesi@avans.nl' ,'wachtwoord789' ,'Bijster', 'Breda')";

const TEST_USERS = TEST_USER1 + TEST_USER2 + TEST_USER3;
// hier komen alle chai testen, 500+ regels

describe("Manage movies /api/user", () => {
  describe("UC-201 Registreren als nieuwe gebruiker", () => {
    beforeEach((done) => {
      pool.getConnection(function (err, connection) {
        if (err) throw err;
        connection.query(CLEAR_DB, function (error, result, field) {
          connection.query(TEST_USERS, function (error, result, field) {
            connection.release();
          });
        });
        // connection.release();

        // Dummy user toevoegen

        done();
      });
    });

    //TC-201-1 Verplicht veld ontbreekt
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
          let { status, result } = res.body;
          status.should.equals(400);
          result.should.be.a("string").that.equals("Email must be a string");
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
          let { status, result } = res.body;
          status.should.equals(409);
          result.should.be.a("string").that.equals("Gebruiker bestaat al");
          done();
        });
    });

    it("TC-201-5 Gebruiker succesvol geregistreerd", (done) => {
      chai
        .request(server)
        .post("/api/user")
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
});
