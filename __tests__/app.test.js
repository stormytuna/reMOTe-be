const { beforeAll, afterAll, beforeEach, expect } = require("@jest/globals");
const userData = require("../db/data/test.json");
const request = require("supertest");
const app = require("../app");
const { connect } = require("../db/start-connection");
const { disconnect } = require("../db/end-connection");
const { seed } = require("../db/seed-test");

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
  test("status:200, responds with a technicians array", () => {
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
        postCode: "KF76 9LM",
      },
      contact: {
        phoneNumber: "07470761588",
        email: "ahmedhussain@gmail.com",
      },
      technician: {
        services: [
          "Servicing and MOT",
          "Clutch repairs",
          "Engine and cooling",
          "Valleting",
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
        expect(technician).toEqual({
          _id: expect.any(String),
          __v: expect.any(Number),
          username: "ahmedH",
          firstName: "Ahmed",
          lastName: "Hussian",
          address: {
            addressLine: "1 Random Place",
            postCode: "KF76 9LM",
          },
          contact: {
            phoneNumber: "07470761588",
            email: "ahmedhussain@gmail.com",
          },
          technician: {
            services: [
              "Servicing and MOT",
              "Clutch repairs",
              "Engine and cooling",
              "Valleting",
            ],
            reviews: [
              {
                _id: expect.any(String),
                reviewBody: "Very good services :)",
                rating: 4,
                reviewedBy: 1,
              },
              {
                _id: expect.any(String),
                reviewBody: "Bad >:(",
                rating: 1,
                reviewedBy: 2,
              },
            ],
          },
          reviews: [],
          avatarUrl: "https://i.imgur.com/pN04qjy.jpg",
        });
      });
  });
});

describe("GET /api/technicians/:user_id", () => {
  test("status:200, responds with a technician with the given id", () => {
    return request(app)
      .get("/api/technicians/63ce75449ae462be0adad72d")
      .expect(200)
      .then(({ body }) => {
        const { technician } = body;
        expect(technician).toEqual({
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
            phoneNumber: "32985262985",
            email: "jameswright@company.com",
          },
          technician: {
            services: [
              "Servicing and MOT",
              "Clutch repairs",
              "Engine and cooling",
            ],
            reviews: [
              {
                _id: expect.any(String),
                reviewBody: "Very good services :)",
                rating: 4,
                reviewedBy: 1,
              },
              {
                _id: expect.any(String),
                reviewBody: "Bad >:(",
                rating: 1,
                reviewedBy: 2,
              },
            ],
          },
          reviews: [],
          avatarUrl: "https://i.imgur.com/pN04qjy.jpg",
        });
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
        reviewedBy: 15,
      })
      .expect(201)
      .then(({ body }) => {
        const { user } = body;
        expect(user._id).toEqual("63ce75449ae462be0adad72a");
        expect(user.reviews).toHaveLength(1);
        expect(user.reviews[0]).toMatchObject({
          reviewBody: "This is a test review",
          rating: 3,
          reviewedBy: 15,
        });
      });
  });

  test("status:400, responds with an appropriate error message when given a malformed body", () => {
    return request(app)
      .post("/api/users/63ce75449ae462be0adad72a/reviews")
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

  test("status:400, responds with an appropriate error message when given a review that fails schema validation", () => {
    return request(app)
      .post("/api/users/63ce75449ae462be0adad72a/reviews")
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

  test("status:400, responds with an appropriate error message when our given user ID isn't valid", () => {
    return request(app)
      .post("/api/users/totally-a-real-user/reviews")
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
});
