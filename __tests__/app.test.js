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

describe('PATCH /api/technicians/:user_id', () => {
  const patchData = {
      services: [
        "Servicing and MOT",
        "Clutch repairs",
        "Engine and cooling",
        "Tyre Replacement",
        "General Servicing"
      ]
  }
  test('should accept an object of services, update the technician, and return it', () => {
  const newTechnician = {
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
        "Tyre Replacement",
        "General Servicing"
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
  }
  return request(app)
  .patch("/api/technicians/63ce75449ae462be0adad72d")
  .send(patchData)
  .expect(200)
  .then(({ body }) => {
    expect(body).toEqual({...newTechnician})
  })
  });
});
