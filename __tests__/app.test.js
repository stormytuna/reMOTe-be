const { beforeAll, afterAll, beforeEach, expect } = require("@jest/globals");
const userData = require("../db/data/test.json");
const request = require("supertest");
const app = require("../app");
const { connect } = require("../db/start-connection");
const { disconnect } = require("../db/end-connection");
const { seed } = require("../db/seed-test");
const { default: mongoose } = require("mongoose");

beforeAll(() => {
  return connect();
});

beforeEach(() => {
  return seed(userData);
});

afterAll(() => {
  return disconnect();
});

describe("404s on non-existent endpoints", () => {
  test("status:404, responds with an appropriate error message", () => {
    return request(app)
      .get("/api/totally-a-real-endpoint")
      .expect(404)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Content not found");
      });
  });
});

describe("GET /api/technicians", () => {
  test("status:200, responds with an array of technicians", () => {
    return request(app)
      .get("/api/technicians")
      .expect(200)
      .then(({ body }) => {
        const { technicians } = body;
        expect(technicians).toBeInstanceOf(Array);
        expect(technicians).toHaveLength(2);
        technicians.forEach((technician) => {
          expect(technician.technician.services.length).toBeGreaterThan(0);
        });
      });
  });
});

describe("POST /api/technicians", () => {
  test("status:200, responds with the new technician object", () => {
    const newTechnician = {
      username: "ahmedH",
      firstName: "Ahmed",
      lastName: "Hussian",
      address: {
        addressLine: "1 Random Place",
        postcode: "KF76 9LM",
      },
      contact: {
        phoneNumber: "07470761588",
        email: "ahmedhussain@gmail.com",
      },
      technician: {
        services: [
          { name: "Servicing and MOT", price: 45 },
          { name: "clutch repair", price: 100 },
        ],
      },
      avatarUrl: "https://i.imgur.com/pN04qjy.jpg",
    };
    return request(app)
      .post("/api/technicians")
      .send(newTechnician)
      .expect(201)
      .then(({ body }) => {
        const { technician } = body;
        expect(technician).toMatchObject({
          _id: expect.any(String),
          __v: expect.any(Number),
          username: "ahmedH",
          firstName: "Ahmed",
          lastName: "Hussian",
          address: {
            addressLine: "1 Random Place",
            postcode: "KF76 9LM",
          },
          contact: {
            phoneNumber: "07470761588",
            email: "ahmedhussain@gmail.com",
          },
          technician: {
            services: [
              { name: "Servicing and MOT", price: 45 },
              { name: "clutch repair", price: 100 },
            ],
            reviews: [],
          },
          reviews: [],
          avatarUrl: "https://i.imgur.com/pN04qjy.jpg",
        });
      });
  });

  test("status:400, responds with an appropriate error message when given a malformed body", () => {
    const newTechnician = {
      wfvvs: "ahmedH",
      gsfgsd: "Ahmed",
      lastName: "Hussian",
      address: {
        vbdfgsd: "1 Random Place",
        postcode: "KF76 9LM",
      },
      contact: {
        vcsvsdfsd: "07470761588",
        email: "ahmedhussain@gmail.com",
      },
      technician: {
        services: [
          {
            vsdvsgf: "Servicing and MOT",
            price: 50,
          },
          {
            name: "Clutch repairs",
            price: 60,
          },
          {
            name: "Engine and cooling",
            vsdgs: 500,
            description: "Something",
          },
          {
            name: "Valeting",
            vsgs: 5000,
          },
        ],
      },
      avatarUrl: "https://i.imgur.com/pN04qjy.jpg",
    };

    return request(app)
      .post("/api/technicians")
      .send(newTechnician)
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Bad request");
      });
  });

  test("status:400, responds with an appropriate error message when given a body that fails schema validation", () => {
    const newTechnician = {
      username: "ahmedH",
      firstName: "Ahmed",
      lastName: "Hussian",
      address: {
        addressLine: "1 Random Place",
        postcode: "KF76 9LM",
      },
      contact: {
        phoneNumber: "07470761588",
        email: "ahmedhussain@gmail.com",
      },
      technician: {
        services: "something",
      },
      avatarUrl: "https://i.imgur.com/pN04qjy.jpg",
    };

    return request(app)
      .post("/api/technicians")
      .send(newTechnician)
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Bad request");
      });
  });

  test("status:400, responds with an appropriate error message when given a body with a null technician", () => {
    const newTechnician = {
      username: "ahmedH",
      firstName: "Ahmed",
      lastName: "Hussian",
      address: {
        addressLine: "1 Random Place",
        postcode: "KF76 9LM",
      },
      contact: {
        phoneNumber: "07470761588",
        email: "ahmedhussain@gmail.com",
      },
      technician: null,
      avatarUrl: "https://i.imgur.com/pN04qjy.jpg",
    };

    return request(app)
      .post("/api/technicians")
      .send(newTechnician)
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Bad request");
      });
  });
});

describe("GET /api/technicians/:user_id", () => {
  test("status:200, responds with the technician with the given id", () => {
    return request(app)
      .get("/api/technicians/63ce75449ae462be0adad72d")
      .expect(200)
      .then(({ body }) => {
        const { technician } = body;
        expect(technician).toMatchObject({
          _id: "63ce75449ae462be0adad72d",
          technician: {
            services: expect.any(Array),
            reviews: expect.any(Array),
          },
        });
      });
  });

  test("status:400, responds with an appropriate error message when given user ID is invalid", () => {
    return request(app)
      .get("/api/technicians/totally-a-real-user")
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Bad request");
      });
  });

  test("status:404, responds with an appropriate error when provided a valid ID but no user exists", () => {
    return request(app)
      .get("/api/technicians/63ce754ddddd62be0adad72d")
      .expect(404)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Content not found");
      });
  });
});

describe("PATCH /api/technicians/:user_id", () => {
  const patchData = { name: "Tyre Replacement", price: 50 };
  test("status:200, should accept an object of services, update the technician, and return it", () => {
    return request(app)
      .patch("/api/technicians/63ce75449ae462be0adad72d")
      .send(patchData)
      .expect(200)
      .then(({ body }) => {
        const { technician } = body;
        expect(technician._id).toEqual("63ce75449ae462be0adad72d");
        expect(technician.technician.services).toHaveLength(4);
        expect(technician.technician.services[3]).toEqual({
          ...patchData,
          _id: expect.any(String),
        });
      });
  });

  test("status:400, responds with an appropriate error message when given a malformed body", () => {
    const patchData = { wgrfwsfsfs: "Tyre Replacement", arafa: 50 };
    return request(app)
      .patch("/api/technicians/not-an-id")
      .send(patchData)
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Bad request");
      });
  });

  test("status:400, responds with an appropriate error message when given body fails schema validation", () => {
    const patchData = { name: "Tyre Replacement", price: "aaa" };
    return request(app)
      .patch("/api/technicians/not-an-id")
      .send(patchData)
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Bad request");
      });
  });

  test("status:404, should respond with an appropriate error message when given id does not exist", () => {
    return request(app)
      .patch("/api/technicians/63ce7544aaaaa2be0adad72d")
      .send(patchData)
      .expect(404)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Content not found");
      });
  });
});

describe("POST /api/technicians/:user_id/reviews", () => {
  test("status:201, updates the users technician.reviews array with the given review object", () => {
    const newReview = {
      reviewBody: "This man is a car maniac! 5/7",
      rating: 4,
      reviewedBy: new mongoose.Types.ObjectId("63ce75449ae462be0adad72b"),
    };
    return request(app)
      .post("/api/technicians/63ce75449ae462be0adad72d/reviews")
      .send(newReview)
      .expect(201)
      .then(({ body }) => {
        const { technician } = body;
        expect(technician._id).toEqual("63ce75449ae462be0adad72d");
        expect(technician.technician.reviews).toHaveLength(3);
        expect(technician.technician.reviews[2]).toMatchObject({
          reviewBody: "This man is a car maniac! 5/7",
          rating: 4,
          reviewedBy: "63ce75449ae462be0adad72b",
        });
      });
  });

  test("status:400, responds with an appropriate error message when given a malformed body", () => {
    return request(app)
      .post("/api/technicians/63ce75449ae462be0adad72d/reviews")
      .send({
        abnisfn: "This is a test review",
        regegegg: 3,
        sarfawsrse: 15,
      })
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Bad request");
      });
  });

  test("status:400, responds with an appropriate error message when given body fails schema validation", () => {
    return request(app)
      .post("/api/technicians/63ce75449ae462be0adad72d/reviews")
      .send({
        reviewBody: "This is a test review",
        rating: "aaa",
        reviewedBy: 15,
      })
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Bad request");
      });
  });

  test("status:400, responds with an appropriate error message when given user ID is invalid", () => {
    return request(app)
      .post("/api/technicians/not-a-user/reviews")
      .send({
        reviewBody: "This is a test review",
        rating: 3,
        reviewedBy: 15,
      })
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Bad request");
      });
  });

  test("status:404, responds with an appropriate error when provided a valid ID but no user exists", () => {
    return request(app)
      .get("/api/technicians/63ce75449ae462be0adad72z/reviews")
      .expect(404)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Content not found");
      });
  });
});

describe("DELETE /api/technicians/:user_id", () => {
  test("status:200, responds with the user with a technician prop of null", () => {
    const newUser = {
      _id: "63ce75449ae462be0adad72d",
      __v: 0,
      username: "test-tech-01",
      firstName: "James",
      lastName: "Wright",
      address: {
        addressLine: "12 Random Place",
        postcode: "KF76 9LM",
      },
      contact: {
        phoneNumber: "32985262911",
        email: "jameswright@company.com",
      },
      technician: null,
      reviews: [],
      avatarUrl: "https://i.imgur.com/pN04qjy.jpg",
    };
    return request(app)
      .delete(`/api/technicians/63ce75449ae462be0adad72d`)
      .expect(200)
      .then(({ body: { user } }) => {
        expect(user).toMatchObject(newUser);
      });
  });

  test("status:400, responds with an appropriate error message when given an invalid user ID", () => {
    return request(app)
      .delete("/api/technicians/totally-a-real-user")
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Bad request");
      });
  });

  test("status:404, responds with an appropriate error message when given a non-existent user ID", () => {
    return request(app)
      .delete("/api/technicians/63caaaaa9ae462be0adad72d")
      .expect(404)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Content not found");
      });
  });
});

describe("GET /api/users/:user_id/reviews", () => {
  test("status:200, responds with a reviews from a user with the given user_id", () => {
    return request(app)
      .get("/api/users/63ce75449ae462be0adad72a/reviews")
      .expect(200)
      .then(({ body }) => {
        const { reviews } = body;
        expect(reviews).toMatchObject([
          {
            reviewBody: "Very good to service :)",
            rating: 5,
            reviewedBy: "63ce75449ae462be0adad72d",
          },
        ]);
      });
  });

  test("status:400, responds with an appropriate error message when given an invalid user ID", () => {
    return request(app)
      .get("/api/users/totally-a-real-user-ID/reviews")
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Bad request");
      });
  });

  test("status:404, responds with an appropriate error mesage when given a non existent user ID", () => {
    return request(app)
      .get("/api/users/63ceaaaaaae462be0adad72a/reviews")
      .expect(404)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Content not found");
      });
  });
});

describe("DELETE /api/user_id/reviews/:review_id", () => {
  test("should delete a review using review_id", () => {
    return request(app)
      .delete("/api/63ce75449ae462be0adad72e/reviews/63ce75449ae462be0adae13a")
      .expect(204);
  });
  test("should return a 404 when provided an non-existant user_id", () => {
    return request(app)
      .delete("/api/63ce75449ae462be0adad98e/reviews/63ce75449ae462be0adae13a")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Content not found");
      });
  });
  test("should a 404 when provided an non-existant review_id", () => {
    return request(app)
      .delete("/api/63ce75449ae462be0adad72e/reviews/63ce75449ae462be0adae57a")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Content not found");
      });
  });
  test("should return a 400 when given an invalid user ID", () => {
    return request(app)
      .delete("/api/fake-user-ID/reviews/63ce75449ae462be0adae13a")
      .expect(404)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Content not found");
      });
  });
});
describe("POST /api/users/:user_id/reviews", () => {
  test("status:201, responds with the newly updated user", () => {
    return request(app)
      .post("/api/users/63ce75449ae462be0adad72a/reviews")
      .send({
        reviewBody: "This is a test review",
        rating: 3,
        reviewedBy: new mongoose.Types.ObjectId("63ce75449ae462be0adad72b"),
      })
      .expect(201)
      .then(({ body }) => {
        const { user } = body;
        expect(user._id).toEqual("63ce75449ae462be0adad72a");
        expect(user.reviews).toHaveLength(2);
        expect(user.reviews[1]).toMatchObject({
          reviewBody: "This is a test review",
          rating: 3,
          reviewedBy: "63ce75449ae462be0adad72b",
        });
      });
  });

  test("status:400, responds with an appropriate error message when given a malformed body", () => {
    return request(app)
      .post("/api/users/63ce75449ae462be0adad72a/reviews")
      .send({
        abnisfn: "This is a test review",
        regegegg: 3,
        sarfawsrse: "15",
      })
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Bad request");
      });
  });

  test("status:400, responds with an appropriate error message when given a review that fails schema validation", () => {
    return request(app)
      .post("/api/users/63ce75449ae462be0adad72a/reviews")
      .send({
        reviewBody: "This is a test review",
        rating: "aaa",
        reviewedBy: "15",
      })
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Bad request");
      });
  });

  test("status:400, responds with an appropriate error message when our given user ID isn't valid", () => {
    return request(app)
      .post("/api/users/totally-a-real-user/reviews")
      .send({
        reviewBody: "This is a test review",
        rating: 3,
        reviewedBy: "15",
      })
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Bad request");
      });
  });

  test("status:404, responds with an appropriate error message when our given user ID doesn't exist", () => {
    return request(app)
      .post("/api/users/63ce75449ae462baaaaad72e/reviews")
      .send({
        reviewBody: "This is a test review",
        rating: 3,
        reviewedBy: new mongoose.Types.ObjectId("63ce75449ae462be0adad72b"),
      })

      .expect(404)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Content not found");
      });
  });
});
describe("POST /api/users", () => {
  test("status:200, responds with the new user object", () => {
    const newUser = {
      username: "totally-not-batman-btw",
      firstName: "Bruce",
      lastName: "Wayne",
      address: {
        addressLine: "153 Gotham Avenue",
        postcode: "GT52 12P",
      },
      contact: {
        phoneNumber: "52452852152",
        email: "b_wayne@wayne-tech.com",
      },
      avatarUrl: "https://i.imgur.com/SYXzHx3.jpeg",
    };
    return request(app)
      .post("/api/users")
      .send(newUser)
      .expect(201)
      .then(({ body }) => {
        const { user } = body;
        expect(user).toMatchObject({
          _id: expect.any(String),
          __v: expect.any(Number),
          username: "totally-not-batman-btw",
          firstName: "Bruce",
          lastName: "Wayne",
          address: {
            addressLine: "153 Gotham Avenue",
            postcode: "GT52 12P",
          },
          contact: {
            phoneNumber: "52452852152",
            email: "b_wayne@wayne-tech.com",
          },
          reviews: [],
          avatarUrl: "https://i.imgur.com/SYXzHx3.jpeg",
        });
      });
  });

  test("status:400, responds with an appropriate error message when given a malformed body", () => {
    const newUser = {
      userdddname: "totally-not-batman-btw",
      firstName: "Bruce",
      lastdddName: "Wayne",
      addrdddddess: {
        addressLine: "153 Gotham Avenue",
        postcode: "GT52 12P",
      },
      contact: {
        phoneNumber: "52452852152",
        email: "b_wayne@wayne-tech.com",
      },
      reviews: [],
      avatarUrl: "https://i.imgur.com/SYXzHx3.jpeg",
    };

    return request(app)
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Bad request");
      });
  });

  test("status:400, responds with an appropriate error message when given a body that fails schema validation", () => {
    const newUser = {
      username: "totally-not-batman-btw",

      address: {
        addressLine: "153 Gotham Avenue",
      },
      contact: {
        email: "b_wayne@wayne-tech.com",
      },
      avatarUrl: "https://i.imgur.com/SYXzHx3.jpeg",
    };

    return request(app)
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Bad request");
      });
  });

  test("status:400, responds with an appropriate error message when given a body with a null properties", () => {
    const newUser = {
      userdddname: "totally-not-batman-btw",
      firstName: null,
      lastdddName: "Wayne",
      addrdddddess: {
        addressLine: "153 Gotham Avenue",
        postcode: "GT52 12P",
      },
      contact: {
        phoneNumber: "52452852152",
        email: "b_wayne@wayne-tech.com",
      },
      reviews: [],
      avatarUrl: "https://i.imgur.com/SYXzHx3.jpeg",
    };

    return request(app)
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Bad request");
      });
  });
});
describe.only("DELETE /api/users/:user_id", () => {
  test("should delete a review using review_id", () => {
    return request(app)
      .delete("/api/users/63ce75449ae462be0adad72a")
      .expect(204)
  });
  test("should return a 404 when provided an non-existant user_id", () => {
    return request(app)
      .delete("/api/users/63ce75449ae462be0adad98e")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Content not found");
      });
  });

  test("should return a 400 when given an invalid user ID", () => {
    return request(app)
      .delete("/api/users/fake-user-ID")
      .expect(404)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Content not found");
      });
  });
});