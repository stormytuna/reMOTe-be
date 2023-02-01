const { beforeAll, afterAll, beforeEach, expect } = require("@jest/globals");
const userData = require("../db/data/test.json");
const request = require("supertest");
const app = require("../app");
const { connect } = require("../db/start-connection");
const { disconnect } = require("../db/end-connection");
const { seedTest } = require("../db/seed-test");
const mongoose = require("mongoose");

beforeAll(() => {
  return connect();
});

beforeEach(() => {
  return seedTest();
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
        expect(technicians).toHaveLength(3);
        technicians.forEach((technician) => {
          expect(technician.technician.services.length).toBeGreaterThan(0);
        });
      });
  });

  test("status:200, responds with an array of technicians filtered by services they provide", () => {
    return request(app)
      .get("/api/technicians?service=servicing")
      .expect(200)
      .then(({ body }) => {
        const { technicians } = body;
        expect(technicians).toBeInstanceOf(Array);
        expect(technicians).toHaveLength(2);
        expect(technicians[0].technician.services[0].name).toBe(
          "Servicing and MOT"
        );
      });
  });

  test("status:200, responds with an array of technicians filtered by services they provide with spaces in the query", () => {
    return request(app)
      .get("/api/technicians?service=servicing+and+mot")
      .expect(200)
      .then(({ body }) => {
        const { technicians } = body;
        expect(technicians).toBeInstanceOf(Array);
        expect(technicians).toHaveLength(2);
        expect(technicians[0].technician.services[0].name).toBe(
          "Servicing and MOT"
        );
      });
  });

  test("status:200, responds with an array of technicians sorted by their average rating", () => {
    return request(app)
      .get("/api/technicians?sort_by=rating")
      .expect(200)
      .then(({ body }) => {
        const { technicians } = body;
        // Not 100% sure about this test but I can't think of a better way to test
        expect(technicians).toEqual(
          technicians.sort((cur, pre) => {
            const curTotalRatings = cur.technician.reviews.reduce(
              (pre, cur) => {
                return pre + cur.rating;
              },
              0
            );
            const curRating = curTotalRatings / cur.technician.reviews.length;

            const preTotalRatings = pre.technician.reviews.reduce(
              (pre, cur) => {
                return pre + cur.rating;
              },
              0
            );
            const preRating = preTotalRatings / pre.technician.reviews.length;

            return preRating - curRating;
          })
        );
      });
  });

  test("status:200, responds with an array of technicians sorted by their review count", () => {
    return request(app)
      .get("/api/technicians?sort_by=reviews")
      .expect(200)
      .then(({ body }) => {
        const { technicians } = body;
        expect(technicians).toEqual(
          technicians.sort((cur, pre) => {
            const curReviews = cur.technician.reviews.length;
            const preReviews = pre.technician.reviews.length;
            return preReviews - curReviews;
          })
        );
      });
  });

  test("status:200, responds with an array of technicians sorted by their average review count descending", () => {
    return request(app)
      .get("/api/technicians?sort_by=reviews&order=desc")
      .expect(200)
      .then(({ body }) => {
        const { technicians } = body;
        expect(technicians).toEqual(
          technicians.sort((cur, pre) => {
            const curReviews = cur.technician.reviews.length;
            const preReviews = pre.technician.reviews.length;
            return curReviews - preReviews;
          })
        );
      });
  });
});

describe("GET /api/users", () => {
  test("status:200, responds with an array of users", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body }) => {
        const { users } = body;
        expect(users).toBeInstanceOf(Array);
        users.forEach((user) => {
          expect(user.technician).toBeNull();
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
  test("status:200, responds with the technician with the given ID", () => {
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

  test("status:404, responds with an appropriate error message when given user ID doesn't exist", () => {
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
  test("status:200, responds with the updated technician", () => {
    const patchData = { name: "Tyre Replacement", price: 50 };
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

  test("status:400, responds with an appropriate error message when given malformed body", () => {
    const patchData = { wgrfwsfsfs: "Tyre Replacement", arafa: 50 };
    return request(app)
      .patch("/api/technicians/63ce75449ae462be0adad72d")
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
      .patch("/api/technicians/63ce75449ae462be0adad72d")
      .send(patchData)
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Bad request");
      });
  });

  test("status:400, responds with an appropriate error message when given user ID is invalid", () => {
    const patchData = { name: "Tyre Replacement", price: 50 };
    return request(app)
      .patch("/api/technicians/totally-real-user-id")
      .send(patchData)
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Bad request");
      });
  });

  test("status:404, responds with an appropriate error message when given user ID doesn't exist", () => {
    const patchData = { name: "Tyre Replacement", price: 50 };
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
  test("status:201, responds with the updated reviews array", () => {
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

  test("status:404, responds with an appropriate error message when given user ID doesn't exist", () => {
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

  test("status:400, responds with an appropriate error message when given user ID is invalid", () => {
    return request(app)
      .delete("/api/technicians/totally-a-real-user")
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Bad request");
      });
  });

  test("status:404, responds with an appropriate error message when given user ID doesn't exist", () => {
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
            reviewee: {
              username: expect.any(String),
              name: expect.any(String),
              avatarUrl: expect.any(String),
            },
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
  test("status:204, responds with nothing and removes the given review", () => {
    return request(app)
      .delete("/api/63ce75449ae462be0adad72e/reviews/63ce75449ae462be0adae13a")
      .expect(204);
  });

  test("status:404, responds with an appropriate error message when given user ID doesn't exist", () => {
    return request(app)
      .delete("/api/63ce75449ae462be0adad98e/reviews/63ce75449ae462be0adae13a")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Content not found");
      });
  });

  test("status:404, responds with an appropriate error message when given review ID doesn't exist", () => {
    return request(app)
      .delete("/api/63ce75449ae462be0adad72e/reviews/63ce75449ae462be0adae57a")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Content not found");
      });
  });

  test("status:400, responds with an appropriate error message when given user ID is invalid", () => {
    return request(app)
      .delete("/api/fake-user-ID/reviews/63ce75449ae462be0adae13a")
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Bad request");
      });
  });

  test("status:400, responds with an appropriate error message when given review ID is invalid", () => {
    return request(app)
      .delete("/api/63ce75449ae462be0adad72e/reviews/totally-a-real-id")
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Bad request");
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

  test("status:400, responds with an appropriate error message when given body fails schema validation", () => {
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

  test("status:400, responds with an appropriate error message when given user ID is invalid", () => {
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

  test("status:404, responds with an appropriate error message when given user ID doesn't exist", () => {
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

describe("PATCH /api/users/:user_id/reviews/:review_id", () => {
  const patchData = {
    reviewBody:
      "Very good to service :), needs to clean their boot out though! it's full of clothes!",
    rating: 7,
    reviewedBy: "63ce75449ae462be0adad72d",
    _id: "63ce75449ae462be0adae13a",
  };

  test("status:200, responds with the updated review", () => {
    return request(app)
      .patch(
        "/api/users/63ce75449ae462be0adad72e/reviews/63ce75449ae462be0adae13a"
      )
      .send(patchData)
      .expect(200)
      .then(({ body }) => {
        const { review } = body;
        expect(review._id).toEqual("63ce75449ae462be0adad72e");
        let result = "";
        review.reviews.forEach((review) => {
          if (review.reviewBody === patchData.reviewBody)
            return (result = true);
          return (result = false);
        });
        expect(result).toBe(true);
      });
  });

  test("status:400, responds with an appropriate error message when given malformed body", () => {
    const patchData = {
      revBody:
        "Very good to service :), needs to clean their boot out though! it's full of clothes!",
      rate: 7,
      reviewedBy: "63ce75449ae462be0adad72d",
      _id: "63ce75449ae462be0adae13a",
    };
    return request(app)
      .patch(
        "/api/users/63ce75449ae462be0adad72e/reviews/63ce75449ae462be0adae13a"
      )
      .send(patchData)
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Bad request");
      });
  });

  test("status:400, responds with an appropriate error message when given body fails schema validation", () => {
    const patchData = {
      reviewBody: true,
      rating: "a string",
      reviewedBy: "63ce75449ae462be0adad72d",
      _id: "63ce75449ae462be0adae13a",
    };
    return request(app)
      .patch(
        "/api/users/63ce75449ae462be0adad72e/reviews/63ce75449ae462be0adae13a"
      )
      .send(patchData)
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Bad request");
      });
  });

  test("status:400, responds with an appropriate error message when given user ID is invalid", () => {
    return request(app)
      .patch("/api/users/totally-a-real-user/reviews/63ce75449ae462be0adae13a")
      .send(patchData)
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Bad request");
      });
  });

  test("status:400, responds with an appropriate error message when given review ID is invalid", () => {
    return request(app)
      .patch(
        "/api/users/63ce75449ae462be0adad72e/reviews/totally-a-real-review-id"
      )
      .send(patchData)
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Bad request");
      });
  });

  test("status:404, responds with an appropriate error message when given user ID doesn't exist", () => {
    return request(app)
      .patch(
        "/api/users/63ce75449ae462be0adad84e/reviews/63ce75449ae462be0adae13a"
      )
      .send(patchData)
      .expect(404)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Content not found");
      });
  });

  test("status:404, responds with an appropriate error message when given review ID doesn't exist", () => {
    const patchData = {
      reviewBody:
        "Very good to service :), needs to clean their boot out though! it's full of clothes!",
      rating: 7,
      reviewedBy: "63ce75449ae462be0adad72d",
      _id: "63ce75449ae462be0adae20a",
    };
    return request(app)
      .patch(
        "/api/users/63ce75449ae462be0adad72e/reviews/63ce75449ae462be0adae20a"
      )
      .send(patchData)
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

  test("status:400, responds with an appropriate error message when given body fails schema validation", () => {
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
});

describe("GET /api/users/:user_id/orders", () => {
  const ordersData = [
    {
      services: [
        {
          name: "Servicing and MOT",
          price: 120,
          description: "Serviced and MOTed. Requires clutch repairs",
        },
        {
          name: "Clutch repairs",
          price: 200,
          description: "clutch repairs to pass MOT",
        },
      ],
      createdAt: "2020-05-18T14:10:30.000Z",
      fulfilledAt: "2020-05-28T14:09:10.000Z",
      servicedBy: "63ce75449ae462be0adad72e",
    },
    {
      services: [
        {
          name: "Breakdown and recovery",
          price: 150,
          description:
            "Ran out of fuel causing engine to stall and battery to die",
        },
      ],
      createdAt: "2021-08-18T14:12:30.000Z",
      fulfilledAt: "2021-08-18T14:13:30.000Z",
      servicedBy: "63ce75449ae462be0adad72e",
    },
  ];

  test("status:200, responds with an array of the given users orders", () => {
    return request(app)
      .get("/api/users/63ce75449ae462be0adad72c/orders")
      .expect(200)
      .then(({ body }) => {
        const { orders } = body;
        expect(orders).toMatchObject(ordersData);
      });
  });

  test("status:400, responds with an appropriate error message when given user ID is invalid", () => {
    return request(app)
      .get("/api/users/bad-user-id/orders")
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Bad request");
      });
  });
  test("status:404, responds with an appropriate error message when given user ID doesn't exist", () => {
    return request(app)
      .get("/api/users/63ceaaaaaae462be0adad72a/orders")
      .expect(404)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Content not found");
      });
  });
});

describe("DELETE /api/users/:user_id", () => {
  test("status:204, responds with nothing and removes the given user", () => {
    return request(app)
      .delete("/api/users/63ce75449ae462be0adad72a")
      .expect(204);
  });

  test("status:404, responds with an appropriate error message when given user ID doesn't exist", () => {
    return request(app)
      .delete("/api/users/63ce75449ae462be0adad98e")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Content not found");
      });
  });

  test("status:400, responds with an appropriate error message when given user ID is invalid", () => {
    return request(app)
      .delete("/api/users/fake-user-ID")
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Bad request");
      });
  });
});

describe("POST /api/users/:user_id/orders", () => {
  const newOrder = {
    services: [
      {
        name: "Tyres, wheels and tracking",
        price: 100,
        description:
          "Tracking was causing car to veer left which had worn tires out on right side, needed replacing",
      },
    ],
    createdAt: "2023-01-18T14:12:30Z",
    fulfilledAt: Date.now(),
    servicedBy: "63ce75449ae462be0adad72e",
  };

  test("status:201, responds with the newly created order", () => {
    const expected = [
      {
        services: [
          {
            name: "Servicing and MOT",
            price: 120,
            description: "Serviced and MOTed. Requires clutch repairs",
          },
          {
            name: "Clutch repairs",
            price: 200,
            description: "clutch repairs to pass MOT",
          },
        ],
        createdAt: "2020-05-18T14:10:30.000Z",
        fulfilledAt: "2020-05-28T14:09:10.000Z",
        servicedBy: "63ce75449ae462be0adad72e",
      },
      {
        services: [
          {
            name: "Breakdown and recovery",
            price: 150,
            description:
              "Ran out of fuel causing engine to stall and battery to die",
          },
        ],
        createdAt: "2021-08-18T14:12:30.000Z",
        fulfilledAt: "2021-08-18T14:13:30.000Z",
        servicedBy: "63ce75449ae462be0adad72e",
      },
      {
        services: [
          {
            name: "Tyres, wheels and tracking",
            price: 100,
            description:
              "Tracking was causing car to veer left which had worn tires out on right side, needed replacing",
          },
        ],
        createdAt: expect.any(String),
        fulfilledAt: expect.any(String),
        servicedBy: "63ce75449ae462be0adad72e",
      },
    ];
    return request(app)
      .post("/api/users/63ce75449ae462be0adad72c/orders")
      .send(newOrder)
      .expect(201)
      .then(({ body }) => {
        const { orders } = body;
        expect(orders).toMatchObject(expected);
      });
  });

  test("status:400, responds with an appropriate error message when given malformed body", () => {
    const badData = {
      servs: [
        {
          name: "Tyres, wheels and tracking",
          price: 100,
          description:
            "Tracking was causing car to veer left which had worn tires out on right side, needed replacing",
        },
      ],
      creaasdtedAt: "2023-01-18T14:12:30Z",
      fudAt: Date.now(),
      serdBy: "63ce75449ae462be0adad72e",
    };
    return request(app)
      .post("/api/users/63ce75449ae462be0adad72c/orders")
      .send(badData)
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Bad request");
      });
  });

  test("status:400, responds with an appropriate error message when given body fails schema validation", () => {
    const terribleData = {
      services: {
        name: "Tyres, wheels and tracking",
        price: 100,
        description:
          "Tracking was causing car to veer left which had worn tires out on right side, needed replacing",
      },
      createdAt: 40,
      fulfilledAt: Date.now(),
      servicedBy: true,
    };
    return request(app)
      .post("/api/users/63ce75449ae462be0adad72c/orders")
      .send(terribleData)
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Bad request");
      });
  });

  test("status:400, responds with an appropriate error message when given user ID is invalid", () => {
    return request(app)
      .post("/api/users/63ce7544aaaaa2be0adad72f/orders")
      .send(newOrder)
      .expect(404)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Content not found");
      });
  });

  test("status:404, responds with an appropriate error message when given user ID doesn't exist", () => {
    return request(app)
      .post("/api/users/not-a-user-id/orders")
      .send(newOrder)
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Bad request");
      });
  });
});

describe("PATCH /api/users/:user_id/orders/:order_id", () => {
  const orderPatch = {
    services: [
      { name: "Servicing and MOT", price: 80, description: "MOT passed" },
    ],
  };

  test("status:200, responds with the updated orders array", () => {
    const expected = [
      {
        services: [
          { name: "Servicing and MOT", price: 80, description: "MOT passed" },
        ],
        createdAt: "2020-05-18T14:10:30.000Z",
        fulfilledAt: "2020-05-28T14:09:10.000Z",
        servicedBy: "63ce75449ae462be0adad72e",
      },
      {
        services: [
          {
            name: "Breakdown and recovery",
            price: 150,
            description:
              "Ran out of fuel causing engine to stall and battery to die",
          },
        ],
        createdAt: "2021-08-18T14:12:30.000Z",
        fulfilledAt: "2021-08-18T14:13:30.000Z",
        servicedBy: "63ce75449ae462be0adad72e",
      },
    ];
    return request(app)
      .patch(
        "/api/users/63ce75449ae462be0adad72c/orders/63ce75449ae462be0adad23a"
      )
      .send(orderPatch)
      .expect(200)
      .then(({ body }) => {
        const { orders } = body;
        expect(orders).toMatchObject(expected);
      });
  });

  test("status:400, responds with an appropriate error message when given body fails schema validation", () => {
    const badPatch = {
      services: [
        { name: "Servicing and MOT", price: "aaaa", description: "MOT passed" },
      ],
    };
    return request(app)
      .patch(
        "/api/users/63ce75449ae462be0adad72c/orders/63ce75449ae462be0adad23a"
      )
      .send(badPatch)
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Bad request");
      });
  });

  test("status:400, responds with an appropriate error message when given malformed body", () => {
    const badPatch = {
      sers: [
        { name: "Servicing and MOT", price: 80, description: "MOT passed" },
      ],
    };
    return request(app)
      .patch(
        "/api/users/63ce75449ae462be0adad72c/orders/63ce75449ae462be0adad23a"
      )
      .send(badPatch)
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Bad request");
      });
  });

  test("status:400, responds with an appropriate error message when given user ID is invalid", () => {
    return request(app)
      .patch(
        "/api/users/totally-a-real-user-id/orders/63ce75449ae462be0adad23a"
      )
      .send(orderPatch)
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Bad request");
      });
  });

  test("status:400, responds with an appropriate error message when given order ID is invalid", () => {
    return request(app)
      .patch(
        "/api/users/63ce75449ae462be0adad72c/orders/totally-a-real-order-id"
      )
      .send(orderPatch)
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Bad request");
      });
  });

  test("status:404, responds with an appropriate error message when given user ID doesn't exist", () => {
    return request(app)
      .patch(
        "/api/users/63ce75449ae462be0adad45c/orders/63ce75449ae462be0adad23a"
      )
      .send(orderPatch)
      .expect(404)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Content not found");
      });
  });

  test("status:404, responds with an appropriate error message when given order ID doesn't exist", () => {
    return request(app)
      .patch(
        "/api/users/63ce75449ae462be0adad72c/orders/63ce75449ae462be0adad38a"
      )
      .send(orderPatch)
      .expect(404)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Content not found");
      });
  });
});

describe("DELETE /api/technicians/:user_id/reviews/:review_id", () => {
  test("status:204, responds with nothing and removes the given review", () => {
    return request(app)
      .delete(
        "/api/technicians/63ce75449ae462be0adad72e/reviews/63ce75449ae462be0adae55a"
      )
      .expect(204);
  });

  test("status:404, responds with an appropriate error message when given user ID doesn't exist", () => {
    return request(app)
      .delete(
        "/api/technicians/63ce75449ae462be0adad95e/reviews/63ce75449ae462be0adae55a"
      )
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Content not found");
      });
  });

  test("status:404, responds with an appropriate error message when given review ID doesn't exist", () => {
    return request(app)
      .delete(
        "/api/technicians/63ce75449ae462be0adad72e/reviews/63ce75449ae462be0adae66a"
      )
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Content not found");
      });
  });

  test("status:400, responds with an appropriate error message when given user ID is invalid", () => {
    return request(app)
      .delete("/api/technicians/fake-id/reviews/63ce75449ae462be0adae55a")
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Bad request");
      });
  });

  test("status:400, responds with an appropriate error message when given review ID is invalid", () => {
    return request(app)
      .delete(
        "/api/technicians/63ce75449ae462be0adad72e/reviews/not-a-valid-review-id"
      )
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Bad request");
      });
  });
});

describe("DELETE /api/users/:user_id/orders/:order_id", () => {
  test("status:204, responds with nothing and removes the given order", () => {
    return request(app)
      .delete(
        "/api/users/63ce75449ae462be0adad72c/orders/63ce75449ae462be0adad23a"
      )
      .expect(204);
  });

  test("status:404, responds with an appropriate error message when given user ID doesn't exist", () => {
    return request(app)
      .delete(
        "/api/users/63ce75449ae462be0adad17c/orders/63ce75449ae462be0adad23a"
      )
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Content not found");
      });
  });

  test("status:404, responds with an appropriate error message when given order ID doesn't exist", () => {
    return request(app)
      .delete(
        "/api/users/63ce75449ae462be0adad72c/orders/63ce75449ae462be0adad39a"
      )
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Content not found");
      });
  });

  test("status:400, responds with an appropriate error message when given user ID is invalid", () => {
    return request(app)
      .delete("/api/users/fake-user-ID/orders/63ce75449ae462be0adad23a")
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Bad request");
      });
  });

  test("status:400, responds with an appropriate error message when given order ID is invalid", () => {
    return request(app)
      .delete("/api/users/63ce75449ae462be0adad72c/orders/not-a-valid-order")
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Bad request");
      });
  });
});
