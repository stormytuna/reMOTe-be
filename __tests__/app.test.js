const { beforeAll, afterAll, beforeEach } = require("@jest/globals");
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
            reviews: [],
          },
          reviews: [],
          avatarUrl: "https://i.imgur.com/pN04qjy.jpg",
        });
      });
  });
});
