const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../../index");
const database = [];

chai.should();
chai.use(chaiHttp);

// hier komen alle chai testen, 500+ regels

describe("Manage movies /api/user", () => {
  describe("UC-201 add user", () => {
    beforeEach(() => {
      database = [];
    });

    it("When a required input is missing, a valid error should be returned", (done) => {
      chai
        .request(server)
        .post("/api/user")
        .send({
          // Emailaddres ontbreekt
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
          result.should.be.a("string").that.equals("Title must be a string");
        });
      done();
    });

    it("TC-202", (done) => {});

    //Alleen deze draaier
    it.only("TC-202", (done) => {});

    //Deze overslaan
    it.skip("TC-202", (done) => {});
  });
});
