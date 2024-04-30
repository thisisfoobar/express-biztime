/** routes for invoices */

const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");

// GET all invoices
router.get("/", async (req, res, next) => {
  try {
    const results = await db.query(`SELECT id,comp_code FROM invoices`);
    return res.json({ invoices: results.rows });
  } catch (e) {
    return next(e);
  }
});

// POST create new invoice
router.post("/", async (req, res, next) => {
  try {
    const { comp_code, amt } = req.body;
    const results = await db.query(
      `INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date`,
      [comp_code, amt]
    );
    return res.status(201).json({ invoice: results.rows[0] });
  } catch (e) {
    return next(e);
  }
});

// GET specific invoice
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT i.id, i.comp_code, i.amt, i.paid, i.add_date, i.paid_date, c.name, c.description
            FROM invoices AS i
            INNER JOIN companies AS c ON (i.comp_code = c.code)
            WHERE id = $1`,
      [id]
    );
    if (result.rows.length === 0)
      throw new ExpressError(`Can't find invoice with id of ${id}`, 404);

    const data = result.rows[0];
    const invoice = {
      id: data.id,
      amt: data.amt,
      paid: data.paid,
      add_date: data.add_date,
      paid_date: data.paid_date,
      company: {
        code: data.comp_code,
        name: data.name,
        description: data.description,
      },
    };

    return res.send({ invoice: invoice });
  } catch (e) {
    return next(e);
  }
});

// PUT update specific invoice
router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const checkPaid = await db.query(
      `SELECT paid_date,paid FROM invoices WHERE id = $1`,
      [id]
    );
    let paid_date;

    let { amt, paid } = req.body;
    if (paid === true && checkPaid.rows[0].paid_date === null) {
      paid_date = new Date().toJSON();
    } else if (paid === false) {
      paid_date = null;
    } else {
      paid_date = checkPaid.rows[0].paid_date;
      paid = checkPaid.rows[0].paid;
    }
    const result = await db.query(`UPDATE invoices SET amt=$1, paid=$2, paid_date=$3 WHERE id = $4 RETURNING id, comp_code, amt, paid, add_date, paid_date`, [amt,paid,paid_date,id])
    if (result.rows.length === 0) throw new ExpressError(`Can't find invoice with id of ${id}`, 404)
    return res.send({
      invoice: result.rows[0]
    });
  } catch (e) {
    return next(e);
  }
});

// DELETE specific invoice
router.delete("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const results = await db.query(
      `DELETE FROM invoices WHERE id = $1 RETURNING id`,
      [id]
    );
    if (results.rows.length === 0)
      throw new ExpressError(`Can't find invoice with id ${id}`, 404);
    return res.json({ status: "deleted" });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
