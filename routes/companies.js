/** routes for companies */

const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");
const slugify = require("slugify")

// GET list of all companies
router.get("/", async (req, res, next) => {
  try {
    const results = await db.query(`SELECT code,name FROM companies`);
    return res.json({ companies: results.rows });
  } catch (e) {
    return next(e);
  }
});

// POST a new company
router.post("/", async (req, res, next) => {
  try {
    let { code, name, description } = req.body;
    if (!req.body.code) {
      code = slugify(name,{lower:true})
    }
    const results = await db.query(
      `INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description`,
      [code, name, description]
    );
    return res.status(201).json({ company: results.rows[0] });
  } catch (e) {
    return next(e);
  }
});

// GET specific company based on code
router.get("/:code", async (req, res, next) => {
  try {
    const { code } = req.params;
    const compResult = await db.query(`SELECT *
    FROM companies
    WHERE code = $1`, [code]);

    const indResults = await db.query(`SELECT i.industry
    FROM industries i
    JOIN industries_companies ic ON i.code = ic.ind_code
    WHERE ic.comp_code = $1`,[code])

    const invResults = await db.query(`SELECT id
    FROM invoices
    WHERE comp_code = $1`, [code])

    if (compResult.rows.length === 0)
      throw new ExpressError(`Can't find company with code ${code}`, 404);

    const company = compResult.rows[0];
    const invoices = invResults.rows;
    const industries = indResults.rows;
    company.invoices = invoices.map(inv => inv.id)
    company.industries = industries.map(ind => ind.industry)    

    return res.send({ company: company });
  } catch (e) {
    next(e);
  }
});

// PUT edit an existing company based on code
router.put("/:code", async (req, res, next) => {
  try {
    const { code } = req.params;
    const { name, description } = req.body;
    const results = await db.query(
      `UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING code, name, description`,
      [name, description, code]
    );
    if (results.rows.length === 0)
      throw new ExpressError(`Can't find company with code ${code}`, 404);
    return res.send({ company: results.rows[0] });
  } catch (e) {
    next(e);
  }
});

// DELETE a company based on code
router.delete("/:code", async (req, res, next) => {
  try {
    const code = req.params.code;
    const results = await db.query(
      `DELETE FROM companies WHERE code = $1 RETURNING code`,
      [code]
    );
    console.log(results)
    if (results.rows.length == 0)
      throw new ExpressError(`Can't find company with code ${code}`, 404);
    return res.json({ status: "deleted" });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
