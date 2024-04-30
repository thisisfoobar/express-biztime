// put in test mode
process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const db = require("../db");
const { createData } = require("../_test-common");

beforeEach(createData);

afterAll(async () => {
  await db.end();
});

describe("GET /companies", () => {
  test("Get a list of all companies in db", async () => {
    const res = await request(app).get("/companies");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ companies: [{ code: "hoka", name: "HOKA" }] });
  });
});

describe("GET /companies/:code", () => {
  test("Get a single company from db", async () => {
    const res = await request(app).get("/companies/hoka");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      company: { code: "hoka", name: "HOKA", description: "Thick boi shoes", invoices: [1] },
    });
  });
  test("Invalid company code", async () => {
    const res = await request(app).get("/companies/adidas");
    expect(res.statusCode).toBe(404);
  });
});

describe("POST /companies", () => {
  test("Creat a single company", async () => {
    const res = await request(app)
      .post("/companies")
      .send({ code: "adidas", name: "Adidas", description: "Running company" });
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      company: {
        code: "adidas",
        name: "Adidas",
        description: "Running company",
      },
    });
  });
  test("Creat a single company without a code", async () => {
    const res = await request(app)
      .post("/companies")
      .send({ name: "Asics", description: "Running company" });
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      company: {
        code: expect.any(String),
        name: "Asics",
        description: "Running company",
      },
    });
  });
});

describe("PUT /companies/:code", () => {
  test("Update a single company", async () => {
    const res = await request(app)
      .put(`/companies/hoka`)
      .send({ name: "HOKA", description: "Premium running brand" });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      company: {
        code: "hoka",
        name: "HOKA",
        description: "Premium running brand",
      },
    });
  });
  test("Respond with 404 for invalid code", async () => {
    const res = await request(app).put(`/companies/nike`).send({
      name: "Nike",
      description: "Running brand shady of athlete payments",
    });
    expect(res.statusCode).toBe(404);
  });
});

describe("DELETE /companies/:code", () => {
  test("Delete single company", async () => {
    const res = await request(app).delete(`/companies/hoka`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: "deleted" });
  });
});
