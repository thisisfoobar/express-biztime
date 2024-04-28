// put in test mode
process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const db = require("../db");

let testCompany;
beforeAll(async () => {
  await db.query("DELETE FROM companies");
  await db.query("DELETE FROM invoices");
});
beforeEach(async () => {
  const result = await db.query(
    `INSERT INTO companies (code, name, description) VALUES ('hoka','HOKA','Thick boi shoes') RETURNING code, name, description`
  );
  testCompany = result.rows[0];
});
afterEach(async () => {
  await db.query(`DELETE FROM companies`);
  await db.query(`DELETE FROM invoices`);
});

afterAll(async () => {
  await db.end();
});

describe("GET /companies", () => {
  test("Get a list of all companies in db", async () => {
    const res = await request(app).get("/companies");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ companies: [testCompany] });
  });
});

describe("GET /companies/:code", () => {
  test("Get a single company from db", async () => {
    const res = await request(app).get("/companies/hoka");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ company: testCompany });
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
});

describe("PUT /companies/:code", () => {
  test("Update a single company", async () => {
    const res = await request(app)
      .put(`/companies/${testCompany.code}`)
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
    const res = await request(app)
      .put(`/companies/nike`)
      .send({
        name: "Nike",
        description: "Running brand shady of athlete payments",
      });
    expect(res.statusCode).toBe(404);
  });
});

describe("DELETE /companies/:code", () => {
    test("Delete single company", async () => {
        const res = await request(app)
        .delete(`/companies/${testCompany.code}`)
        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual({status: "deleted"})
    })
});
