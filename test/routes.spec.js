process.env.NODE_ENV = "test";
const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../server.js");
const expect = chai.expect;
const config = require("../knexfile")["test"];
const database = require("knex")(config);
chai.use(chaiHttp);

describe("Server file", () => {
  beforeEach(done => {
    database.seed.run().then(() => {
      done();
    });
  });

  it("should return a 404 for a route that does not exist", done => {
    chai
      .request(app)
      .get("/supersad")
      .end((error, response) => {
        expect(response).to.have.status(404);
        done();
      });
  });

  describe("/api/v1/cerebral_beers/styles", () => {
    it("get request should have a 200 status", done => {
      chai
        .request(app)
        .get("/api/v1/cerebral_beers/styles")
        .end((error, response) => {
          expect(response).to.have.status(200);
          done();
        });
    });

    it("get request should return the data as JSON", done => {
      chai
        .request(app)
        .get("/api/v1/cerebral_beers/styles")
        .end((error, response) => {
          expect(response).to.be.json;
          done();
        });
    });

    it("get request should return an array with all of the beer styles", done => {
      chai
        .request(app)
        .get("/api/v1/cerebral_beers/styles")
        .end((error, response) => {
          expect(response.body).to.be.a("array");
          expect(response.body.length).to.equal(3);
          done();
        });
    });

    it("post request should correctly add a new style", done => {
      const newStyle = {
        style_name: "freddies secret style",
        description: "omg so amazing wow"
      };

      chai
        .request(app)
        .post("/api/v1/cerebral_beers/styles")
        .send(newStyle)
        .end((error, response) => {
          expect(response).to.have.status(201);
          expect(response.body).to.equal("Beer Style successfully added!");
          done();
        });
    });

    it("delete request should correctly delete style if no beers attached", done => {
      chai
        .request(app)
        .delete("/api/v1/cerebral_beers/styles/Pilsner2")
        .end((error, response) => {
          expect(response).to.have.status(202);
          expect(response.body).to.equal(
            `Style 'Pilsner2' successfully deleted`
          );
          done();
        });
    });

    it("delete request should return error message if style not in db", done => {
      chai
        .request(app)
        .delete("/api/v1/cerebral_beers/styles/Pilsner3")
        .end((error, response) => {
          expect(response).to.have.status(404);
          expect(response.body).to.equal(
            `No style 'Pilsner3' found in database`
          );
          done();
        });
    });

    it("delete request should error out if beers are attached", done => {
      chai
        .request(app)
        .delete("/api/v1/cerebral_beers/styles/Brettanomyces Saison")
        .end((error, response) => {
          expect(response).to.have.status(405);
          expect(response.error.text).to.equal(
            `{"error":"You\'re most likely trying to delete a style that has beers attached to it. Please remove those beers first!"}`
          );
          done();
        });
    });
  });

  describe("/api/v1/cerebral_beers/beer", () => {
    it("get request should have a 200 status", done => {
      chai
        .request(app)
        .get("/api/v1/cerebral_beers/beer")
        .end((error, response) => {
          expect(response).to.have.status(200);
          done();
        });
    });

    it("get request should return the data as JSON", done => {
      chai
        .request(app)
        .get("/api/v1/cerebral_beers/beer")
        .end((error, response) => {
          expect(response).to.be.json;
          done();
        });
    });

    it("get request should return an array with all of the beer", done => {
      chai
        .request(app)
        .get("/api/v1/cerebral_beers/beer")
        .end((error, response) => {
          expect(response.body).to.be.a("array");
          expect(response.body.length).to.equal(3);
          done();
        });
    });

    it("post request should correctly add new beer", done => {
      const newBeer = {
        name: "freddies secret beer",
        description: "omg so amazing wow",
        abv: "110%",
        is_available: true,
        style: "Brettanomyces Saison"
      };

      chai
        .request(app)
        .post("/api/v1/cerebral_beers/beer")
        .send(newBeer)
        .end((error, response) => {
          expect(response).to.have.status(201);
          expect(response.body).to.equal("Beer successfully added!");
          done();
        });
    });

    it("delete request should correctly delete beer", done => {
      chai
        .request(app)
        .delete("/api/v1/cerebral_beers/beer/Trembling+Giant")
        .end((error, response) => {
          expect(response).to.have.status(202);
          expect(response.body).to.equal(
            `Beer 'TREMBLING GIANT' successfully deleted`
          );
          done();
        });
    });

    it("delete request should return error message if beer does not exist", done => {
      chai
        .request(app)
        .delete("/api/v1/cerebral_beers/beer/Grembling+Tiant")
        .end((error, response) => {
          expect(response).to.have.status(404);
          expect(response.body).to.equal(
            `No beer 'GREMBLING TIANT' found in database`
          );
          done();
        });
    });
  });

  describe("/api/v1/cerebral_beers/find_by_style", () => {
    it("should have a 200 status", done => {
      chai
        .request(app)
        .get(
          "/api/v1/cerebral_beers/find_by_style?style_name=Brettanomyces+Saison"
        )
        .end((error, response) => {
          expect(response).to.have.status(200);
          done();
        });
    });

    it("should return the data as JSON", done => {
      chai
        .request(app)
        .get(
          "/api/v1/cerebral_beers/find_by_style?style_name=Brettanomyces+Saison"
        )
        .end((error, response) => {
          expect(response).to.be.json;
          done();
        });
    });

    it("should return an array with all beers of a certain style", done => {
      chai
        .request(app)
        .get(
          "/api/v1/cerebral_beers/find_by_style?style_name=Brettanomyces+Saison"
        )
        .end((error, response) => {
          expect(response.body).to.be.a("array");
          expect(response.body.length).to.equal(2);
          expect(response.body[0].name).to.equal(
            "GUAVA-ING THROUGH DIMENSIONS"
          );
          expect(response.body[0].description).to.equal("a very good beer");
          expect(response.body[0].abv).to.equal("6.7%");
          expect(response.body[1].name).to.equal(
            "TANGERINE-ING THROUGH DIMENSIONS"
          );
          expect(response.body[1].description).to.equal("an ok beer");
          expect(response.body[1].abv).to.equal("6.7%");
          done();
        });
    });

    it("expect error message if request does no include style_name", done => {
      chai
        .request(app)
        .get(
          "/api/v1/cerebral_beers/find_by_style?style_NOname=Brettanomyces+Saison"
        )
        .end((error, response) => {
          expect(response.body.error).to.equal(
            "Request must include 'style_name'. All first letter must be capitalized and spaces replaced by pluses. Example: '/api/v1/cerebral_beers/find_by_style?style_name=India+Pale+Ale'"
          );
          done();
        });
    });

    it("expect error message if style does not exist in db", done => {
      chai
        .request(app)
        .get("/api/v1/cerebral_beers/find_by_style?style_name=mystery+style")
        .end((error, response) => {
          expect(response.body.error).to.equal(
            "No beers found of style: mystery style"
          );
          done();
        });
    });

    describe("/api/v1/cerebral_beers/currently_available", () => {
      it("should have a 200 status", done => {
        chai
          .request(app)
          .get("/api/v1/cerebral_beers/currently_available/true")
          .end((error, response) => {
            expect(response).to.have.status(200);
            done();
          });
      });

      it("should return the data as JSON", done => {
        chai
          .request(app)
          .get("/api/v1/cerebral_beers/currently_available/true")
          .end((error, response) => {
            expect(response).to.be.json;
            done();
          });
      });

      it("should return an array with all of the beer currently available", done => {
        chai
          .request(app)
          .get("/api/v1/cerebral_beers/currently_available/true")
          .end((error, response) => {
            expect(response.body).to.be.a("array");
            expect(response.body.length).to.equal(2);
            done();
          });
      });

      it("should return an array with all of the beer not currently available", done => {
        chai
          .request(app)
          .get("/api/v1/cerebral_beers/currently_available/false")
          .end((error, response) => {
            expect(response.body).to.be.a("array");
            expect(response.body.length).to.equal(1);
            done();
          });
      });
    });
  });
});
