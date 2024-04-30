// put in test mode
process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const db = require("../db");
const { createData } = require("../_test-common");

// before each test reset database
beforeEach(createData);

afterAll(async () => {
  await db.end();
});

describe("GET /invoices", () => {
  test("Get a list of all invoices in db", async () => {
    const res = await request(app).get("/invoices");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      invoices: [{ id: 1, comp_code: "hoka" }],
    });
  });
});

describe("GET /invoices/:code", () => {
  test("Get a single invoice from db", async () => {
    const res = await request(app).get(`/invoices/1`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      invoice: {
        id: 1,
        company: {
          code: "hoka",
          name: "HOKA",
          description: "Thick boi shoes"
        },
        amt: 100,
        paid: false,
        add_date: "2024-04-23T04:00:00.000Z",
        paid_date: null,
      },
    });
  });
  test("Invalid invoice id", async () => {
    const res = await request(app).get("/invoices/200");
    expect(res.statusCode).toBe(404);
  });
});

describe("POST /invoices", () => {
  test("Creat a single invoice", async () => {
    const res = await request(app)
      .post("/invoices")
      .send({ comp_code: "hoka", amt: 2000 });
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      invoice: {
        id: 2,
        comp_code: "hoka",
        amt: 2000,
        paid: false,
        add_date: expect.any(String),
        paid_date: null,
      },
    });
  });
});

describe("PUT /invoices/:code", () => {
  test("Update a single invoice", async () => {
    const res = await request(app).put(`/invoices/1`).send({ amt: 5000 });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      invoice: {
        id: 1,
        comp_code: "hoka",
        amt: 5000,
        paid: false,
        add_date: "2024-04-23T04:00:00.000Z",
        paid_date: null,
      },
    });
  });
  test("Respond with 404 for invalid code", async () => {
    const res = await request(app).put(`/invoices/123456789`).send({
      amt: 123456,
    });
    expect(res.statusCode).toBe(404);
  });
});

describe("DELETE /invoices/:code", () => {
  test("Delete single invoice", async () => {
    const res = await request(app).delete(`/invoices/1`);
    expect(res.body).toEqual({ status: "deleted" });
  });
});
