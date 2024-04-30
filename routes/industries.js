/** routes for industries */

const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");
const slugify = require("slugify");

// GET list of all companies
router.get("/", async (req, res, next) => {
  try {
    const results = await db.query(`SELECT i.industry, i.code, STRING_AGG(ic.comp_code, ', ') AS associated_company_codes
    FROM industries i
    JOIN industries_companies ic ON i.code = ic.ind_code
    GROUP BY i.industry,i.code`);
    return res.json({ industries: results.rows });
  } catch (e) {
    return next(e);
  }
});

// POST a new company
router.post("/", async (req, res, next) => {
  try {
    let { code, industry } = req.body;
    if (!req.body.code) {
      code = slugify(name, { lower: true });
    }
    const results = await db.query(
      `INSERT INTO industries (code, industry) VALUES ($1, $2) RETURNING code, industry`,
      [code, industry]
    );
    return res.status(201).json({ industry: results.rows[0] });
  } catch (e) {
    return next(e);
  }
});

// PUT edit an existing company based on code
router.put("/:ind_code", async (req, res, next) => {
  try {
    const { ind_code } = req.params;
    const { comp_code } = req.body;
    
    const industryCheck = await db.query(`SELECT *
    FROM industries
    WHERE code = $1`,[ind_code])
    if (industryCheck.rows.length === 0) throw new ExpressError(`Can't find industry with code ${ind_code}`, 404)

    const companyCheck = await db.query(`SELECT *
    FROM companies
    WHERE code = $1`,[comp_code])
    if (companyCheck.rows.length === 0)
      throw new ExpressError(`Can't find company with code ${code}`, 404);

    const results = await db.query(
      `INSERT INTO industries_companies (ind_code,comp_code) VALUES ($1,$2) RETURNING ind_code, comp_code`,
      [ind_code, comp_code]
    );
    
    return res.send({ association: "success" });
  } catch (e) {
    next(e);
  }
});

module.exports = router;