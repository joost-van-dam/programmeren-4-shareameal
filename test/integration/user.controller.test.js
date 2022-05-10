const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../../index");
const pool = require("../../databaseconnectie/dbtest");
// const database = [];

chai.should();
chai.use(chaiHttp);

const CLEAR_MEAL_TABLE = "DELETE IGNORE FROM `meal`;";
const CLEAR_PARTICIPANTS_TABLE = "DELETE IGNORE FROM `meal_participants_user`;";
const CLEAR_USERS_TABLE = "DELETE IGNORE FROM `user`;";
const CLEAR_DB =
  CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE;

// hier komen alle chai testen, 500+ regels

describe("Manage movies /api/user", () => {
  describe("UC-201 Registreren als nieuwe gebruiker", () => {
    beforeEach((done) => {
      pool.getConnection(function (err, connection) {
        if (err) throw err;
        connection.query(CLEAR_DB, function (error, result, field) {});
        connection.release();

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
          firstName: "John",
          lastName: "Doe",
          street: "Lovensdijkstraat 61",
          city: "Breda",
          isActive: true,
          emailAdress: "m.vandullemen@server.nl",
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
      // done();
    });

    // it("TC-202", (done) => {});

    // //Alleen deze draaier
    // it.only("TC-202", (done) => {});

    // //Deze overslaan
    // it.skip("TC-202", (done) => {});
  });
});
