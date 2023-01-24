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
        expect(technician).toMatchObject({
          _id: "63ce75449ae462be0adad72d",
          technician: {
            services: expect.any(Array),
            reviews: expect.any(Array),
          },
        });
      });
  });
});

describe('PATCH /api/technicians/:user_id', () => {
  const patchData = {name: 'Tyre Replacement', price: 50}
  test('should accept an object of services, update the technician, and return it', () => {
  return request(app)
  .patch("/api/technicians/63ce75449ae462be0adad72d")
  .send(patchData)
  .expect(200)
  .then(({ body }) => {
    const { updatedTechnician } = body;
    console.log(updatedTechnician)
    expect(updatedTechnician._id).toEqual('63ce75449ae462be0adad72d')
    expect(updatedTechnician.technician.services).toHaveLength(4)
    expect(updatedTechnician.technician.services[3]).toEqual({...patchData, _id: expect.any(String)});
  })
  });
  test('should respond with a 400 when provided with an invalid id', () => {
    return request(app)
      .patch("/api/technicians/63ce75449ae462be0adad72d")
      .send(patchData)
      .expect(200)
      .then(({ body }) => {
        const { technician } = body;
        expect(technician.technician.services).toMatchObject([
          { name: "Servicing and MOT", price: 500 },
          { name: "Clutch repairs", price: 5000 },
        ]);
      });
  });

  test("should respond with a 400 when provided with an invalid id", () => {
    return request(app)
      .patch("/api/technicians/not-an-id")
      .send(patchData)
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Bad Request");
      });
  });

  test("should respond with a 400 when id not found", () => {
    return request(app)
      .patch("/api/technicians/63ce75449ae462be0adad72g")
      .send(patchData)
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Bad Request");
      });
  });
});
