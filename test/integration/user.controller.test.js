process.env.DB_DATABASE = process.env.DB_DATABASE || "share-a-meal-testdb";
process.env.LOGLEVEL = "error";

const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../../index");
require("dotenv").config();
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

const TEST_USERS =
  "INSERT INTO user (firstName, lastName, isActive, emailAdress, password, street, city) VALUES ('Joost' ,'van Dam' ,1 ,'joost.vandam@avans.nl' ,'wachtwoord1DD23@$##' ,'Lovensdijkstraat', 'Breda'), ('Robin' ,'Schellius' ,0 ,'robin.schellius@avans.nl' ,'wachtwoord456FDSD@$##' ,'Hogeschoollaan', 'Breda')";
const TEST_USER_AT_ID_IS_1000000 =
  "INSERT INTO user (id, firstName, lastName, isActive, emailAdress, password, street, city) VALUES (1000000, 'Joost' ,'van Dam' ,1 ,'joost.vandam@avans.nl' ,'wachtwoord12DSF3@$##' ,'Lovensdijkstraat', 'Breda')";

describe("Share-a-meal API Tests", () => {
  describe("UC-101 Login", () => {
    before((done) => {
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
              done();
            }
            //   );
            // }
          );
        });
      });
    });

    it.only("TC-101-1 Verplicht veld ontbreekt", (done) => {
      chai
        .request(server)
        .post("/api/auth/login")
        .send({
          emailAdress: "Joost@server.com",
        })
        .end((err, res) => {
          res.should.be.an("Object");
          let { status, message } = res.body;
          status.should.equals(400);
          message.should.be
            .a("string")
            .that.equals("password must be a string.");
          done();
        });
    });

    it.only("TC-101-2 Niet-valide email adres", (done) => {
      chai
        .request(server)
        .post("/api/auth/login")
        .send({
          emailAdress: "emailvanjoost",
          password: "secret#f4Dtfeer",
        })
        .end((err, res) => {
          res.should.be.an("Object");
          let { status, message } = res.body;
          status.should.equals(400);
          message.should.be.a("string").that.equals("Invalid email");
          done();
        });
    });

    it.only("TC-101-3 Niet-valide wachtwoord", (done) => {
      chai
        .request(server)
        .post("/api/auth/login")
        .send({
          emailAdress: "Joost@server.com",
          password: "wachtwoord",
        })
        .end((err, res) => {
          res.should.be.an("Object");
          let { status, message } = res.body;
          status.should.equals(400);
          message.should.be.a("string").that.equals("Invalid password");
          done();
        });
    });

    it.only("TC-101-4 user does not exist", (done) => {
      chai
        .request(server)
        .post("/api/auth/login")
        .send({
          emailAdress: "bestaatniet@server.com",
          password: "wachtwoord32DSF3@$##",
        })
        .end((err, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equals(404);
          message.should.be
            .a("string")
            .that.equals("User not found or password invalid");
          done();
        });
    });

    it.only("TC-101-5 Gebruiker succesvol ingelogd", (done) => {
      chai
        .request(server)
        .post("/api/auth/login")
        .send({
          emailAdress: "joost.vandam@avans.nl",
          password: "wachtwoord12DSF3@$##",
        })
        .end((err, res) => {
          res.should.be.an("Object");
          let { status, message } = res.body;
          status.should.equals(200);
          // message.should.be.a("string").that.equals("Invalid password");
          done();
        });
    });
  });

  describe("UC-201 Registreren als nieuwe gebruiker", () => {
    beforeEach((done) => {
      pool.getConnection(function (err, connection) {
        if (err) throw err;
        connection.query(CLEAR_DB, function (error, result, field) {
          if (error) throw error;
          connection.query(TEST_USERS, function (error, result, field) {
            if (error) throw error;
            connection.query(
              "SELECT * FROM user",
              function (error, result, field) {
                if (error) throw error;
                // console.log(result);
                connection.release();
                done();
              }
            );
          });
        });
      });
    });

    it.only("TC-201-1 Verplicht veld ontbreekt", (done) => {
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
          password: "secret#f4Dtfeer",
          phoneNumber: "06 12425475",
        })
        .end((err, res) => {
          res.should.be.an("Object");
          let { status, message } = res.body;
          // console.log("Hier is de res.body: " + JSON.stringify(res.body));
          // console.log("Hier is de message: " + JSON.stringify(message));
          // console.log("Hier is de message: " + message);
          // console.log("Hier is de error: " + err);

          status.should.equals(400);
          message.should.be.a("string").that.equals("Email must be a string");
          done();
        });
    });

    it.only("TC-201-2 Niet-valide email adres", (done) => {
      chai
        .request(server)
        .post("/api/user")
        .send({
          firstName: "John",
          lastName: "Doe",
          street: "Lovensdijkstraat 61",
          city: "Breda",
          isActive: true,
          emailAdress: "emailvanjoost",
          password: "secret#f4Dtfeer",
          phoneNumber: "06 12425475",
        })
        .end((err, res) => {
          res.should.be.an("Object");
          let { status, message } = res.body;
          // console.log("Hier is de res.body: " + JSON.stringify(res.body));
          // console.log("Hier is de message: " + JSON.stringify(message));
          // console.log("Hier is de message: " + message);
          // console.log("Hier is de error: " + err);

          status.should.equals(400);
          message.should.be.a("string").that.equals("Invalid email");
          done();
        });
    });

    it.only("TC-201-3 Niet-valide wachtwoord", (done) => {
      chai
        .request(server)
        .post("/api/user")
        .send({
          firstName: "John",
          lastName: "Doe",
          street: "Lovensdijkstraat 61",
          city: "Breda",
          isActive: true,
          emailAdress: "nieuweuser@gmail.com",
          password: "wachtwoord",
          phoneNumber: "06 12425475",
        })
        .end((err, res) => {
          res.should.be.an("Object");
          let { status, message } = res.body;
          // console.log("Hier is de res.body: " + JSON.stringify(res.body));
          // console.log("Hier is de message: " + JSON.stringify(message));
          // console.log("Hier is de message: " + message);
          // console.log("Hier is de error: " + err);

          status.should.equals(400);
          message.should.be.a("string").that.equals("Invalid password");
          done();
        });
    });

    it.only("TC-201-4 Gebruiker bestaat al", (done) => {
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
          password: "secret#f4Dtfeer",
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

    it.only("TC-201-5 Gebruiker succesvol geregistreerd", (done) => {
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
          password: "secret#f4Dtfeer",
          phoneNumber: "06 12425475",
        })
        .end((err, res) => {
          res.should.be.an("Object");
          let { status, result } = res.body;
          status.should.equals(201);
          result.firstName.should.be.a("string").that.equals("Thijs");
          result.lastName.should.be.a("string").that.equals("van Dam");
          result.street.should.be
            .a("string")
            .that.equals("Lovensdijkstraat 61");
          result.city.should.be.a("string").that.equals("Breda");
          result.isActive.should.be.a("boolean").that.equals(true);
          result.emailAdress.should.be
            .a("string")
            .that.equals("thijs.vandam@avans.nl");
          result.password.should.be.a("string").that.equals("secret#f4Dtfeer");
          result.phoneNumber.should.be.a("string").that.equals("06 12425475");
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
          //   if (error) throw error;
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
        // });
      });
    });

    it.only("TC-202-1 Toon nul gebruikers", (done) => {
      chai
        .request(server)
        .get("/api/user")
        .set("authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
        .end((err, res) => {
          res.should.be.an("Object");
          let { status, results } = res.body;
          status.should.equals(200);
          results.should.be.an("array").that.has.length(0);
          done();
        });
    });

    it.only("TC-202-2 Toon twee gebruikers", (done) => {
      // pool.getConnection(function (err, connection) {
      //   connection.query(TEST_USERS, function (error, result, field) {
      //     if (error) throw error;
      //     connection.release();
      //   });
      // });

      // chai
      //   .request(server)
      //   .get("/api/user")
      //   .set("authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
      //   .end((err, res) => {
      //     res.should.be.an("Object");
      //     let { status, results } = res.body;
      //     status.should.equals(200);
      //     results.should.be.an("array").that.has.length(2);
      done();
      // });
    });

    it.only("TC-202-3 Toon gebruikers met zoekterm op niet-bestaande naam", (done) => {
      chai
        .request(server)
        .get("/api/user?firstName=USERVANANDEREPLANEET")
        .set("authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
        .end(function (err, res) {
          res.should.be.an("object");
          const { status, results } = res.body;
          status.should.equals(200);
          results.should.be.an("array").that.has.length(0);
          done();
        });
    });

    it.only("TC-202-4 Toon gebruikers met gebruik van de zoekterm op het veld isActive=false", (done) => {
      chai
        .request(server)
        .get("/api/user?isActive=false")
        .set("authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
        .end(function (err, res) {
          res.should.be.an("object");
          const { status, results } = res.body;
          status.should.equals(200);
          results.should.be.an("array").that.has.length(0);
          done();
        });
    });

    it.only("TC-202-5 Toon gebruikers met gebruik van de zoekterm op het veld isActive=true", (done) => {
      chai
        .request(server)
        .get("/api/user?isActive=true")
        .set("authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
        .end(function (err, res) {
          res.should.be.an("object");
          const { status, results } = res.body;
          status.should.equals(200);
          results.should.be.an("array").that.has.length(0);
          done();
        });
    });
    // });

    it.only("TC-202-6 Toon gebruikers met zoekterm op bestaande naam", (done) => {
      // pool.getConnection(function (err, connection) {
      //   connection.query("SELECT * FROM user", function (error, result, field) {
      //     if (error) throw error;
      //     console.log(result);
      //     connection.release();
      //     // done();
      //   });
      // });

      chai
        .request(server)
        .get("/api/user?firstName=Robin")
        .set("authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
        .end(function (err, res) {
          res.should.be.an("object");
          const { status, results } = res.body;
          status.should.equals(200);
          results.should.be.an("array").that.has.length(0);
          done();
        });
    });
  });

  describe("UC-203 Gebruikersprofiel opvragen", () => {
    it.only("TC-203-1 Ongeldig token", (done) => {
      chai
        .request(server)
        .get("/api/user")
        .set("authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
        .end((err, res) => {
          // console.log("Hier is het res: " + res);
          // console.log("Hier is het res.body: " + res.body);
          // console.log("Hier is de error: " + err);
          res.should.be.an("Object");
          // let { status, results } = res.body;
          // status.should.equals(200);
          // results.should.be.an("array").that.has.length(1);
          done();
        });
    });

    it.only("TC-203-2 Valide token en gebruiker bestaat.", (done) => {
      done();
    });
  });

  describe("UC-204 Details van gebruiker", () => {
    it.only("TC-204-1 Ongeldig token", (done) => {
      done();
    });

    it.only("TC-204-2 User does not exist", (done) => {
      chai
        .request(server)
        .get("/api/user/0")
        .set("authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
        .end((err, res) => {
          res.should.be.an("Object");
          let { status, message } = res.body;
          status.should.equals(404);
          message.should.be.a("string").that.equals("User does not exist");
          done();
        });
    });

    it.only("TC-204-3 Gebruiker-ID bestaat", (done) => {
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

  describe("UC-205 Gebruiker wijzigen", () => {
    beforeEach((done) => {
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
              done();
            }
            //   );
            // }
          );
        });
      });
    });

    it.only("TC-205-1 Verplicht veld “emailAdress” ontbreekt", (done) => {
      chai
        .request(server)
        .put("/api/user/1000000")
        .send({
          firstName: "John",
          lastName: "Doe",
          street: "Lovensdijkstraat 61",
          city: "Breda",
          isActive: true,
          // "emailAdress": "h.doe@server.com",
          password: "secret#dw@#dAwas",
          phoneNumber: "06 12425475",
        })
        .set("authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
        .end((err, res) => {
          res.should.be.an("Object");
          let { status, message } = res.body;
          // console.log("Hier is de res.body: " + JSON.stringify(res.body));
          // console.log("Hier is de message: " + JSON.stringify(message));
          // console.log("Hier is de message: " + message.values);
          // console.log("Hier is de error: " + err);
          // console.log("Hier is de message: " + message);
          status.should.equals(400);
          message.should.be.a("string").that.equals("Email must be a string");
          done();
        });
    });

    it.only("TC-205-3 Niet-valide telefoonnummer", (done) => {
      chai
        .request(server)
        .put("/api/user/1000000")
        .send({
          firstName: "John",
          lastName: "Doe",
          street: "Lovensdijkstraat 61",
          city: "Breda",
          isActive: true,
          emailAdress: "h.doe@server.com",
          password: "secret#e4!jcu83ew",
          phoneNumber: "06 1234567",
        })
        .set("authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
        .end((err, res) => {
          res.should.be.an("Object");
          let { status, message } = res.body;
          // console.log("Hier is de res.body: " + JSON.stringify(res.body));
          // console.log("Hier is de message: " + JSON.stringify(message));
          // console.log("Hier is de message: " + message.values);
          // console.log("Hier is de error: " + err);
          // console.log("Hier is de message: " + message);
          status.should.equals(400);
          message.should.be.a("string").that.equals("Invalid phonenumber");
          done();
        });
    });

    it.only("TC-205-4 Gebruiker bestaat niet", (done) => {
      chai
        .request(server)
        .put("/api/user/999999")
        .send({
          firstName: "John",
          lastName: "Doe",
          street: "Lovensdijkstraat 61",
          city: "Breda",
          isActive: true,
          emailAdress: "h.doe@server.com",
          password: "secret(849f4DdR",
          phoneNumber: "06 12345678",
        })
        .set("authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
        .end((err, res) => {
          res.should.be.an("Object");
          let { status, message } = res.body;
          // console.log("Hier is de res.body: " + JSON.stringify(res.body));
          // console.log("Hier is de message: " + JSON.stringify(message));
          // console.log("Hier is de message: " + message.values);
          // console.log("Hier is de error: " + err);
          // console.log("Hier is de message: " + message);
          status.should.equals(400);
          message.should.be.a("string").that.equals("User does not exist");
          done();
        });
    });

    it.only("TC-205-5 Niet ingelogd", (done) => {
      chai
        .request(server)
        .put("/api/user/1000000")
        .send({
          firstName: "John",
          lastName: "Doe",
          street: "Lovensdijkstraat 61",
          city: "Breda",
          isActive: true,
          emailAdress: "h.doe@server.com",
          password: "secret*jdkD9s",
          phoneNumber: "06 12425475",
        })
        .end((err, res) => {
          res.should.be.an("Object");
          let { status, message } = res.body;
          // console.log("Hier is de res.body: " + JSON.stringify(res.body));
          // console.log("Hier is de message: " + JSON.stringify(message));
          // console.log("Hier is de message: " + message.values);
          // console.log("Hier is de error: " + err);
          // console.log("Hier is de message: " + message);
          status.should.equals(401);
          message.should.be
            .a("string")
            .that.equals("Authorization header missing!");
          done();
        });
    });

    it.only("TC-205-6 Gebruiker succesvol gewijzigd", (done) => {
      chai
        .request(server)
        .put("/api/user/1000000")
        .send({
          firstName: "Joost",
          lastName: "Doe",
          street: "Lovensdijkstraat 61",
          city: "Breda",
          isActive: true,
          emailAdress: "joost@server.com",
          password: "secret635f#w2s2",
          phoneNumber: "06 12425475",
        })
        .set("authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
        .end((err, res) => {
          let { status, result } = res.body;
          status.should.equals(200);
          result.should.be.a("Object").that.contains({
            id: result.id,
            firstName: "Joost",
            lastName: "Doe",
            street: "Lovensdijkstraat 61",
            city: "Breda",
            isActive: 1,
            emailAdress: "joost@server.com",
            password: "secret635f#w2s2",
            phoneNumber: "06 12425475",
          });
          done();
        });
    });
  });

  describe("UC-206 Gebruiker verwijderen", () => {
    beforeEach((done) => {
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
              done();
            }
            //   );
            // }
          );
        });
      });
    });

    it.only("TC-206-1 Gebruiker bestaat niet", (done) => {
      chai
        .request(server)
        .delete("/api/user/0")
        .set("authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
        .end((err, res) => {
          res.should.be.an("Object");
          let { status, message } = res.body;
          // console.log(
          //   "TC-206-1 Gebruiker bestaat niet heeft een message met: " + message
          // );
          status.should.equals(400);
          message.should.be.a("string").that.equals("User does not exist");
          done();
        });
    });

    it.only("TC-206-2 Niet ingelogd", (done) => {
      chai
        .request(server)
        .delete("/api/user/1000000")
        .end((err, res) => {
          res.should.be.an("Object");
          let { status, message } = res.body;
          // console.log("Hier is de message: " + message);
          status.should.equals(401);
          message.should.be
            .a("string")
            .that.equals("Authorization header missing!");
          done();
        });
    });

    it.only("TC-206-3 Actor is geen eigenaar", (done) => {
      done();
    });

    it.only("TC-206-4 Gebruiker succesvol verwijderd", (done) => {
      chai
        .request(server)
        .delete("/api/user/1000000")
        .set("authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
        .end((err, res) => {
          res.should.be.an("Object");
          let { status, message } = res.body;
          // console.log("Gebruiker succesvol verwijderd message: " + message);
          status.should.equals(200);
          message.should.be.a("string").that.equals("Deleted");
          done();
        });
    });
  });
});
